import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminDb, requireRole, verifyToken } from './_lib/admin';
import { z } from 'zod';

const CreateMatchSchema = z.object({
  teamAId: z.string().min(1),
  teamBId: z.string().min(1),
  venue: z.string().min(1),
  city: z.string().optional(),
  format: z.enum(['T10', 'T20', 'ODI', 'Test', 'Custom']),
  totalOvers: z.number().min(1).max(90),
  scheduledAt: z.string(),
  isPublic: z.boolean().default(true),
  tournamentId: z.string().optional(),
  drsEnabled: z.boolean().default(false),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    return createMatch(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function createMatch(req: VercelRequest, res: VercelResponse) {
  try {
    const { decoded, userData } = await requireRole(req.headers.authorization, 'host');
    const db = getAdminDb();

    const parsed = CreateMatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });
    }

    const data = parsed.data;

    // Verify teams exist
    const [teamADoc, teamBDoc] = await Promise.all([
      db.collection('teams').doc(data.teamAId).get(),
      db.collection('teams').doc(data.teamBId).get(),
    ]);

    if (!teamADoc.exists || !teamBDoc.exists) {
      return res.status(400).json({ error: 'One or more teams not found' });
    }

    const teamA = teamADoc.data()!;
    const teamB = teamBDoc.data()!;

    const defaultInnings = {
      totalRuns: 0, totalWickets: 0, totalOvers: 0, totalBalls: 0,
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0, total: 0 },
      batting: [], bowling: [], fallOfWickets: [], partnerships: [], powerplays: [],
      isCompleted: false, allOut: false, declared: false,
    };

    const matchData = {
      teamA: {
        id: data.teamAId,
        name: teamA.name,
        shortName: teamA.shortName,
        logo: teamA.logo || null,
        squad: [],
        playingXI: [],
      },
      teamB: {
        id: data.teamBId,
        name: teamB.name,
        shortName: teamB.shortName,
        logo: teamB.logo || null,
        squad: [],
        playingXI: [],
      },
      venue: data.venue,
      city: data.city || '',
      format: data.format,
      totalOvers: data.totalOvers,
      status: 'upcoming',
      currentInnings: 1,
      innings: [
        { number: 1, battingTeam: 'teamA', bowlingTeam: 'teamB', ...defaultInnings },
        { number: 2, battingTeam: 'teamB', bowlingTeam: 'teamA', ...defaultInnings },
      ],
      isPublic: data.isPublic,
      tournamentId: data.tournamentId || null,
      drsEnabled: data.drsEnabled,
      superOver: false,
      hostId: decoded.uid,
      hostName: userData?.name || decoded.name || 'Host',
      scheduledAt: new Date(data.scheduledAt),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ref = await db.collection('matches').add(matchData);

    // If tournament match, link it
    if (data.tournamentId) {
      const { FieldValue } = await import('firebase-admin/firestore');
      await db.collection('tournaments').doc(data.tournamentId).update({
        matchIds: FieldValue.arrayUnion(ref.id),
        updatedAt: new Date(),
      });
    }

    return res.status(201).json({ success: true, data: { id: ref.id, ...matchData } });
  } catch (err) {
    console.error('[create-match]', err);
    const message = err instanceof Error ? err.message : 'Internal error';
    return res.status(err instanceof Error && message.includes('role') ? 403 : 500).json({ error: message });
  }
}
