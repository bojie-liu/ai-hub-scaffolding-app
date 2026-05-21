'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Slides from '@/components/lesson/presentation/Slides';
import { getSlides } from '@/lib/actions/slides';
import { Skeleton } from '@/components/ui/skeleton';

interface Slide {
  id: number;
  storageKey: string;
  slideOrder: number;
  title: string;
  content: string;
  slideType: string;
  backgroundColor: string | null;
}

export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSlides();
      if (result.success && result.data) {
        setSlides(result.data);
      } else {
        setError(result.error ?? 'Failed to load slides');
      }
    } catch {
      setError('Failed to load slides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Presentation Slides</h1>
            <p className="text-muted-foreground mt-1 text-sm">Use arrow keys or click to navigate. Press F for fullscreen.</p>
          </div>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[70vh] w-full rounded-xl" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : (
            <Slides slides={slides as any} />
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
