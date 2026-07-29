'use client';

import Navbar from '@/components/common/Navbar';
import { ScrollRootProvider } from '@/contexts';
import LessonContent from '@/components/lesson/LessonContent';

export default function LessonPage() {
  return (
    <ScrollRootProvider>
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <LessonContent />
      </div>
    </ScrollRootProvider>
  );
}
