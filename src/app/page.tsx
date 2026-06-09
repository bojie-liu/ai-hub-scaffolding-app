'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function Home() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user?.role === 'TEACHER') {
      router.replace('/dashboard');
    } else {
      router.replace('/lesson');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Redirecting...</div>
    </div>
  );
}
