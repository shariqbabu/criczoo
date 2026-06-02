import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { COLLECTIONS } from './collections';
import type { AppUser, UserRole } from '../types';

const googleProvider = new GoogleAuthProvider();

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'host'
) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await setDoc(doc(db, COLLECTIONS.USERS, cred.user.uid), {
    uid: cred.user.uid,
    email,
    displayName,
    photoURL: null,
    role,
    createdAt: serverTimestamp(),
  });
  return cred;
};

export const signInWithGoogle = async () => {
  const cred = await signInWithPopup(auth, googleProvider);
  const ref = doc(db, COLLECTIONS.USERS, cred.user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      photoURL: cred.user.photoURL,
      role: 'host' as UserRole,
      createdAt: serverTimestamp(),
    });
  }
  return cred;
};

export const signOut = () => firebaseSignOut(auth);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const getUserProfile = async (uid: string): Promise<AppUser | null> => {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!snap.exists()) return null;
  return snap.data() as AppUser;
};

export const subscribeToAuth = (
  callback: (user: User | null) => void
) => onAuthStateChanged(auth, callback);
