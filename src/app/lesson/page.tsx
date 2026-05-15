import { AuthGuard } from '@/components/auth/AuthGuard';
import LessonPageClient from '@/components/lesson/LessonPageClient';

export default function LessonPage() {
  return (
    <AuthGuard>
      <LessonPageClient />
    </AuthGuard>
  );
}
