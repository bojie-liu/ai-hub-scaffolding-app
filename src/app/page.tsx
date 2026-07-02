'use client';

import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, tokenProcessed } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!tokenProcessed) return;
    if (user) {
      if (user.role === 'TEACHER') {
        router.replace('/dashboard');
      } else {
        router.replace('/lesson');
      }
    } else {
      router.replace('/login');
    }
  }, [user, tokenProcessed, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}
