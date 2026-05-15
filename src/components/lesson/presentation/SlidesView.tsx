'use client';

import { useEffect, useState } from 'react';
import { getSlides } from '@/lib/actions/slides';
import Slides from './Slides';
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

export default function SlidesView() {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await getSlides();
        if (result.success && result.data) {
          setSlides(result.data as SlideData[]);
        } else {
          setError(result.error || 'Failed to load slides');
        }
      } catch {
        setError('Failed to load slides');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[60vh] w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return <Slides slides={slides} />;
}
