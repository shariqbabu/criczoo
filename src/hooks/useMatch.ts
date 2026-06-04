import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTournaments, getHostTournaments, getTournament } from '@/services/tournamentService';
import { getTournamentMatches } from '@/services/matchService';
import {
  getMatch,
  getLiveMatches,
  getUpcomingMatches,
  getCompletedMatches,
  getHostMatches,
  subscribeToMatch,
  subscribeToLiveMatches,
  subscribeToCommentary,
  getBalls,
} from '@/services/matchService';
import { matchApi } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import type { Match, Ball, Commentary, Tournament } from '@/types';

// Live match subscription hook
export function useLiveMatch(matchId: string | undefined) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToMatch(matchId, (m) => {
      setMatch(m);
      setLoading(false);
    });
    return unsub;
  }, [matchId]);

  return { match, loading, error };
}

// One-time match fetch
export function useMatch(matchId: string | undefined) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => getMatch(matchId!),
    enabled: !!matchId,
    staleTime: 30_000,
  });
}

// Live matches (realtime)
export function useLiveMatchesFeed() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToLiveMatches((m) => {
      setMatches(m);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { matches, loading };
}

// Upcoming matches
export function useUpcomingMatches() {
  return useQuery({
    queryKey: ['matches', 'upcoming'],
    queryFn: getUpcomingMatches,
    staleTime: 60_000,
  });
}

// Completed matches
export function useCompletedMatches() {
  return useQuery({
    queryKey: ['matches', 'completed'],
    queryFn: () => getCompletedMatches(),
    staleTime: 300_000,
  });
}

// Host's matches
export function useHostMatches() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['host-matches', user?.uid],
    queryFn: () => getHostMatches(user!.uid),
    enabled: !!user,
  });
}

// Commentary subscription
export function useCommentary(matchId: string | undefined) {
  const [commentary, setCommentary] = useState<Commentary[]>([]);

  useEffect(() => {
    if (!matchId) return;
    const unsub = subscribeToCommentary(matchId, setCommentary);
    return unsub;
  }, [matchId]);

  return { commentary };
}

// Balls
export function useBalls(matchId: string | undefined, inningsNumber: number) {
  return useQuery({
    queryKey: ['balls', matchId, inningsNumber],
    queryFn: () => getBalls(matchId!, inningsNumber),
    enabled: !!matchId,
    staleTime: 5_000,
  });
}

// Scoring mutations
export function useScoringActions(matchId: string) {
  const queryClient = useQueryClient();

  const recordBall = useMutation({
    mutationFn: (data: unknown) => matchApi.recordBall(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
    },
  });

  const undoBall = useMutation({
    mutationFn: () => matchApi.undo(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
    },
  });

  return { recordBall, undoBall };
}

// Create match
export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => matchApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-matches'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

// Update match
export function useUpdateMatch(matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => matchApi.update(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      queryClient.invalidateQueries({ queryKey: ['host-matches'] });
    },
  });
}

// ============================================================
// TOURNAMENTS
// ============================================================
// TOURNAMENTS
// ============================================================

export function useTournaments() {
  const query = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => getTournaments(50),
    staleTime: 120_000,
  });
  return {
    tournaments: (query.data ?? []) as Tournament[],
    loading: query.isLoading,
    error: query.error,
  };
}

export function useHostTournaments() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ['host-tournaments', user?.uid],
    queryFn: () => getHostTournaments(user!.uid),
    enabled: !!user,
  });
  return {
    tournaments: (query.data ?? []) as Tournament[],
    loading: query.isLoading,
  };
}

export function useTournament(id: string | undefined) {
  const tournamentQuery = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => getTournament(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
  const matchesQuery = useQuery({
    queryKey: ['tournament-matches', id],
    queryFn: () => getTournamentMatches(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
  return {
    tournament: tournamentQuery.data ?? null,
    matches: matchesQuery.data ?? [],
    loading: tournamentQuery.isLoading || matchesQuery.isLoading,
  };
}
