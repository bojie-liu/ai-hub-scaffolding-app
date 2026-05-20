'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function Home() {
  const router = useRouter();
  const { user, tokenProcessed } = useUser();

  useEffect(() => {
    if (!tokenProcessed) return;
    if (user?.role === 'TEACHER') {
      router.replace('/dashboard');
    } else if (user) {
      router.replace('/lesson');
    } else {
      router.replace('/login');
    }
  }, [user, tokenProcessed, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">知</div>
        <p className="text-slate-600">載入中...</p>
      </div>
    </div>
  );
}
