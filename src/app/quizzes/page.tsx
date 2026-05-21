'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import { useUser } from '@/contexts/UserContext';
import Quiz from '@/components/lesson/interactive/Quiz';

interface QuizSummary {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  quizType: string;
}

interface QuizQuestionData {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

export default function QuizzesPage() {
  const { user } = useUser();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<{
    id: number;
    title: string;
    questions: QuizQuestionData[];
  } | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    const result = await getAllQuizzes();
    if (result.success && result.data) {
      setQuizzes(result.data as QuizSummary[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  async function openQuiz(id: number) {
    setQuizLoading(true);
    const result = await getQuiz(id);
    if (result.success && result.data) {
      setSelectedQuiz({
        id: result.data.quiz.id,
        title: result.data.quiz.title,
        questions: result.data.questions.map((q: { id: number; questionText: string; questionType: string; explanation: string | null; answers: { id: number; answerText: string; isCorrect: boolean }[] }) => ({
          ...q,
          questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
        })),
      });
    }
    setQuizLoading(false);
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-6">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-6">
          {selectedQuiz && user && user.userId > 0 ? (
            <div className="space-y-4">
              <Button variant="ghost" onClick={() => setSelectedQuiz(null)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> 返回測驗列表
              </Button>
              <Quiz
                quizId={selectedQuiz.id}
                title={selectedQuiz.title}
                questions={selectedQuiz.questions}
                userId={user.userId}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-slate-900">測驗區</h1>
              <div className="space-y-3">
                {quizzes.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">尚未有測驗</p>
                  </div>
                )}
                {quizzes.map((q) => (
                  <Card key={q.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openQuiz(q.id)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{q.title}</CardTitle>
                          {q.description && <CardDescription className="mt-1">{q.description}</CardDescription>}
                        </div>
                        <Badge variant={q.storageKey.includes('pretest') ? 'outline' : 'default'}>
                          {q.storageKey.includes('pretest') ? '前測' : '後測'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm">開始作答</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {quizLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
