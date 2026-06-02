import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import type { Tournament } from '../types';

export const createTournament = async (
  data: Omit<Tournament, 'id'>
): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTIONS.TOURNAMENTS), {
    ...data,
    startDate: Timestamp.fromDate(data.startDate),
    endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateTournament = async (
  id: string,
  data: Partial<Tournament>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.TOURNAMENTS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const getTournament = async (id: string): Promise<Tournament | null> => {
  const snap = await getDoc(doc(db, COLLECTIONS.TOURNAMENTS, id));
  if (!snap.exists()) return null;
  return firestoreToTournament(snap.id, snap.data());
};

export const getActiveTournaments = async (): Promise<Tournament[]> => {
  const q = query(
    collection(db, COLLECTIONS.TOURNAMENTS),
    where('isActive', '==', true),
    orderBy('startDate', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => firestoreToTournament(d.id, d.data()));
};

export const getHostTournaments = async (
  hostId: string
): Promise<Tournament[]> => {
  const q = query(
    collection(db, COLLECTIONS.TOURNAMENTS),
    where('hostId', '==', hostId),
    orderBy('startDate', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => firestoreToTournament(d.id, d.data()));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const firestoreToTournament = (id: string, data: Record<string, any>): Tournament => ({
  ...data,
  id,
  startDate: data.startDate?.toDate?.() ?? new Date(),
  endDate: data.endDate?.toDate?.() ?? undefined,
  createdAt: data.createdAt?.toDate?.() ?? new Date(),
} as Tournament);
