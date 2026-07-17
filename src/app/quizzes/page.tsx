'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import Quiz from '@/components/lesson/interactive/Quiz';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/contexts/UserContext';
import { getQuiz, getAllQuizzes } from '@/lib/actions/quiz';

interface QuizWithQuestions {
  quiz: { id: number; title: string; description: string | null };
  questions: {
    id: number;
    questionText: string;
    questionType: 'multiple_choice' | 'true_false' | 'short_answer';
    explanation: string | null;
    answers: { id: number; answerText: string; isCorrect: boolean }[];
  }[];
}

export default function QuizzesPage() {
  const { user } = useUser();
  const [quizList, setQuizList] = useState<{ id: number; title: string; description: string | null }[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    getAllQuizzes().then((result) => {
      if (result.success && result.data) {
        setQuizList(result.data);
      }
      setLoading(false);
    });
  }, []);

  async function handleSelectQuiz(quizId: number) {
    setQuizLoading(true);
    const result = await getQuiz(quizId);
    if (result.success && result.data) {
      setActiveQuiz(result.data as QuizWithQuestions);
    }
    setQuizLoading(false);
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Quizzes</h1>
          <p className="text-muted-foreground mb-6">Test your knowledge on AI tools and the TPACK framework</p>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : quizList.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No quizzes available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Quiz selector */}
              {!activeQuiz ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {quizList.map((q) => (
                    <Card
                      key={q.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSelectQuiz(q.id)}
                    >
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-slate-900 mb-1">{q.title}</h3>
                        {q.description && (
                          <p className="text-sm text-muted-foreground">{q.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : quizLoading ? (
                <Skeleton className="h-64 w-full rounded-xl" />
              ) : (
                <div>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-1"
                  >
                    &larr; Back to quiz list
                  </button>
                  {user && user.userId > 0 ? (
                    <Quiz
                      quizId={activeQuiz.quiz.id}
                      title={activeQuiz.quiz.title}
                      questions={activeQuiz.questions}
                      userId={user.userId}
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Please sign in to take quizzes.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
