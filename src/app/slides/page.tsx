'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
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
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlides() {
      const result = await getSlides();
      if (result.success && result.data) {
        setSlides(result.data as SlideData[]);
      }
      setLoading(false);
    }
    loadSlides();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Lesson Presentation</h1>
          <p className="text-muted-foreground mt-1">Use arrow keys to navigate. Press F for fullscreen mode.</p>
        </div>
        <Slides slides={slides} />
      </div>
    </AuthGuard>
  );
}
