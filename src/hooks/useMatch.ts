import { useQuery } from '@tanstack/react-query';

export interface Match {
  id: string | number;
  homeTeam?: string;
  homeTeamId?: string | number;
  awayTeam?: string;
  awayTeamId?: string | number;
  homeScore?: number;
  awayScore?: number;
  date?: string;
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
  tournamentId?: string | number;
  venue?: string;
  events?: MatchEvent[];
  lineups?: Lineup[];
}

export interface MatchEvent {
  id: string | number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty';
  minute: number;
  teamId?: string | number;
  playerId?: string | number;
  playerName?: string;
  description?: string;
}

export interface Lineup {
  teamId: string | number;
  teamName?: string;
  players: Array<{
    id: string | number;
    name: string;
    number?: number;
    position?: string;
    isStarter: boolean;
  }>;
}

export interface Tournament {
  id: string | number;
  name: string;
  startDate?: string;
  endDate?: string;
  status?: 'upcoming' | 'active' | 'completed';
  description?: string;
  matches?: Match[];
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string | number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: Array<'W' | 'D' | 'L'>;
}

const fetchMatches = async (): Promise<Match[]> => {
  const response = await fetch('/api/matches');
  if (!response.ok) throw new Error('Failed to fetch matches');
  return response.json() as Promise<Match[]>;
};

const fetchLiveMatches = async (): Promise<Match[]> => {
  const response = await fetch('/api/matches?status=live');
  if (!response.ok) throw new Error('Failed to fetch live matches');
  return response.json() as Promise<Match[]>;
};

const fetchMatch = async (id: string | number): Promise<Match> => {
  const response = await fetch(`/api/matches/${id}`);
  if (!response.ok) throw new Error('Failed to fetch match');
  return response.json() as Promise<Match>;
};

const fetchTournaments = async (): Promise<Tournament[]> => {
  const response = await fetch('/api/tournaments');
  if (!response.ok) throw new Error('Failed to fetch tournaments');
  return response.json() as Promise<Tournament[]>;
};

const fetchTournament = async (id: string | number): Promise<Tournament> => {
  const response = await fetch(`/api/tournaments/${id}`);
  if (!response.ok) throw new Error('Failed to fetch tournament');
  return response.json() as Promise<Tournament>;
};

const fetchLeaderboard = async (
  tournamentId?: string | number
): Promise<LeaderboardEntry[]> => {
  const url = tournamentId
    ? `/api/leaderboard?tournamentId=${tournamentId}`
    : '/api/leaderboard';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return response.json() as Promise<LeaderboardEntry[]>;
};

export const useMatches = () => {
  return useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: fetchMatches,
  });
};

export const useLiveMatches = () => {
  return useQuery<Match[]>({
    queryKey: ['matches', 'live'],
    queryFn: fetchLiveMatches,
    refetchInterval: 30_000,
  });
};

export const useMatch = (id?: string | number) => {
  return useQuery<Match>({
    queryKey: ['match', id],
    queryFn: () => fetchMatch(id!),
    enabled: !!id,
  });
};

export const useTournaments = () => {
  return useQuery<Tournament[]>({
    queryKey: ['tournaments'],
    queryFn: fetchTournaments,
  });
};

export const useTournament = (id?: string | number) => {
  return useQuery<Tournament>({
    queryKey: ['tournament', id],
    queryFn: () => fetchTournament(id!),
    enabled: !!id,
  });
};

export const useLeaderboard = (tournamentId?: string | number) => {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', tournamentId],
    queryFn: () => fetchLeaderboard(tournamentId),
  });
};
