'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import Slides from '@/components/lesson/presentation/Slides';
import { getSlides } from '@/lib/actions/slides';
import { Skeleton } from '@/components/ui/skeleton';

type Slide = {
  id: number;
  storageKey: string;
  slideOrder: number;
  title: string;
  content: string;
  slideType: string;
  backgroundColor: string | null;
};

export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSlides().then((result) => {
      if (result.success && result.data) {
        setSlides(result.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Presentation Slides</h1>
          <p className="text-muted-foreground mb-6">Use arrow keys or click to navigate. Press F for fullscreen.</p>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[60vh] w-full rounded-xl" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <Slides slides={slides} />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
