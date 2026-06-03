import { where, orderBy, limit } from 'firebase/firestore';
import {
  createDoc,
  updateDocById,
  deleteDocById,
  getDocById,
  queryDocs,
  listenToDoc,
  listenToQuery,
  Collections,
  serverTimestamp,
  writeBatch,
  db,
  doc,
} from '@/lib/firestore';
import type { Match, Ball, Commentary, MatchStatus } from '@/types';

// ============================================================
// MATCH CRUD
// ============================================================

export async function getMatch(id: string): Promise<Match | null> {
  return getDocById<Match>(Collections.MATCHES, id);
}

export async function getLiveMatches(): Promise<Match[]> {
  return queryDocs<Match>(Collections.MATCHES, [
    where('status', 'in', ['live', 'innings_break', 'toss']),
    where('isPublic', '==', true),
    orderBy('scheduledAt', 'desc'),
    limit(20),
  ]);
}

export async function getUpcomingMatches(): Promise<Match[]> {
  return queryDocs<Match>(Collections.MATCHES, [
    where('status', '==', 'upcoming'),
    where('isPublic', '==', true),
    orderBy('scheduledAt', 'asc'),
    limit(20),
  ]);
}

export async function getCompletedMatches(pageSize = 10): Promise<Match[]> {
  return queryDocs<Match>(Collections.MATCHES, [
    where('status', 'in', ['completed', 'archived']),
    where('isPublic', '==', true),
    orderBy('completedAt', 'desc'),
    limit(pageSize),
  ]);
}

export async function getHostMatches(hostId: string): Promise<Match[]> {
  return queryDocs<Match>(Collections.MATCHES, [
    where('hostId', '==', hostId),
    orderBy('scheduledAt', 'desc'),
    limit(50),
  ]);
}

export async function getTournamentMatches(tournamentId: string): Promise<Match[]> {
  return queryDocs<Match>(Collections.MATCHES, [
    where('tournamentId', '==', tournamentId),
    orderBy('scheduledAt', 'asc'),
  ]);
}

export async function updateMatchStatus(id: string, status: MatchStatus): Promise<void> {
  const extra: Record<string, unknown> = {};
  if (status === 'live') extra.startedAt = serverTimestamp();
  if (status === 'completed') extra.completedAt = serverTimestamp();
  await updateDocById(Collections.MATCHES, id, { status, ...extra });
}

// ============================================================
// BALL BY BALL
// ============================================================

export async function getBalls(matchId: string, inningsNumber: number): Promise<Ball[]> {
  return queryDocs<Ball>(Collections.BALLS, [
    where('matchId', '==', matchId),
    where('inningsNumber', '==', inningsNumber),
    orderBy('over', 'asc'),
    orderBy('ball', 'asc'),
  ]);
}

export async function getLastBalls(matchId: string, inningsNumber: number, count = 6): Promise<Ball[]> {
  return queryDocs<Ball>(Collections.BALLS, [
    where('matchId', '==', matchId),
    where('inningsNumber', '==', inningsNumber),
    orderBy('over', 'desc'),
    orderBy('ball', 'desc'),
    limit(count),
  ]);
}

// ============================================================
// COMMENTARY
// ============================================================

export async function getCommentary(matchId: string, maxItems = 50): Promise<Commentary[]> {
  return queryDocs<Commentary>(Collections.COMMENTARY, [
    where('matchId', '==', matchId),
    orderBy('timestamp', 'desc'),
    limit(maxItems),
  ]);
}

// ============================================================
// REALTIME SUBSCRIPTIONS
// ============================================================

export function subscribeToMatch(
  matchId: string,
  callback: (match: Match | null) => void
): () => void {
  return listenToDoc<Match>(Collections.MATCHES, matchId, callback);
}

export function subscribeToLiveMatches(callback: (matches: Match[]) => void): () => void {
  return listenToQuery<Match>(
    Collections.MATCHES,
    [
      where('status', 'in', ['live', 'innings_break', 'toss']),
      where('isPublic', '==', true),
      orderBy('scheduledAt', 'desc'),
    ],
    callback
  );
}

export function subscribeToCommentary(
  matchId: string,
  callback: (commentary: Commentary[]) => void
): () => void {
  return listenToQuery<Commentary>(
    Collections.COMMENTARY,
    [where('matchId', '==', matchId), orderBy('timestamp', 'desc'), limit(100)],
    callback
  );
}

export function subscribeToMatchBalls(
  matchId: string,
  inningsNumber: number,
  callback: (balls: Ball[]) => void
): () => void {
  return listenToQuery<Ball>(
    Collections.BALLS,
    [
      where('matchId', '==', matchId),
      where('inningsNumber', '==', inningsNumber),
      orderBy('over', 'asc'),
      orderBy('ball', 'asc'),
    ],
    callback
  );
}

// ============================================================
// BATCH UPDATES (for scoring)
// ============================================================

export async function commitScoringUpdate(
  matchId: string,
  matchUpdate: Partial<Match>,
  ball: Omit<Ball, 'id'>,
  commentary: Omit<Commentary, 'id'>
): Promise<void> {
  const batch = writeBatch(db);

  // Update match
  batch.update(doc(db, Collections.MATCHES, matchId), {
    ...matchUpdate,
    updatedAt: serverTimestamp(),
  });

  // Add ball
  const ballRef = doc(db, Collections.BALLS, `${matchId}_${ball.inningsNumber}_${ball.over}_${ball.ball}`);
  batch.set(ballRef, { ...ball, createdAt: serverTimestamp() });

  // Add commentary
  const comRef = doc(db, Collections.COMMENTARY, `${matchId}_${commentary.over}_${commentary.ball}_${Date.now()}`);
  batch.set(comRef, { ...commentary, timestamp: serverTimestamp() });

  await batch.commit();
}
