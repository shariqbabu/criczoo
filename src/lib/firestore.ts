import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  DocumentSnapshot,
  QueryConstraint,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================================
// COLLECTION REFERENCES
// ============================================================

export const Collections = {
  USERS: 'users',
  HOST_APPLICATIONS: 'hostApplications',
  MATCHES: 'matches',
  TOURNAMENTS: 'tournaments',
  TEAMS: 'teams',
  PLAYERS: 'players',
  BALLS: 'balls',
  COMMENTARY: 'commentary',
  NOTIFICATIONS: 'notifications',
  LEADERBOARDS: 'leaderboards',
  POINTS_TABLES: 'pointsTables',
  SPONSORS: 'sponsors',
  SETTINGS: 'settings',
} as const;

export const colRef = (col: string) => collection(db, col);
export const docRef = (col: string, id: string) => doc(db, col, id);

// ============================================================
// TIMESTAMP HELPERS
// ============================================================

export const toDate = (ts: Timestamp | Date | undefined): Date => {
  if (!ts) return new Date();
  if (ts instanceof Timestamp) return ts.toDate();
  return ts;
};

export const fromDate = (date: Date) => Timestamp.fromDate(date);

// ============================================================
// GENERIC CRUD
// ============================================================

export async function createDoc<T extends DocumentData>(
  collectionName: string,
  data: T,
  id?: string
): Promise<string> {
  const dataWithTimestamps = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (id) {
    await setDoc(doc(db, collectionName, id), dataWithTimestamps);
    return id;
  }
  const ref = await addDoc(collection(db, collectionName), dataWithTimestamps);
  return ref.id;
}

export async function updateDocById<T extends Partial<DocumentData>>(
  collectionName: string,
  id: string,
  data: T
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocById(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

export async function getDocById<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

export async function queryDocs<T>(
  collectionName: string,
  constraints: QueryConstraint[]
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

// ============================================================
// PAGINATION
// ============================================================

export interface PaginationResult<T> {
  data: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

export async function paginatedQuery<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  pageSize: number,
  lastDocument?: DocumentSnapshot
): Promise<PaginationResult<T>> {
  const baseConstraints = [...constraints, limit(pageSize + 1)];
  if (lastDocument) baseConstraints.push(startAfter(lastDocument));

  const q = query(collection(db, collectionName), ...baseConstraints);
  const snap = await getDocs(q);

  const hasMore = snap.docs.length > pageSize;
  const docs = hasMore ? snap.docs.slice(0, pageSize) : snap.docs;

  return {
    data: docs.map((d) => ({ id: d.id, ...d.data() } as T)),
    lastDoc: docs[docs.length - 1] ?? null,
    hasMore,
  };
}

// ============================================================
// REALTIME LISTENERS
// ============================================================

export function listenToDoc<T>(
  collectionName: string,
  id: string,
  callback: (data: T | null) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    doc(db, collectionName, id),
    (snap) => {
      if (!snap.exists()) callback(null);
      else callback({ id: snap.id, ...snap.data() } as T);
    },
    onError
  );
}

export function listenToQuery<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
    },
    onError
  );
}

// ============================================================
// EXPORTS
// ============================================================

export {
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  db,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  collection,
  query,
  Timestamp,
};
