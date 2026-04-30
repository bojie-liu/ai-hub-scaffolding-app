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

  const isGuest = user?.role === 'GUEST';

  const loginAsGuest = useCallback(() => {
    setUser(GUEST_USER);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
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
