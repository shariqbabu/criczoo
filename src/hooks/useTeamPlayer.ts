import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeam, getTeamsByOwner, getTeams } from '@/services/teamService';
import { getPlayer, getPlayersByOwner, getPlayersByTeam, getTopRunScorers, getTopWicketTakers } from '@/services/playerService';
import { teamApi } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================
// TEAMS
// ============================================================

export function useTeam(id: string | undefined) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeam(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    staleTime: 120_000,
  });
}

export function useMyTeams() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-teams', user?.uid],
    queryFn: () => getTeamsByOwner(user!.uid),
    enabled: !!user,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => teamApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      qc.invalidateQueries({ queryKey: ['my-teams'] });
    },
  });
}

export function useUpdateTeam(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => teamApi.update(teamId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team', teamId] });
      qc.invalidateQueries({ queryKey: ['my-teams'] });
    },
  });
}

// ============================================================
// PLAYERS
// ============================================================

export function usePlayer(id: string | undefined) {
  return useQuery({
    queryKey: ['player', id],
    queryFn: () => getPlayer(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useMyPlayers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-players', user?.uid],
    queryFn: () => getPlayersByOwner(user!.uid),
    enabled: !!user,
  });
}

export function useTeamPlayers(teamId: string | undefined) {
  return useQuery({
    queryKey: ['team-players', teamId],
    queryFn: () => getPlayersByTeam(teamId!),
    enabled: !!teamId,
    staleTime: 60_000,
  });
}

export function useTopRunScorers() {
  return useQuery({
    queryKey: ['top-run-scorers'],
    queryFn: () => getTopRunScorers(10),
    staleTime: 300_000,
  });
}

export function useTopWicketTakers() {
  return useQuery({
    queryKey: ['top-wicket-takers'],
    queryFn: () => getTopWicketTakers(10),
    staleTime: 300_000,
  });
}
