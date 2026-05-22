'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import Slides from '@/components/lesson/presentation/Slides';
import { getSlides } from '@/lib/actions/slides';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

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
  return (
    <AuthGuard>
      <SlidesContent />
    </AuthGuard>
  );
}

function SlidesContent() {
  const { user } = useUser();
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await getSlides();
      if (result.success && result.data) {
        setSlides(result.data as SlideData[]);
      } else {
        setError(result.error ?? 'Failed to load slides');
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Lesson Slides</h1>
          <p className="text-slate-600 mt-1">
            Use keyboard arrows or click to navigate. Press <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-mono">F</kbd> for fullscreen.
          </p>
        </div>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-[70vh] w-full rounded-xl" />
          </div>
        )}

        {error && (
          <Card className="max-w-md mx-auto mt-8">
            <CardContent className="pt-6 text-center">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && slides.length === 0 && (
          <Card className="max-w-md mx-auto mt-8">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No slides available yet.</p>
            </CardContent>
          </Card>
        )}

        {!loading && slides.length > 0 && <Slides slides={slides} />}
      </main>
    </div>
  );
}
