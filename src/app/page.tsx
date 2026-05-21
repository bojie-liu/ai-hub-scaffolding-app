'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function Home() {
  const { user, tokenProcessed } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!tokenProcessed) return;
    if (user?.role === 'TEACHER') {
      router.replace('/dashboard');
    } else {
      router.replace('/lesson');
    }
  }, [user, tokenProcessed, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">AI</div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
