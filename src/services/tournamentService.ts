import { where, orderBy, limit } from 'firebase/firestore';
import {
  createDoc,
  updateDocById,
  deleteDocById,
  getDocById,
  queryDocs,
  listenToDoc,
  Collections,
} from '@/lib/firestore';
import type { Tournament, PointsTable, PointsTableEntry } from '@/types';
import { calcNRR } from '@/utils';

export async function getTournament(id: string): Promise<Tournament | null> {
  return getDocById<Tournament>(Collections.TOURNAMENTS, id);
}

export async function getTournaments(pageSize = 20): Promise<Tournament[]> {
  return queryDocs<Tournament>(Collections.TOURNAMENTS, [
    where('isPublic', '==', true),
    orderBy('startDate', 'desc'),
    limit(pageSize),
  ]);
}

export async function getHostTournaments(hostId: string): Promise<Tournament[]> {
  return queryDocs<Tournament>(Collections.TOURNAMENTS, [
    where('hostId', '==', hostId),
    orderBy('createdAt', 'desc'),
  ]);
}

export async function createTournament(data: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  return createDoc(Collections.TOURNAMENTS, data);
}

export async function updateTournament(id: string, data: Partial<Tournament>): Promise<void> {
  return updateDocById(Collections.TOURNAMENTS, id, data);
}

export async function deleteTournament(id: string): Promise<void> {
  return deleteDocById(Collections.TOURNAMENTS, id);
}

// ============================================================
// POINTS TABLE
// ============================================================

export async function getPointsTable(tournamentId: string): Promise<PointsTable | null> {
  const results = await queryDocs<PointsTable>(Collections.POINTS_TABLES, [
    where('tournamentId', '==', tournamentId),
    limit(1),
  ]);
  return results[0] || null;
}

export async function initPointsTable(
  tournamentId: string,
  teamIds: { id: string; name: string; logo?: string }[],
  groupName?: string
): Promise<void> {
  const entries: PointsTableEntry[] = teamIds.map((t) => ({
    teamId: t.id,
    teamName: t.name,
    teamLogo: t.logo,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    noResult: 0,
    points: 0,
    runsScored: 0,
    runsConceded: 0,
    oversFaced: 0,
    oversBowled: 0,
    nrr: 0,
  }));

  const existing = await getPointsTable(tournamentId);
  if (!existing) {
    await createDoc(Collections.POINTS_TABLES, { tournamentId, groupName, entries });
  }
}

export async function updatePointsTableAfterMatch(
  tournamentId: string,
  winnerTeamId: string | null,
  teamAId: string,
  teamBId: string,
  teamAData: { runs: number; overs: number },
  teamBData: { runs: number; overs: number },
  resultType: 'win' | 'tie' | 'no_result'
): Promise<void> {
  const table = await getPointsTable(tournamentId);
  if (!table) return;

  const entries = [...table.entries];

  const updateEntry = (teamId: string, isWinner: boolean) => {
    const idx = entries.findIndex((e) => e.teamId === teamId);
    if (idx === -1) return;
    const e = { ...entries[idx] };
    e.played++;
    if (resultType === 'win') {
      if (isWinner) { e.won++; e.points += 2; }
      else { e.lost++; }
    } else if (resultType === 'tie') {
      e.tied++; e.points += 1;
    } else {
      e.noResult++; e.points += 1;
    }

    if (teamId === teamAId) {
      e.runsScored += teamAData.runs;
      e.runsConceded += teamBData.runs;
      e.oversFaced += teamAData.overs;
      e.oversBowled += teamBData.overs;
    } else {
      e.runsScored += teamBData.runs;
      e.runsConceded += teamAData.runs;
      e.oversFaced += teamBData.overs;
      e.oversBowled += teamAData.overs;
    }

    e.nrr = calcNRR(e.runsScored, e.oversFaced, e.runsConceded, e.oversBowled);
    entries[idx] = e;
  };

  updateEntry(teamAId, winnerTeamId === teamAId);
  updateEntry(teamBId, winnerTeamId === teamBId);

  // Sort: points desc, then NRR desc
  entries.sort((a, b) => b.points - a.points || b.nrr - a.nrr);

  await updateDocById(Collections.POINTS_TABLES, table.id, { entries });
}

export function subscribeToTournament(
  id: string,
  callback: (t: Tournament | null) => void
): () => void {
  return listenToDoc<Tournament>(Collections.TOURNAMENTS, id, callback);
}
