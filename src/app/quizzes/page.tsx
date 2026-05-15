'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import Quiz from '@/components/lesson/interactive/Quiz';
import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';

interface QuizWithQuestions {
  quiz: { id: number; title: string; description: string | null; quizType: string };
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
  const [quizList, setQuizList] = useState<{ id: number; title: string; description: string | null; quizType: string }[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    getAllQuizzes().then((result) => {
      if (result.success && result.data) {
        setQuizList(result.data);
      }
      setLoading(false);
    });
  }, []);

  async function handleSelectQuiz(quizId: number) {
    setLoadingQuiz(true);
    const result = await getQuiz(quizId);
    if (result.success && result.data) {
      setActiveQuiz(result.data as QuizWithQuestions);
    }
    setLoadingQuiz(false);
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Quizzes & Assessments</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : activeQuiz && user && user.userId > 0 ? (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => setActiveQuiz(null)}>
              &larr; Back to Quiz List
            </Button>
            <Quiz
              quizId={activeQuiz.quiz.id}
              title={activeQuiz.quiz.title}
              questions={activeQuiz.questions}
              userId={user.userId}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {quizList.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No quizzes available yet.</p>
              </div>
            )}
            {quizList.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {quiz.quizType.replace('_', ' ')}
                    </Badge>
                  </div>
                  {quiz.description && (
                    <CardDescription>{quiz.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleSelectQuiz(quiz.id)}
                    disabled={loadingQuiz || !user || user.userId <= 0}
                  >
                    {loadingQuiz ? 'Loading...' : 'Start Quiz'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
