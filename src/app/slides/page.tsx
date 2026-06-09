'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import Slides from '@/components/lesson/presentation/Slides';
import { getSlides } from '@/lib/actions/slides';

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
  const { user } = useUser();
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

  if (!user || user.role === 'GUEST') {
    return (
      <AuthGuard>
        <div />
      </AuthGuard>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Presentation Slides</h1>
          <p className="text-muted-foreground mt-1">
            Use arrow keys or click to navigate. Press F for fullscreen.
          </p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse text-muted-foreground">Loading slides...</div>
          </div>
        ) : (
          <Slides slides={slides} />
        )}
      </main>
    </>
  );
}
