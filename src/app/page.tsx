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
    } else if (user) {
      router.replace('/lesson');
    } else {
      router.replace('/login');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
