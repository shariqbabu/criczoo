import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToAuth, getUserProfile } from '../firebase/auth';
import type { AppUser } from '../types';

interface AuthContextType {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  isHost: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isHost: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const prof = await getUserProfile(firebaseUser.uid);
        setProfile(prof);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const isAdmin = profile?.role === 'admin';
  const isHost = profile?.role === 'host' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isHost }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
