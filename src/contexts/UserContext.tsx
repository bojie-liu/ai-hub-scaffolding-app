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

const STORAGE_KEY = 'lesson_app_user';

function loadUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function saveUserToStorage(user: User | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user && user.role !== 'GUEST') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    return loadUserFromStorage();
  });
  const [tokenProcessed, setTokenProcessed] = useState(false);

  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
    saveUserToStorage(newUser);
  }, []);

  const isGuest = user?.role === 'GUEST';

  const loginAsGuest = useCallback(() => {
    setUserState(GUEST_USER);
    saveUserToStorage(null);
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    saveUserToStorage(null);
  }, []);

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
