import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, getDocs, doc, getDoc, where, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Team, Player } from '../types';

export function useTeams(hostId?: string) {
  return useQuery({
    queryKey: ['teams', hostId],
    queryFn: async () => {
      let q = query(collection(db, 'teams'), orderBy('createdAt', 'desc'));
      if (hostId) {
        q = query(collection(db, 'teams'), where('createdBy', '==', hostId), orderBy('createdAt', 'desc'));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Team);
    },
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'teams', teamId));
      if (!snap.exists()) throw new Error('Team not found');
      return { id: snap.id, ...snap.data() } as Team;
    },
    enabled: !!teamId,
  });
}

export function usePlayers(teamId?: string) {
  return useQuery({
    queryKey: ['players', teamId],
    queryFn: async () => {
      let q = query(collection(db, 'players'), orderBy('name', 'asc'));
      if (teamId) {
        q = query(collection(db, 'players'), where('teamId', '==', teamId));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Player);
    },
  });
}

export function usePlayer(playerId: string) {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'players', playerId));
      if (!snap.exists()) throw new Error('Player not found');
      return { id: snap.id, ...snap.data() } as Player;
    },
    enabled: !!playerId,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Team, 'id' | 'createdAt'>) => {
      const ref = await addDoc(collection(db, 'teams'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      return ref.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Player, 'id'>) => {
      const ref = await addDoc(collection(db, 'players'), data);
      return ref.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
}
