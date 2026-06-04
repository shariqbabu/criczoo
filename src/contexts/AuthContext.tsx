import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getDocById, createDoc, updateDocById, Collections } from '@/lib/firestore';
import type { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const p = await getDocById<UserProfile>(Collections.USERS, uid);
    setProfile(p);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadProfile(u.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string, username: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    await sendEmailVerification(credential.user);

    const newProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
      uid: credential.user.uid,
      name,
      username: username.toLowerCase(),
      email,
      role: 'user',
      emailVerified: false,
      stats: {
        matchesPlayed: 0,
        totalRuns: 0,
        totalWickets: 0,
        highestScore: 0,
        bestBowling: '0/0',
      },
    };

    await createDoc(Collections.USERS, newProfile, credential.user.uid);
    await loadProfile(credential.user.uid);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const existingProfile = await getDocById<UserProfile>(Collections.USERS, credential.user.uid);

    if (!existingProfile) {
      const username = (credential.user.email?.split('@')[0] || credential.user.uid).toLowerCase();
      const newProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
        uid: credential.user.uid,
        name: credential.user.displayName || 'User',
        username,
        email: credential.user.email || '',
        avatar: credential.user.photoURL || undefined,
        role: 'user',
        emailVerified: true,
        stats: {
          matchesPlayed: 0,
          totalRuns: 0,
          totalWickets: 0,
          highestScore: 0,
          bestBowling: '0/0',
        },
      };
      await createDoc(Collections.USERS, newProfile, credential.user.uid);
    }
    await loadProfile(credential.user.uid);
  };

  const logOut = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerification = async () => {
    if (user) await sendEmailVerification(user);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.uid);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role: profile?.role || null,
        signIn,
        signUp,
        signInWithGoogle,
        logOut,
        resetPassword,
        resendVerification,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
