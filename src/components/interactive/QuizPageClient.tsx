'use client';

import { useUser } from '@/contexts/UserContext';
import Quiz from '@/components/lesson/interactive/Quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: {
    id: number;
    answerText: string;
    isCorrect: boolean;
  }[];
}

interface QuizPageClientProps {
  quizId: number;
  title: string;
  questions: QuizQuestion[];
}

export default function QuizPageClient({ quizId, title, questions }: QuizPageClientProps) {
  const { user, isGuest } = useUser();

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

  return (
    <Quiz
      quizId={quizId}
      title={title}
      questions={questions}
      userId={user.userId}
    />
  );
}
