import { getSlides } from '@/lib/actions/slides';
import SlidesClient from './SlidesClient';

type SlideType = 'title' | 'content' | 'activity' | 'assessment';

export default async function SlidesPage() {
  const result = await getSlides();
  const rawSlides = result.success ? result.data ?? [] : [];

  const slides = rawSlides.map((s) => ({
    ...s,
    slideType: s.slideType as SlideType,
  }));

  return <SlidesClient slides={slides} />;
}
