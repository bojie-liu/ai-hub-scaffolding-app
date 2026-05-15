import { getSlides } from '@/lib/actions/slides';
import SlidesPageClient from './SlidesPageClient';

export default async function SlidesPage() {
  const result = await getSlides();

  if (!result.success || !result.data || result.data.length === 0) {
    return (
      <SlidesPageClient slides={[]} />
    );
  }

  const typedSlides = result.data.map((s) => ({
    ...s,
    slideType: s.slideType as 'title' | 'content' | 'activity' | 'assessment',
  }));

  return <SlidesPageClient slides={typedSlides} />;
}
