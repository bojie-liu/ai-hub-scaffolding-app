'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
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
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSlides() {
      const result = await getSlides();
      if (result.success && result.data) {
        setSlides(result.data as SlideData[]);
      } else {
        setError(result.error || '無法載入投影片');
      }
      setLoading(false);
    }
    loadSlides();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-800">課堂投影片</h1>
            <p className="text-slate-600 mt-1">使用鍵盤方向鍵或點擊導航瀏覽投影片，按 F 鍵切換全螢幕模式</p>
          </div>
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          ) : (
            <Slides slides={slides} />
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
