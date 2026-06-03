import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminDb, requireRole } from '../../_lib/admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { matchId, action } = req.query;
  if (!matchId || typeof matchId !== 'string') {
    return res.status(400).json({ error: 'matchId required' });
  }

  if (req.method === 'POST' && action === 'start') return startMatch(req, res, matchId);
  if (req.method === 'POST' && action === 'end') return endMatch(req, res, matchId);
  return res.status(405).json({ error: 'Method not allowed' });
}

async function startMatch(req: VercelRequest, res: VercelResponse, matchId: string) {
  try {
    const { decoded } = await requireRole(req.headers.authorization, 'host');
    const db = getAdminDb();

    const matchDoc = await db.collection('matches').doc(matchId).get();
    if (!matchDoc.exists) return res.status(404).json({ error: 'Match not found' });

    const match = matchDoc.data()!;
    if (match.hostId !== decoded.uid) return res.status(403).json({ error: 'Not your match' });
    if (!['upcoming', 'toss'].includes(match.status)) {
      return res.status(400).json({ error: 'Match cannot be started in current state' });
    }

    const { toss } = req.body;
    if (!toss?.winner || !toss?.decision) {
      return res.status(400).json({ error: 'Toss result required' });
    }

    // Determine batting/bowling order based on toss
    const tossWinnerBats = toss.decision === 'bat';
    let battingTeamInnings1: 'teamA' | 'teamB';

    if (toss.winner === 'teamA') {
      battingTeamInnings1 = tossWinnerBats ? 'teamA' : 'teamB';
    } else {
      battingTeamInnings1 = tossWinnerBats ? 'teamB' : 'teamA';
    }

    const bowlingTeamInnings1 = battingTeamInnings1 === 'teamA' ? 'teamB' : 'teamA';

    const innings = match.innings.map((inn: Record<string, unknown>, idx: number) => ({
      ...inn,
      battingTeam: idx === 0 ? battingTeamInnings1 : bowlingTeamInnings1,
      bowlingTeam: idx === 0 ? bowlingTeamInnings1 : battingTeamInnings1,
    }));

    await db.collection('matches').doc(matchId).update({
      status: 'live',
      toss: { ...toss, timestamp: new Date() },
      innings,
      startedAt: new Date(),
      updatedAt: new Date(),
    });

    // Create notification
    await db.collection('notifications').add({
      userId: 'broadcast',
      title: 'Match Started!',
      body: `${match.teamA.name} vs ${match.teamB.name} is now LIVE`,
      type: 'match_started',
      matchId,
      isRead: false,
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true, message: 'Match started' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}

async function endMatch(req: VercelRequest, res: VercelResponse, matchId: string) {
  try {
    const { decoded } = await requireRole(req.headers.authorization, 'host');
    const db = getAdminDb();

    const matchDoc = await db.collection('matches').doc(matchId).get();
    if (!matchDoc.exists) return res.status(404).json({ error: 'Match not found' });

    const match = matchDoc.data()!;
    if (match.hostId !== decoded.uid) return res.status(403).json({ error: 'Not your match' });

    const { result, playerOfMatch } = req.body;

    await db.collection('matches').doc(matchId).update({
      status: 'completed',
      result,
      playerOfMatch: playerOfMatch || null,
      completedAt: new Date(),
      updatedAt: new Date(),
    });

    // Update player career stats via background job trigger
    await db.collection('statsJobs').add({
      type: 'update_after_match',
      matchId,
      status: 'pending',
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true, message: 'Match ended' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
