import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getSlides } from '@/lib/actions/slides';
import SlidesClient from './SlidesClient';

export default async function SlidesPage() {
  const result = await getSlides();
  const slides = result.success && result.data ? result.data : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AuthGuard>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <SlidesClient slides={slides} />
        </div>
      </AuthGuard>
    </div>
  );
}
