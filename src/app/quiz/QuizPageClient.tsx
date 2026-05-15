'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import { useUser } from '@/contexts/UserContext';
import Quiz from '@/components/lesson/interactive/Quiz';

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

interface QuizData {
  quizId: number;
  title: string;
  questions: QuizQuestion[];
}

interface QuizPageClientProps {
  quiz: QuizData | null;
}

export default function QuizPageClient({ quiz }: QuizPageClientProps) {
  const { user } = useUser();

  return (
    <>
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <AuthGuard>
          {quiz ? (
            <div className="max-w-3xl mx-auto">
              <Quiz
                quizId={quiz.quizId}
                title={quiz.title}
                questions={quiz.questions}
                userId={user?.userId ?? -1}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-2">
                <p className="text-lg text-muted-foreground">
                  Quiz not available.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please check back later.
                </p>
              </div>
            </div>
          )}
        </AuthGuard>
      </main>
    </>
  );
}
