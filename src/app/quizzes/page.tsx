'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import Quiz from '@/components/lesson/interactive/Quiz';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight } from 'lucide-react';

interface QuizSummary {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  quizType: string;
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
  const { user, isGuest } = useUser();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllQuizzes().then((result) => {
      if (result.success && result.data) {
        setQuizzes(result.data);
      }
      setLoading(false);
    });
  }, []);

  async function handleSelectQuiz(id: number) {
    const result = await getQuiz(id);
    if (result.success && result.data) {
      setActiveQuiz(result.data as QuizDetail);
    }
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Quizzes</h1>
        <p className="text-muted-foreground mb-6">Test your knowledge of AI-enhanced software development</p>

        {activeQuiz && user && !isGuest ? (
          <div>
            <Button variant="ghost" size="sm" className="mb-4" onClick={() => setActiveQuiz(null)}>
              &larr; Back to quiz list
            </Button>
            <Quiz
              quizId={activeQuiz.quiz.id}
              title={activeQuiz.quiz.title}
              questions={activeQuiz.questions.map((q) => ({
                id: q.id,
                questionText: q.questionText,
                questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
                explanation: q.explanation,
                answers: q.answers,
              }))}
              userId={user.userId}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="h-16 bg-muted animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No quizzes available yet.</p>
                </CardContent>
              </Card>
            ) : (
              quizzes.map((quiz) => (
                <Card key={quiz.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => !isGuest && user && handleSelectQuiz(quiz.id)}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">{quiz.title}</h3>
                        {quiz.description && (
                          <CardDescription className="mt-1">{quiz.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{quiz.quizType === 'multiple_choice' ? 'Multiple Choice' : quiz.quizType}</Badge>
                        {!isGuest && user ? (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {isGuest && (
              <p className="text-sm text-muted-foreground text-center">Sign in to take quizzes</p>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
