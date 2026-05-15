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
  createdAt: Date | null;
  updatedAt: Date | null;
}

export default function SlidesPage() {
  const [slides, setSlides] = useState<SlideData[] | null>(null);
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
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[70vh] w-full rounded-xl" />
          </div>
        ) : slides && slides.length > 0 ? (
          <Slides slides={slides} />
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-lg text-muted-foreground">No slides available.</p>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
