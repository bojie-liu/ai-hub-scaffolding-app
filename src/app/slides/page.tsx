'use client';

import { useEffect, useState, Suspense } from 'react';
import { useUser } from '@/contexts/UserContext';
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

function SlidesContent() {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getSlides();
        if (result.success && result.data) {
          setSlides(result.data as SlideData[]);
        }
      } catch (err) {
        console.error('Failed to load slides:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Skeleton className="h-[70vh] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Slides slides={slides} />
      </div>
    </div>
  );
}

export default function SlidesPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-slate-500">Loading slides...</div>
        </div>
      }>
        <SlidesContent />
      </Suspense>
    </AuthGuard>
  );
}
