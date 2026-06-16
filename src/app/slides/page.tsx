'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import Slides from '@/components/lesson/presentation/Slides';
import { getSlides } from '@/lib/actions/slides';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function SlidesPage() {
  const [slidesData, setSlidesData] = useState<Awaited<ReturnType<typeof getSlides>> | null>(null);

  useEffect(() => {
    getSlides().then(setSlidesData);
  }, []);

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Presentation Slides</h1>
          <p className="text-muted-foreground mt-1">Use arrow keys to navigate. Press F for fullscreen mode.</p>
        </div>
        {!slidesData ? (
          <div className="space-y-4">
            <Skeleton className="h-[70vh] w-full rounded-xl" />
          </div>
        ) : slidesData.success && slidesData.data ? (
          <Slides slides={slidesData.data.map(s => ({ ...s, slideType: s.slideType as 'title' | 'content' | 'activity' | 'assessment' }))} />
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Failed to load slides. Please try again later.
            </CardContent>
          </Card>
        )}
      </main>
    </AuthGuard>
  );
}
