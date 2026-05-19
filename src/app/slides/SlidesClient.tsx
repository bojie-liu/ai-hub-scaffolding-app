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
      <main className="py-6 px-4">
        <Slides slides={slides} />
      </main>
    </div>
  );
}
