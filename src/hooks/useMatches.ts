import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection, query, orderBy, limit, onSnapshot,
  doc, getDoc, getDocs, where, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import type { Match } from '../types';

export function useMatches(filters?: { status?: string; format?: string; tournamentId?: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'), limit(50));

    if (filters?.status) {
      q = query(collection(db, 'matches'), where('status', '==', filters.status), orderBy('createdAt', 'desc'));
    }
    if (filters?.tournamentId) {
      q = query(collection(db, 'matches'), where('tournamentId', '==', filters.tournamentId), orderBy('createdAt', 'desc'));
    }

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Match);
      setMatches(data);
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return unsub;
  }, [filters?.status, filters?.tournamentId, filters?.format]);

  return { matches, loading, error };
}

export function useLiveMatch(matchId: string) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;
    const unsub = onSnapshot(doc(db, 'matches', matchId), (snap) => {
      if (snap.exists()) {
        setMatch({ id: snap.id, ...snap.data() } as Match);
      }
      setLoading(false);
    });
    return unsub;
  }, [matchId]);

  return { match, loading };
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'matches', matchId));
      if (!snap.exists()) throw new Error('Match not found');
      return { id: snap.id, ...snap.data() } as Match;
    },
    enabled: !!matchId,
  });
}

export function useHostMatches(hostId: string) {
  return useQuery({
    queryKey: ['host-matches', hostId],
    queryFn: async () => {
      const q = query(collection(db, 'matches'), where('hostId', '==', hostId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Match);
    },
    enabled: !!hostId,
  });
}

export function useUpdateMatchStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: string }) => {
      await updateDoc(doc(db, 'matches', matchId), { status, updatedAt: serverTimestamp() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
