import { useQuery } from '@tanstack/react-query';

export interface Player {
  id: string | number;
  name: string;
  position?: string;
  number?: number;
  nationality?: string;
  age?: number;
  stats?: Record<string, number>;
}

export interface Team {
  id: string | number;
  name: string;
  logo?: string;
  city?: string;
  foundedYear?: number;
  players?: Player[];
  description?: string;
  wins?: number;
  losses?: number;
  draws?: number;
}

const fetchTeams = async (): Promise<Team[]> => {
  const response = await fetch('/api/teams');
  if (!response.ok) throw new Error('Failed to fetch teams');
  return response.json();
};

const fetchTeam = async (id: string | number): Promise<Team | null> => {
  const response = await fetch(`/api/teams/${id}`);
  if (!response.ok) throw new Error('Failed to fetch team');
  return response.json();
};

export const useTeams = () => {
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });
};

export const useTeam = (id: string | number | undefined) => {
  return useQuery<Team | null>({
    queryKey: ['team', id],
    queryFn: () => fetchTeam(id!),
    enabled: !!id,
  });
};
