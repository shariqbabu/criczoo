import { auth } from '@/lib/firebase';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API Error ${res.status}`);
  return data;
}

// ============================================================
// MATCH APIs
// ============================================================

export const matchApi = {
  create: (data: unknown) => apiRequest('POST', '/matches/create', data),
  update: (id: string, data: unknown) => apiRequest('PUT', `/matches/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/matches/${id}`),
  start: (id: string, toss: unknown) => apiRequest('POST', `/matches/${id}/start`, { toss }),
  end: (id: string, result: unknown) => apiRequest('POST', `/matches/${id}/end`, { result }),
  recordBall: (id: string, data: unknown) => apiRequest('POST', `/matches/${id}/ball`, data),
  undo: (id: string) => apiRequest('POST', `/matches/${id}/undo`),
  setPlayingXI: (id: string, team: string, xi: unknown) =>
    apiRequest('POST', `/matches/${id}/playing-xi`, { team, xi }),
};

// ============================================================
// TEAM APIs
// ============================================================

export const teamApi = {
  create: (data: unknown) => apiRequest('POST', '/teams/create', data),
  update: (id: string, data: unknown) => apiRequest('PUT', `/teams/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/teams/${id}`),
  addPlayer: (id: string, playerId: string) =>
    apiRequest('POST', `/teams/${id}/players`, { playerId }),
  removePlayer: (id: string, playerId: string) =>
    apiRequest('DELETE', `/teams/${id}/players/${playerId}`),
};

// ============================================================
// HOST APIs
// ============================================================

export const hostApi = {
  apply: (data: unknown) => apiRequest('POST', '/hosts/apply', data),
  approve: (applicationId: string) => apiRequest('POST', `/hosts/${applicationId}/approve`),
  reject: (applicationId: string, note: string) =>
    apiRequest('POST', `/hosts/${applicationId}/reject`, { note }),
  getApplications: (status?: string) =>
    apiRequest('GET', `/hosts/applications${status ? `?status=${status}` : ''}`),
};

// ============================================================
// ADMIN APIs
// ============================================================

export const adminApi = {
  getUsers: (page = 1) => apiRequest('GET', `/admin/users?page=${page}`),
  updateUserRole: (uid: string, role: string) =>
    apiRequest('PUT', `/admin/users/${uid}/role`, { role }),
  getAnalytics: () => apiRequest('GET', '/admin/analytics'),
  updateSettings: (data: unknown) => apiRequest('PUT', '/admin/settings', data),
  moderateMatch: (id: string, action: string) =>
    apiRequest('POST', `/admin/matches/${id}/moderate`, { action }),
};

// ============================================================
// TOURNAMENT APIs
// ============================================================

export const tournamentApi = {
  create: (data: unknown) => apiRequest('POST', '/tournaments/create', data),
  update: (id: string, data: unknown) => apiRequest('PUT', `/tournaments/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/tournaments/${id}`),
  addTeam: (id: string, teamId: string) =>
    apiRequest('POST', `/tournaments/${id}/teams`, { teamId }),
  removeTeam: (id: string, teamId: string) =>
    apiRequest('DELETE', `/tournaments/${id}/teams/${teamId}`),
  generateFixtures: (id: string) => apiRequest('POST', `/tournaments/${id}/fixtures`),
};

// ============================================================
// UPLOAD API
// ============================================================

export const uploadApi = {
  getSignature: (folder: string) => apiRequest('POST', '/upload/signature', { folder }),
};

// ============================================================
// STATS APIs
// ============================================================

export const statsApi = {
  getLeaderboards: (type: string, period: string) =>
    apiRequest('GET', `/stats/leaderboards?type=${type}&period=${period}`),
  getPlayerStats: (playerId: string) => apiRequest('GET', `/stats/players/${playerId}`),
  getTeamStats: (teamId: string) => apiRequest('GET', `/stats/teams/${teamId}`),
  updateAfterMatch: (matchId: string) =>
    apiRequest('POST', `/stats/update`, { matchId }),
};
