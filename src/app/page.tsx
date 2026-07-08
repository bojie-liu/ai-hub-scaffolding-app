'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="mx-auto w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg mb-4">CD</div>
        </div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
