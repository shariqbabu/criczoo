import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import type { Match, Commentary } from '../types';

export const createMatch = async (data: Omit<Match, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTIONS.MATCHES), {
    ...data,
    scheduledAt: Timestamp.fromDate(data.scheduledAt),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateMatch = async (
  matchId: string,
  data: Partial<Match>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.MATCHES, matchId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const getMatch = async (matchId: string): Promise<Match | null> => {
  const snap = await getDoc(doc(db, COLLECTIONS.MATCHES, matchId));
  if (!snap.exists()) return null;
  return firestoreToMatch(snap.id, snap.data());
};

export const getLiveMatches = async (): Promise<Match[]> => {
  const q = query(
    collection(db, COLLECTIONS.MATCHES),
    where('status', '==', 'live'),
    orderBy('scheduledAt', 'desc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => firestoreToMatch(d.id, d.data()));
};

export const getUpcomingMatches = async (): Promise<Match[]> => {
  const q = query(
    collection(db, COLLECTIONS.MATCHES),
    where('status', '==', 'upcoming'),
    orderBy('scheduledAt', 'asc'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => firestoreToMatch(d.id, d.data()));
};

export const getRecentMatches = async (): Promise<Match[]> => {
  const q = query(
    collection(db, COLLECTIONS.MATCHES),
    where('status', '==', 'completed'),
    orderBy('scheduledAt', 'desc'),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => firestoreToMatch(d.id, d.data()));
};

export const getHostMatches = async (hostId: string): Promise<Match[]> => {
  const q = query(
    collection(db, COLLECTIONS.MATCHES),
    where('hostId', '==', hostId),
    orderBy('scheduledAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => firestoreToMatch(d.id, d.data()));
};

export const subscribeToMatch = (
  matchId: string,
  callback: (match: Match | null) => void
) =>
  onSnapshot(doc(db, COLLECTIONS.MATCHES, matchId), (snap) => {
    if (!snap.exists()) return callback(null);
    callback(firestoreToMatch(snap.id, snap.data()));
  });

export const subscribeToLiveMatches = (
  callback: (matches: Match[]) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.MATCHES),
    where('status', '==', 'live'),
    orderBy('scheduledAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => firestoreToMatch(d.id, d.data())));
  });
};

export const addCommentary = async (
  matchId: string,
  entry: Omit<Commentary, 'id'>
): Promise<void> => {
  await addDoc(
    collection(db, COLLECTIONS.MATCHES, matchId, 'commentary'),
    {
      ...entry,
      timestamp: serverTimestamp(),
    }
  );
};

export const subscribeToCommentary = (
  matchId: string,
  callback: (entries: Commentary[]) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.MATCHES, matchId, 'commentary'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        timestamp:
          d.data().timestamp?.toDate?.() ?? new Date(),
      })) as Commentary[]
    );
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const firestoreToMatch = (id: string, data: Record<string, any>): Match => ({
  ...data,
  id,
  scheduledAt: data.scheduledAt?.toDate?.() ?? new Date(),
  startedAt: data.startedAt?.toDate?.() ?? undefined,
  completedAt: data.completedAt?.toDate?.() ?? undefined,
} as Match);
