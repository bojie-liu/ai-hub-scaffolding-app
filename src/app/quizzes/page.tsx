'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Quiz from '@/components/lesson/interactive/Quiz';
import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface QuizSummary {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  quizType: string | null;
}

interface QuizDetail {
  quiz: QuizSummary;
  questions: {
    id: number;
    questionText: string;
    questionType: string;
    explanation: string | null;
    answers: { id: number; answerText: string; isCorrect: boolean }[];
  }[];
}

export default function QuizzesPage() {
  const { user } = useUser();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);
  const [quizDetail, setQuizDetail] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllQuizzes();
      if (result.success && result.data) {
        setQuizzes(result.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  async function handleExpand(quizId: number) {
    if (expandedQuiz === quizId) {
      setExpandedQuiz(null);
      setQuizDetail(null);
      return;
    }

    setExpandedQuiz(quizId);
    setDetailLoading(true);
    try {
      const result = await getQuiz(quizId);
      if (result.success && result.data) {
        setQuizDetail(result.data as QuizDetail);
      }
    } catch {
      // silently fail
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
            <p className="text-muted-foreground mt-1">Test your understanding with pre-tests and post-tests</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No quizzes available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{quiz.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {quiz.quizType ?? 'multiple_choice'}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExpand(quiz.id)}
                      >
                        {expandedQuiz === quiz.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {quiz.description && (
                      <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                    )}
                  </CardHeader>
                  {expandedQuiz === quiz.id && (
                    <CardContent>
                      {detailLoading ? (
                        <Skeleton className="h-40 w-full" />
                      ) : quizDetail && user ? (
                        <Quiz
                          quizId={quizDetail.quiz.id}
                          title={quizDetail.quiz.title}
                          questions={quizDetail.questions.map((q) => ({
                            id: q.id,
                            questionText: q.questionText,
                            questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                            explanation: q.explanation,
                            answers: q.answers,
                          }))}
                          userId={user.userId}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Please log in to take this quiz.</p>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
