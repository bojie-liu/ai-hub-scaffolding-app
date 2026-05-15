'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import Quiz from '@/components/lesson/interactive/Quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface QuizSummary {
  id: number;
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

export default function QuizPageClient() {
  const { user, isGuest } = useUser();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<{ quizId: number; title: string; questions: QuizQuestionData[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getAllQuizzes();
      if (result.success && result.data) {
        setQuizzes(result.data as QuizSummary[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSelectQuiz(quizId: number) {
    setQuizLoading(true);
    const result = await getQuiz(quizId);
    if (result.success && result.data) {
      const data = result.data as { quiz: { id: number; title: string }; questions: QuizQuestionData[] };
      setActiveQuiz({
        quizId: data.quiz.id,
        title: data.quiz.title,
        questions: data.questions,
      });
    }
    setQuizLoading(false);
  }

  if (!user || isGuest) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-amber-500 mb-2" />
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please sign in to take quizzes. Guest accounts cannot submit answers.
            </p>
            <Link href="/login" className="inline-flex items-center justify-center h-8 rounded-md border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted transition-colors">
              Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (activeQuiz) {
    return (
      <div>
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => setActiveQuiz(null)}>
          &larr; Back to Quiz List
        </Button>
        <Quiz
          quizId={activeQuiz.quizId}
          title={activeQuiz.title}
          questions={activeQuiz.questions}
          userId={user.userId}
        />
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No quizzes available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quizzes.map((q) => (
        <Card
          key={q.id}
          className="cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => handleSelectQuiz(q.id)}
        >
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{q.title}</h3>
                {q.description && (
                  <p className="text-sm text-muted-foreground mt-1">{q.description}</p>
                )}
              </div>
              <Badge variant="outline" className="shrink-0 capitalize">
                {q.quizType.replace('_', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
      {quizLoading && (
        <div className="flex justify-center py-8">
          <Skeleton className="h-64 w-full max-w-2xl rounded-xl" />
        </div>
      )}
    </div>
  );
}
