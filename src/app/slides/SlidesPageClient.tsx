'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import Slides from '@/components/lesson/presentation/Slides';
import { getSlides } from '@/lib/actions/slides';
import { Skeleton } from '@/components/ui/skeleton';

interface SlideItem {
  id: number;
  storageKey: string;
  slideOrder: number;
  title: string;
  content: string;
  slideType: 'title' | 'content' | 'activity' | 'assessment';
  backgroundColor: string | null;
}

export default function SlidesPageClient() {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getSlides();
        if (result.success && result.data) {
          setSlides(result.data as SlideItem[]);
        } else {
          setError(result.error || 'Failed to load slides');
        }
      } catch {
        setError('An unexpected error occurred while loading slides');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-[60vh] w-full rounded-xl" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground">
                  Please try refreshing the page.
                </p>
              </div>
            </div>
          ) : (
            <Slides slides={slides} />
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
