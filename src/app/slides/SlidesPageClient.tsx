'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
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

interface SlidesPageClientProps {
  slides: Slide[];
}

export default function SlidesPageClient({ slides }: SlidesPageClientProps) {
  return (
    <ScrollRootProvider>
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <AuthGuard>
          {slides.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-2">
                <p className="text-lg text-muted-foreground">
                  No slides available yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please check back later.
                </p>
              </div>
            </div>
          ) : (
            <Slides slides={slides} />
          )}
        </AuthGuard>
      </main>
    </ScrollRootProvider>
  );
}
