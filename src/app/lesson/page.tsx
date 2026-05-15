import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import LessonView from '@/components/lesson/LessonView';

export default function LessonPage() {
  return (
    <AuthGuard>
      <Navbar />
      <LessonView />
    </AuthGuard>
  );
}
