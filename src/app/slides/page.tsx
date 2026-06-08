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
    async function load() {
      const result = await getSlides();
      if (result.success && result.data) {
        setSlides(result.data as SlideData[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Lesson Slides</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Use arrow keys or click to navigate. Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">F</kbd> for fullscreen.
        </p>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[60vh] w-full rounded-xl" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <Slides slides={slides} />
        )}
      </main>
    </AuthGuard>
  );
}
