'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Slides from '@/components/lesson/presentation/Slides';
import { AuthGuard } from '@/components/auth/AuthGuard';
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
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSlides().then((result) => {
      if (result.success && result.data) {
        setSlides(result.data as SlideData[]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Presentation Slides</h1>
          <p className="text-muted-foreground text-sm mt-1">Use arrow keys or click to navigate. Press F for fullscreen.</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse text-muted-foreground">Loading slides...</div>
          </div>
        ) : (
          <Slides slides={slides} />
        )}
      </main>
    </AuthGuard>
  );
}
