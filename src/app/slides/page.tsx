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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">載入投影片中...</p>
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
