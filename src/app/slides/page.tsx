'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getSlides } from '@/lib/actions/slides';
import Slides from '@/components/lesson/presentation/Slides';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Skeleton } from '@/components/ui/skeleton';

interface Slide {
  id: number;
  storageKey: string;
  slideOrder: number;
  title: string;
  content: string;
  slideType: 'title' | 'content' | 'activity' | 'assessment';
  backgroundColor: string | null;
}

export default function SlidesPage() {
  const { user } = useUser();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getSlides();
      if (result.success && result.data) {
        setSlides(result.data as Slide[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (!user) {
    return (
      <AuthGuard>
        <div />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="max-w-5xl mx-auto space-y-4">
              <Skeleton className="h-[70vh] w-full rounded-xl" />
            </div>
          ) : (
            <Slides slides={slides} />
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
