import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Tournament } from '../types';

export function useTournaments(hostId?: string) {
  return useQuery({
    queryKey: ['tournaments', hostId],
    queryFn: async () => {
      let q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
      if (hostId) {
        q = query(collection(db, 'tournaments'), where('organizerId', '==', hostId), orderBy('createdAt', 'desc'));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Tournament);
    },
  });
}

export function useTournament(tournamentId: string) {
  return useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'tournaments', tournamentId));
      if (!snap.exists()) throw new Error('Tournament not found');
      return { id: snap.id, ...snap.data() } as Tournament;
    },
    enabled: !!tournamentId,
  });
}
