'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { User } from '@/lib/types';

interface UserContextValue {
  user: User | null;
  isGuest: boolean;
  tokenProcessed: boolean;
  setUser: (user: User | null) => void;
  setTokenProcessed: (v: boolean) => void;
  loginAsGuest: () => void;
  logout: () => void;
}

const GUEST_USER: User = {
  userId: -1,
  username: 'Guest',
  email: '',
  role: 'GUEST',
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokenProcessed, setTokenProcessed] = useState(false);

  // Persist user to sessionStorage and restore on mount
  const persistUser = useCallback((u: User | null) => {
    if (u) {
      try {
        sessionStorage.setItem('lessonUser', JSON.stringify(u));
      } catch { /* ignore storage errors */ }
    } else {
      try {
        sessionStorage.removeItem('lessonUser');
      } catch { /* ignore storage errors */ }
    }
    setUser(u);
  }, []);

  // Restore user from sessionStorage on mount
  useState(() => {
    try {
      const stored = sessionStorage.getItem('lessonUser');
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        // Ensure role is uppercase for consistent checks
        parsed.role = parsed.role.toUpperCase();
        setUser(parsed);
      }
    } catch { /* ignore storage errors */ }
  });

  const isGuest = user?.role === 'GUEST';

  const loginAsGuest = useCallback(() => {
    persistUser(GUEST_USER);
  }, [persistUser]);

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const wrappedSetUser = useCallback((u: User | null) => {
    if (u) {
      u.role = u.role.toUpperCase();
    }
    persistUser(u);
  }, [persistUser]);

  return (
    <UserContext.Provider value={{ user, isGuest, tokenProcessed, setTokenProcessed, setUser: wrappedSetUser, loginAsGuest, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
