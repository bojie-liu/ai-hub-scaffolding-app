'use client';

import Slides from '@/components/lesson/presentation/Slides';

type SlideType = 'title' | 'content' | 'activity' | 'assessment';

interface SlideRow {
  id: number;
  storageKey: string;
  slideOrder: number;
  title: string;
  content: string;
  slideType: string;
  backgroundColor: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface Slide {
  id: number;
  storageKey: string;
  slideOrder: number;
  title: string;
  content: string;
  slideType: SlideType;
  backgroundColor: string | null;
}

export default function SlidesClient({ slides }: { slides: SlideRow[] }) {
  const typedSlides: Slide[] = slides.map((s) => ({
    ...s,
    slideType: s.slideType as SlideType,
  }));

  return <Slides slides={typedSlides} />;
}
