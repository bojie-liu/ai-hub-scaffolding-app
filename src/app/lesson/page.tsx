import LessonPageClient from '@/components/lesson/LessonPageClient';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function LessonPage() {
  return (
    <AuthGuard>
      <Navbar />
      <LessonPageClient />
    </AuthGuard>
  );
}
