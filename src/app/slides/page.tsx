'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Slides from '@/components/lesson/presentation/Slides';
import { getSlides } from '@/lib/actions/slides';
import { Skeleton } from '@/components/ui/skeleton';

export default function SlidesPage() {
  const [slidesData, setSlidesData] = useState<Awaited<ReturnType<typeof getSlides>> | null>(null);

  useEffect(() => {
    getSlides().then(setSlidesData);
  }, []);

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Presentation Slides</h1>
        {!slidesData ? (
          <div className="space-y-4">
            <Skeleton className="h-[60vh] w-full rounded-xl" />
          </div>
        ) : slidesData.success && slidesData.data ? (
          <Slides slides={slidesData.data.map((s) => ({ ...s, slideType: s.slideType as 'title' | 'content' | 'activity' | 'assessment' }))} />
        ) : (
          <p className="text-muted-foreground">Failed to load slides.</p>
        )}
      </div>
    </AuthGuard>
  );
}
