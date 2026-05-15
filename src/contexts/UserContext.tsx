'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
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

const STORAGE_KEY = 'lesson_app_user';

function loadUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return null;
}

function saveUserToStorage(user: User | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tokenProcessed, setTokenProcessed] = useState(false);

  // Hydrate from localStorage on mount - standard Next.js client hydration pattern
  useEffect(() => {
    const stored = loadUserFromStorage();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserState(stored);
    }
    setMounted(true);
  }, []);

  const setUser = useCallback((user: User | null) => {
    setUserState(user);
    saveUserToStorage(user);
  }, []);

  const isGuest = user?.role === 'GUEST';

  const loginAsGuest = useCallback(() => {
    setUser(GUEST_USER);
  }, [setUser]);

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  // Wait for mount to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <UserContext.Provider value={{ user, isGuest, tokenProcessed, setTokenProcessed, setUser, loginAsGuest, logout }}>
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
