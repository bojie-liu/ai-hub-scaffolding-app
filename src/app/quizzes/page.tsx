import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import QuizPageClient from '@/components/interactive/QuizPageClient';

export default function QuizzesPage() {
  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Quizzes</h1>
        <QuizPageClient />
      </main>
    </AuthGuard>
  );
}
