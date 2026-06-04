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
} from '@/lib/firestore';
import type { Match, Ball, Commentary } from '@/types';

// ============================================================
// FETCH
// ============================================================

export async function getMatch(id: string): Promise<Match | null> {
  return getDocById<Match>(Collections.MATCHES, id);
}

export async function getLiveMatches(): Promise<Match[]> {
  return queryDocs<Match>(Collections.MATCHES, [
    where('status', '==', 'live'),
    where('isPublic', '==', true),
    orderBy('startedAt', 'desc'),
    limit(20),
  ]);
}

export async function getUpcomingMatches(pageSize = 20): Promise<Match[]> {
  return queryDocs<Match>(Collections.MATCHES, [
    where('status', '==', 'upcoming'),
    where('isPublic', '==', true),
    orderBy('scheduledAt', 'asc'),
    limit(pageSize),
  ]);
}

export async function getCompletedMatches(pageSize = 20): Promise<Match[]> {
  return queryDocs<Match>(Collections.MATCHES, [
    where('status', '==', 'completed'),
    where('isPublic', '==', true),
    orderBy('completedAt', 'desc'),
    limit(pageSize),
  ]);
}

export async function getHostMatches(hostId: string): Promise<Match[]> {
  return queryDocs<Match>(Collections.MATCHES, [
    where('hostId', '==', hostId),
    orderBy('createdAt', 'desc'),
    limit(50),
  ]);
}

export async function getTournamentMatches(tournamentId: string): Promise<Match[]> {
  return queryDocs<Match>(Collections.MATCHES, [
    where('tournamentId', '==', tournamentId),
    orderBy('scheduledAt', 'asc'),
  ]);
}

// ============================================================
// BALLS
// ============================================================

export async function getBalls(matchId: string, inningsNumber: number): Promise<Ball[]> {
  return queryDocs<Ball>(Collections.BALLS, [
    where('matchId', '==', matchId),
    where('inningsNumber', '==', inningsNumber),
    orderBy('over', 'asc'),
    orderBy('ball', 'asc'),
  ]);
}

// ============================================================
// COMMENTARY
// ============================================================

export async function getCommentary(matchId: string): Promise<Commentary[]> {
  return queryDocs<Commentary>(Collections.COMMENTARY, [
    where('matchId', '==', matchId),
    orderBy('over', 'desc'),
    orderBy('ball', 'desc'),
    limit(50),
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

export function subscribeToLiveMatches(
  callback: (matches: Match[]) => void
): () => void {
  return listenToQuery<Match>(
    Collections.MATCHES,
    [
      where('status', '==', 'live'),
      where('isPublic', '==', true),
      orderBy('startedAt', 'desc'),
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
    [
      where('matchId', '==', matchId),
      orderBy('over', 'desc'),
      orderBy('ball', 'desc'),
      limit(30),
    ],
    callback
  );
}

// ============================================================
// WRITE (direct Firestore, used by host pages not going through API)
// ============================================================

export async function createMatch(
  data: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  return createDoc(Collections.MATCHES, data);
}

export async function updateMatch(id: string, data: Partial<Match>): Promise<void> {
  return updateDocById(Collections.MATCHES, id, data);
}

export async function deleteMatch(id: string): Promise<void> {
  return deleteDocById(Collections.MATCHES, id);
}

// ============================================================
// matchService object (for compatibility with pages using matchService.createMatch etc.)
// ============================================================

export const matchService = {
  getMatch,
  getLiveMatches,
  getUpcomingMatches,
  getCompletedMatches,
  getHostMatches,
  getTournamentMatches,
  getBalls,
  getCommentary,
  subscribeToMatch,
  subscribeToLiveMatches,
  subscribeToCommentary,
  createMatch,
  updateMatch,
  deleteMatch,
};
