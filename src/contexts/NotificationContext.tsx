import React, { createContext, useContext, useState, useEffect } from 'react';
import { where, orderBy, limit } from 'firebase/firestore';
import { listenToQuery, updateDocById, Collections } from '@/lib/firestore';
import { useAuth } from './AuthContext';
import type { Notification } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) { setNotifications([]); return; }

    const unsub = listenToQuery<Notification>(
      Collections.NOTIFICATIONS,
      [where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(50)],
      setNotifications
    );
    return unsub;
  }, [user]);

  const markAsRead = async (id: string) => {
    await updateDocById(Collections.NOTIFICATIONS, id, { isRead: true });
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => markAsRead(n.id)));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}
