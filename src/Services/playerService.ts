import { where, orderBy, limit } from 'firebase/firestore';
import {
  createDoc,
  updateDocById,
  deleteDocById,
  getDocById,
  queryDocs,
  Collections,
} from '@/lib/firestore';
import type { Player } from '@/types';

export async function getPlayer(id: string): Promise<Player | null> {
  return getDocById<Player>(Collections.PLAYERS, id);
}

export async function getPlayers(pageSize = 20): Promise<Player[]> {
  return queryDocs<Player>(Collections.PLAYERS, [orderBy('name', 'asc'), limit(pageSize)]);
}

export async function getPlayersByOwner(ownerId: string): Promise<Player[]> {
  return queryDocs<Player>(Collections.PLAYERS, [
    where('ownerId', '==', ownerId),
    orderBy('name', 'asc'),
  ]);
}

export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  return queryDocs<Player>(Collections.PLAYERS, [
    where('teamId', '==', teamId),
    orderBy('name', 'asc'),
  ]);
}

export async function searchPlayers(searchTerm: string): Promise<Player[]> {
  return queryDocs<Player>(Collections.PLAYERS, [
    where('name', '>=', searchTerm),
    where('name', '<=', searchTerm + '\uf8ff'),
    limit(10),
  ]);
}

export async function createPlayer(data: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  return createDoc(Collections.PLAYERS, data);
}

export async function updatePlayer(id: string, data: Partial<Player>): Promise<void> {
  return updateDocById(Collections.PLAYERS, id, data);
}

export async function deletePlayer(id: string): Promise<void> {
  return deleteDocById(Collections.PLAYERS, id);
}

export async function getTopRunScorers(limit_ = 10): Promise<Player[]> {
  return queryDocs<Player>(Collections.PLAYERS, [
    orderBy('careerStats.batting.runs', 'desc'),
    limit(limit_),
  ]);
}

export async function getTopWicketTakers(limit_ = 10): Promise<Player[]> {
  return queryDocs<Player>(Collections.PLAYERS, [
    orderBy('careerStats.bowling.wickets', 'desc'),
    limit(limit_),
  ]);
}
