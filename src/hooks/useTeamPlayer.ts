import { useQuery } from '@tanstack/react-query';

export interface Player {
  id: string | number;
  name: string;
  position?: string;
  number?: number;
  nationality?: string;
  age?: number;
  teamId?: string | number;
  teamName?: string;
  stats?: Record<string, number>;
}

const fetchPlayers = async (): Promise<Player[]> => {
  const response = await fetch('/api/players');
  if (!response.ok) throw new Error('Failed to fetch players');
  return response.json() as Promise<Player[]>;
};

const fetchPlayer = async (id: string | number): Promise<Player | null> => {
  const response = await fetch(`/api/players/${id}`);
  if (!response.ok) throw new Error('Failed to fetch player');
  return response.json() as Promise<Player>;
};

const fetchPlayersByTeam = async (
  teamId: string | number
): Promise<Player[]> => {
  const response = await fetch(`/api/teams/${teamId}/players`);
  if (!response.ok) throw new Error('Failed to fetch team players');
  return response.json() as Promise<Player[]>;
};

export const usePlayers = (teamId?: string | number) => {
  return useQuery<Player[]>({
    queryKey: teamId ? ['players', 'team', teamId] : ['players'],
    queryFn: () =>
      teamId ? fetchPlayersByTeam(teamId) : fetchPlayers(),
  });
};

export const usePlayer = (id: string | number | undefined) => {
  return useQuery<Player | null>({
    queryKey: ['player', id],
    queryFn: () => fetchPlayer(id!),
    enabled: !!id,
  });
};
