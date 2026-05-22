'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function Home() {
  const router = useRouter();
  const { user, tokenProcessed } = useUser();

  useEffect(() => {
    if (!tokenProcessed) return;
    if (user) {
      router.replace(user.role === 'TEACHER' ? '/dashboard' : '/lesson');
    } else {
      router.replace('/login');
    }
  }, [user, tokenProcessed, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">CT</div>
        <p className="text-slate-600">Redirecting...</p>
      </div>
    </div>
  );
}
