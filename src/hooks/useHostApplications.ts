import { useQuery } from '@tanstack/react-query';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { HostApplication } from '../types';

export function useHostApplications(status?: string) {
  return useQuery({
    queryKey: ['host-applications', status],
    queryFn: async () => {
      let q = query(collection(db, 'hostApplications'), orderBy('createdAt', 'desc'));
      if (status) {
        q = query(collection(db, 'hostApplications'), where('status', '==', status), orderBy('createdAt', 'desc'));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as HostApplication);
    },
  });
}

export function useHostApplication(userId: string) {
  return useQuery({
    queryKey: ['host-application', userId],
    queryFn: async () => {
      const q = query(collection(db, 'hostApplications'), where('userId', '==', userId));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as HostApplication;
    },
    enabled: !!userId,
  });
}

export function useAllHosts() {
  return useQuery({
    queryKey: ['all-hosts'],
    queryFn: async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'host'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    },
  });
}
