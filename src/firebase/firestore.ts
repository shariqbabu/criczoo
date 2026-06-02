import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';

export {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
};
export type { QueryConstraint };

export const dbRef = (path: string) => doc(db, path);
export const colRef = (path: string) => collection(db, path);

export const getDocument = async <T>(path: string): Promise<T | null> => {
  const snap = await getDoc(doc(db, path));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
};

export const getCollection = async <T>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  const q = query(collection(db, collectionPath), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
};

export const createDocument = async (
  collectionPath: string,
  data: Record<string, unknown>
) => {
  return addDoc(collection(db, collectionPath), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateDocument = async (
  path: string,
  data: Record<string, unknown>
) => {
  return updateDoc(doc(db, path), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = (path: string) => deleteDoc(doc(db, path));

export const subscribeToDocument = <T>(
  path: string,
  callback: (data: T | null) => void
) =>
  onSnapshot(doc(db, path), (snap) => {
    if (!snap.exists()) return callback(null);
    callback({ id: snap.id, ...snap.data() } as T);
  });

export const subscribeToCollection = <T>(
  collectionPath: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
) => {
  const q = query(collection(db, collectionPath), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
  });
};

export { db };
