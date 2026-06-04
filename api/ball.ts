import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminDb, requireRole } from './_lib/admin';
import { z } from 'zod';

const BallSchema = z.object({
  inningsNumber: z.number().min(1).max(2),
  over: z.number().min(0),
  ball: z.number().min(1).max(6),
  bowlerId: z.string(),
  bowlerName: z.string(),
  batsmanOnStrikeId: z.string(),
  batsmanOnStrikeName: z.string(),
  batsmanNonStrikeId: z.string(),
  batsmanNonStrikeName: z.string(),
  runs: z.number().min(0).max(6),
  batsmanRuns: z.number().min(0).max(6),
  extraType: z.enum(['wide', 'no_ball', 'bye', 'leg_bye']).optional(),
  extraRuns: z.number().min(0).default(0),
  isWicket: z.boolean().default(false),
  wicket: z.object({
    dismissalType: z.string(),
    dismissedPlayerId: z.string(),
    dismissedPlayerName: z.string(),
    fielderId: z.string().optional(),
    fielderName: z.string().optional(),
  }).optional(),
  isFreeHit: z.boolean().default(false),
  isOverthrow: z.boolean().default(false),
  overthrowRuns: z.number().min(0).optional(),
  commentary: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { matchId } = req.query;
  if (!matchId || typeof matchId !== 'string') {
    return res.status(400).json({ error: 'matchId required' });
  }

  if (req.method === 'POST') {
    return recordBall(req, res, matchId);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function recordBall(req: VercelRequest, res: VercelResponse, matchId: string) {
  try {
    const { decoded } = await requireRole(req.headers.authorization, 'host');
    const db = getAdminDb();

    // Verify match belongs to this host
    const matchDoc = await db.collection('matches').doc(matchId).get();
    if (!matchDoc.exists) return res.status(404).json({ error: 'Match not found' });

    const match = matchDoc.data()!;
    if (match.hostId !== decoded.uid) return res.status(403).json({ error: 'Not your match' });
    if (match.status !== 'live') return res.status(400).json({ error: 'Match not live' });

    const parsed = BallSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid ball data', details: parsed.error.flatten() });
    }

    const ball = parsed.data;
    const innings = [...match.innings];
    const inningsIdx = ball.inningsNumber - 1;
    const currentInnings = { ...innings[inningsIdx] };

    // Total runs for this delivery
    const totalDeliveryRuns = ball.runs + ball.extraRuns;

    // Update extras
    const extras = { ...currentInnings.extras };
    if (ball.extraType === 'wide') { extras.wides += ball.extraRuns || 1; extras.total += ball.extraRuns || 1; }
    else if (ball.extraType === 'no_ball') { extras.noBalls += 1; extras.total += ball.extraRuns || 1; }
    else if (ball.extraType === 'bye') { extras.byes += ball.extraRuns || 0; extras.total += ball.extraRuns || 0; }
    else if (ball.extraType === 'leg_bye') { extras.legByes += ball.extraRuns || 0; extras.total += ball.extraRuns || 0; }
    currentInnings.extras = extras;

    // Update total runs
    currentInnings.totalRuns += totalDeliveryRuns;

    // Count balls (wides and no-balls don't count as legal deliveries)
    const isLegalDelivery = !ball.extraType || ball.extraType === 'bye' || ball.extraType === 'leg_bye';
    if (isLegalDelivery) {
      currentInnings.totalBalls += 1;
      const ballInOver = currentInnings.totalBalls % 6;
      currentInnings.totalOvers = Math.floor(currentInnings.totalBalls / 6);
    }

    // Update wickets
    if (ball.isWicket && ball.wicket) {
      currentInnings.totalWickets += 1;

      // Add fall of wicket
      const fow = {
        wicketNumber: currentInnings.totalWickets,
        playerId: ball.wicket.dismissedPlayerId,
        playerName: ball.wicket.dismissedPlayerName,
        runs: currentInnings.totalRuns,
        overs: currentInnings.totalOvers,
        balls: currentInnings.totalBalls % 6,
      };
      currentInnings.fallOfWickets = [...(currentInnings.fallOfWickets || []), fow];
    }

    // Update batting scorecard
    const battingIdx = currentInnings.batting.findIndex(
      (b: { playerId: string }) => b.playerId === ball.batsmanOnStrikeId
    );
    if (battingIdx !== -1) {
      const batsman = { ...currentInnings.batting[battingIdx] };
      batsman.runs += ball.batsmanRuns;
      if (isLegalDelivery) batsman.balls += 1;
      if (ball.batsmanRuns === 4) batsman.fours += 1;
      if (ball.batsmanRuns === 6) batsman.sixes += 1;
      batsman.strikeRate = batsman.balls > 0 ? (batsman.runs / batsman.balls) * 100 : 0;

      if (ball.isWicket && ball.wicket?.dismissedPlayerId === ball.batsmanOnStrikeId) {
        batsman.dismissal = {
          type: ball.wicket.dismissalType,
          bowlerId: ball.bowlerId,
          bowlerName: ball.bowlerName,
          fielderId: ball.wicket.fielderId,
          fielderName: ball.wicket.fielderName,
          ball: currentInnings.totalBalls,
          over: currentInnings.totalOvers,
        };
        batsman.isCurrentBatter = false;
        batsman.isOnStrike = false;
      }

      const newBatting = [...currentInnings.batting];
      newBatting[battingIdx] = batsman;
      currentInnings.batting = newBatting;
    }

    // Update bowling scorecard
    const bowlingIdx = currentInnings.bowling.findIndex(
      (b: { playerId: string }) => b.playerId === ball.bowlerId
    );
    if (bowlingIdx !== -1) {
      const bowler = { ...currentInnings.bowling[bowlingIdx] };
      bowler.runs += totalDeliveryRuns;
      if (isLegalDelivery) bowler.balls += 1;
      if (ball.runs === 0 && !ball.extraType) bowler.dotBalls += 1;
      if (ball.extraType === 'wide') bowler.wides = (bowler.wides || 0) + 1;
      if (ball.extraType === 'no_ball') bowler.noBalls = (bowler.noBalls || 0) + 1;
      if (ball.isWicket && !['run_out', 'retired_hurt', 'obstructing'].includes(ball.wicket?.dismissalType || '')) {
        bowler.wickets += 1;
      }
      bowler.overs = Math.floor(bowler.balls / 6);
      bowler.economy = bowler.balls > 0 ? (bowler.runs / bowler.balls) * 6 : 0;

      // Check maiden
      const overBalls = bowler.balls % 6;
      if (overBalls === 0 && bowler.balls > 0) {
        const lastOverStart = bowler.balls - 6;
        // simplified maiden check
        if (ball.runs === 0 && !ball.extraType) bowler.maidens += 1;
      }

      const newBowling = [...currentInnings.bowling];
      newBowling[bowlingIdx] = bowler;
      currentInnings.bowling = newBowling;
    }

    // Check innings completion (all out or overs complete)
    if (currentInnings.totalWickets >= 10 ||
      currentInnings.totalOvers >= match.totalOvers) {
      currentInnings.isCompleted = true;
      if (currentInnings.totalWickets >= 10) currentInnings.allOut = true;
    }

    innings[inningsIdx] = currentInnings;

    // Rotate strike on odd runs
    const rotateStrike = (ball.batsmanRuns + ball.extraRuns) % 2 === 1;

    // Build match update
    const matchUpdate: Record<string, unknown> = {
      innings,
      updatedAt: new Date(),
    };

    // Check if match is complete
    let matchStatus = match.status;
    let matchResult = match.result;

    if (ball.inningsNumber === 2 && currentInnings.isCompleted) {
      const inn1 = innings[0];
      const inn2 = innings[1];
      const battingTeam2 = match.innings[1].battingTeam;
      const target = inn1.totalRuns + 1;

      if (inn2.totalRuns >= target) {
        // Batting team won
        const wicketsLeft = 10 - inn2.totalWickets;
        matchResult = {
          winner: battingTeam2,
          winnerName: battingTeam2 === 'teamA' ? match.teamA.name : match.teamB.name,
          margin: wicketsLeft,
          marginType: 'wickets',
          method: 'normal',
          description: `${battingTeam2 === 'teamA' ? match.teamA.name : match.teamB.name} won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`,
        };
      } else if (inn2.totalRuns < inn1.totalRuns) {
        // Bowling team (1st innings) won
        const runMargin = inn1.totalRuns - inn2.totalRuns;
        const battingTeam1 = match.innings[0].battingTeam;
        matchResult = {
          winner: battingTeam1,
          winnerName: battingTeam1 === 'teamA' ? match.teamA.name : match.teamB.name,
          margin: runMargin,
          marginType: 'runs',
          method: 'normal',
          description: `${battingTeam1 === 'teamA' ? match.teamA.name : match.teamB.name} won by ${runMargin} run${runMargin !== 1 ? 's' : ''}`,
        };
      } else {
        matchResult = { winner: 'tie', description: 'Match tied', method: 'normal' };
      }

      matchStatus = 'completed';
      matchUpdate.result = matchResult;
      matchUpdate.status = matchStatus;
      matchUpdate.completedAt = new Date();
    } else if (ball.inningsNumber === 1 && currentInnings.isCompleted) {
      matchStatus = 'innings_break';
      matchUpdate.status = matchStatus;
      // Set target for innings 2
      const inn1 = innings[0];
      innings[1] = { ...innings[1], targetRuns: inn1.totalRuns + 1 };
      matchUpdate.innings = innings;
    }

    // Atomic write: match + ball + commentary
    const batch = db.batch();

    batch.update(db.collection('matches').doc(matchId), matchUpdate);

    const ballId = `${matchId}_${ball.inningsNumber}_${ball.over}_${ball.ball}`;
    batch.set(db.collection('balls').doc(ballId), {
      ...ball,
      matchId,
      createdAt: new Date(),
    });

    const commentaryText = ball.commentary || generateAutoCommentary(ball, currentInnings.totalRuns);
    batch.set(db.collection('commentary').doc(`${ballId}_com`), {
      matchId,
      inningsNumber: ball.inningsNumber,
      over: ball.over,
      ball: ball.ball,
      text: commentaryText,
      type: ball.isWicket ? 'wicket' : ball.batsmanRuns === 6 ? 'six' : ball.batsmanRuns === 4 ? 'boundary' : 'ball',
      timestamp: new Date(),
    });

    await batch.commit();

    return res.status(200).json({
      success: true,
      data: {
        innings: innings[inningsIdx],
        matchStatus,
        result: matchResult,
        ballId,
      },
    });
  } catch (err) {
    console.error('[record-ball]', err);
    const message = err instanceof Error ? err.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}

function generateAutoCommentary(ball: Record<string, unknown>, totalRuns: number): string {
  if (ball.isWicket) {
    const wicket = ball.wicket as { dismissalType: string; dismissedPlayerName: string } | undefined;
    return `WICKET! ${wicket?.dismissedPlayerName || 'Batsman'} is ${wicket?.dismissalType?.replace('_', ' ') || 'out'}! ${totalRuns} on the board.`;
  }
  if (ball.batsmanRuns === 6) return `SIX! ${ball.batsmanOnStrikeName} dispatches that over the boundary! Maximum!`;
  if (ball.batsmanRuns === 4) return `FOUR! ${ball.batsmanOnStrikeName} finds the boundary!`;
  if (ball.extraType === 'wide') return `Wide ball from ${ball.bowlerName}.`;
  if (ball.extraType === 'no_ball') return `No ball! Free hit to follow.`;
  if (ball.runs === 0 && !ball.extraType) return `Dot ball. Good delivery from ${ball.bowlerName}.`;
  return `${ball.batsmanRuns} run${(ball.batsmanRuns as number) !== 1 ? 's' : ''} off that delivery.`;
}
