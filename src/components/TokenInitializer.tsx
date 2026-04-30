'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useCourse } from '@/contexts/CourseContext';
import { exchangeToken } from '@/lib/api/token-exchange';

export function TokenInitializer() {
  const searchParams = useSearchParams();
  const { setUser, setTokenProcessed } = useUser();
  const { setCourse } = useCourse();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const token = searchParams.get('token');
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
      } catch (error) {
        console.error('Failed to exchange token:', error);
      } finally {
        setTokenProcessed(true);
      }
    };

    initializeFromToken();
  }, [searchParams, setUser, setCourse, setTokenProcessed]);

  return null;
}
