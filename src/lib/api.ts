import { auth } from './firebase';

const API_BASE = '/api';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
}

export const api = {
  createMatch: (data: Record<string, unknown>) =>
    apiCall('/create-match', { method: 'POST', body: JSON.stringify(data) }),

  updateScore: (data: Record<string, unknown>) =>
    apiCall('/update-score', { method: 'POST', body: JSON.stringify(data) }),

  endInnings: (data: Record<string, unknown>) =>
    apiCall('/end-innings', { method: 'POST', body: JSON.stringify(data) }),

  endMatch: (data: Record<string, unknown>) =>
    apiCall('/end-match', { method: 'POST', body: JSON.stringify(data) }),

  createTournament: (data: Record<string, unknown>) =>
    apiCall('/create-tournament', { method: 'POST', body: JSON.stringify(data) }),

  approveHost: (data: { hostUserId: string; applicationId: string }) =>
    apiCall('/approve-host', { method: 'POST', body: JSON.stringify(data) }),

  rejectHost: (data: { hostUserId: string; applicationId: string; reason: string }) =>
    apiCall('/reject-host', { method: 'POST', body: JSON.stringify(data) }),

  suspendHost: (data: { hostUserId: string; reason: string }) =>
    apiCall('/suspend-host', { method: 'POST', body: JSON.stringify(data) }),

  promoteAdmin: (data: { targetUserId: string }) =>
    apiCall('/promote-admin', { method: 'POST', body: JSON.stringify(data) }),

  getDashboardStats: () =>
    apiCall<{ stats: Record<string, unknown> }>('/dashboard-stats', { method: 'GET' }),
};
