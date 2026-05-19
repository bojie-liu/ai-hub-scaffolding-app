import { getSlides } from '@/lib/actions/slides';
import SlidesClient from './SlidesClient';

export const metadata = {
  title: 'Slides - Knowledge Management & School Development',
};

export default async function SlidesPage() {
  const result = await getSlides();

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-lg text-muted-foreground">Unable to load slides.</p>
      </div>
    );
  }

  const slides = result.data.map((s) => ({
    ...s,
    slideType: s.slideType as 'title' | 'content' | 'activity' | 'assessment',
  }));

  return <SlidesClient slides={slides} />;
}
