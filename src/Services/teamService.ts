import { where, orderBy, limit } from 'firebase/firestore';
import {
  createDoc,
  updateDocById,
  deleteDocById,
  getDocById,
  queryDocs,
  Collections,
} from '@/lib/firestore';
import type { Team } from '@/types';

export async function getTeam(id: string): Promise<Team | null> {
  return getDocById<Team>(Collections.TEAMS, id);
}

export async function getTeams(pageSize = 20): Promise<Team[]> {
  return queryDocs<Team>(Collections.TEAMS, [orderBy('name', 'asc'), limit(pageSize)]);
}

export async function getTeamsByOwner(ownerId: string): Promise<Team[]> {
  return queryDocs<Team>(Collections.TEAMS, [
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc'),
  ]);
}

export async function searchTeams(searchTerm: string): Promise<Team[]> {
  // Firestore doesn't support full text search; use starts-with range query
  return queryDocs<Team>(Collections.TEAMS, [
    where('name', '>=', searchTerm),
    where('name', '<=', searchTerm + '\uf8ff'),
    limit(10),
  ]);
}

export async function createTeam(data: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  return createDoc(Collections.TEAMS, data);
}

export async function updateTeam(id: string, data: Partial<Team>): Promise<void> {
  return updateDocById(Collections.TEAMS, id, data);
}

export async function deleteTeam(id: string): Promise<void> {
  return deleteDocById(Collections.TEAMS, id);
}
