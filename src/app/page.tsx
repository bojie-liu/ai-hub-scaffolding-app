'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Skeleton } from '@/components/ui/skeleton';

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
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 text-center">
        <Skeleton className="h-8 w-48 mx-auto" />
        <p className="text-muted-foreground text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
