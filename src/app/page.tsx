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
      router.replace('/lesson');
    } else {
      router.replace('/login');
    }
  }, [user, tokenProcessed, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">載入中...</p>
      </div>
    </div>
  );
}
