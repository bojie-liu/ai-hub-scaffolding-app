'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import Slides from '@/components/lesson/presentation/Slides';
import { getSlides } from '@/lib/actions/slides';
import { Skeleton } from '@/components/ui/skeleton';

interface SlideData {
  id: number;
  storageKey: string;
  slideOrder: number;
  title: string;
  content: string;
  slideType: 'title' | 'content' | 'activity' | 'assessment';
  backgroundColor: string | null;
}

export default function SlidesPage() {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSlides().then((result) => {
      if (result.success && result.data) {
        setSlides(
          result.data.map((s) => ({
            ...s,
            slideType: s.slideType as SlideData['slideType'],
          }))
        );
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="py-4 px-4">
          {loading ? (
            <div className="max-w-5xl mx-auto space-y-4">
              <Skeleton className="h-[70vh] w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : (
            <Slides slides={slides} />
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
