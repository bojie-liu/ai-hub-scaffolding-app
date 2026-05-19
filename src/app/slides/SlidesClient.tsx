'use client';

import Navbar from '@/components/common/Navbar';
import Slides from '@/components/lesson/presentation/Slides';

interface Slide {
  id: number;
  storageKey: string;
  slideOrder: number;
  title: string;
  content: string;
  slideType: 'title' | 'content' | 'activity' | 'assessment';
  backgroundColor: string | null;
}

export default function SlidesClient({ slides }: { slides: Slide[] }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Presentation Slides</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Use arrow keys or click to navigate. Press F for fullscreen.
            </p>
          </div>
        </div>
        <Slides slides={slides} />
      </div>
    </div>
  );
}
