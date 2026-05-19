'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useCourse } from '@/contexts/CourseContext';
import { exchangeToken } from '@/lib/api/token-exchange';

const TOKEN_KEY = 'auth_token';

export function TokenGuard({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const { user, setUser, setTokenProcessed, tokenProcessed } = useUser();
  const { setCourse } = useCourse();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Persist token from URL to sessionStorage before any redirect can strip it
    const urlToken = searchParams.get('token');
    if (urlToken) {
      sessionStorage.setItem(TOKEN_KEY, urlToken);
    }

    // Read token from sessionStorage (survives redirects that drop URL params)
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      setTokenProcessed(true);
      return;
    }

    const initializeFromToken = async () => {
      try {
        const data = await exchangeToken(token);

        setUser({
          userId: data.userId,
          username: data.username,
          email: data.email,
          role: data.role.toUpperCase(),
        });

        setCourse(data.course);

        // Clear stored token after successful exchange
        sessionStorage.removeItem(TOKEN_KEY);
      } catch (error) {
        console.error('Failed to exchange token:', error);
      } finally {
        setTokenProcessed(true);
      }
    };

    initializeFromToken();
  }, [searchParams, setUser, setCourse, setTokenProcessed]);

  // Wait until token processing is complete before rendering children
  if (!tokenProcessed) {
    return null;
  }

  return <>{children}</>;
}
