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

const fetchMatches = async (): Promise<Match[]> => {
  const response = await fetch('/api/matches');
  if (!response.ok) throw new Error('Failed to fetch matches');
  return response.json();
};

const fetchMatch = async (id: string | number): Promise<Match> => {
  const response = await fetch(`/api/matches/${id}`);
  if (!response.ok) throw new Error('Failed to fetch match');
  return response.json();
};

const fetchTournaments = async (): Promise<Tournament[]> => {
  const response = await fetch('/api/tournaments');
  if (!response.ok) throw new Error('Failed to fetch tournaments');
  return response.json();
};

const fetchTournament = async (id: string | number): Promise<Tournament> => {
  const response = await fetch(`/api/tournaments/${id}`);
  if (!response.ok) throw new Error('Failed to fetch tournament');
  return response.json();
};

export const useMatches = () => {
  return useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: fetchMatches,
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
