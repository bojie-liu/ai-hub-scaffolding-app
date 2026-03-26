'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useCourse } from '@/contexts/CourseContext';
import { exchangeToken } from '@/lib/api/token-exchange';

export function TokenInitializer() {
  const searchParams = useSearchParams();
  const { setUser } = useUser();
  const { setCourse } = useCourse();
  const hasInitialized = useRef(false);

  useEffect(() => {
    console.log('TokenInitializer useEffect triggered with searchParams:', searchParams.toString());
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const token = searchParams.get('token');
    if (!token) return;

    const initializeFromToken = async () => {
      try {
        const data = await exchangeToken(token);

        setUser({
          userId: data.userId,
          username: data.username,
          email: data.email,
          role: data.role,
        });

        setCourse(data.course);

        console.log('Token exchange successful:', data);
      } catch (error) {
        console.error('Failed to exchange token:', error);
      }
    };

    initializeFromToken();
  }, [searchParams, setUser, setCourse]);

  return null;
}
