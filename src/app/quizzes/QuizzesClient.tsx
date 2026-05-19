'use client';

import Navbar from '@/components/common/Navbar';
import QuizPageClient from '@/components/interactive/QuizPageClient';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Question {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  questionOrder: number;
  explanation: string | null;
  answers: {
    id: number;
    answerText: string;
    isCorrect: boolean;
    answerOrder: number;
  }[];
}

interface QuizWithQuestions {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  quizType: string;
  questions: Question[];
}

export default function QuizzesClient({ quizzes }: { quizzes: QuizWithQuestions[] }) {
  const { user } = useUser();

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">No quizzes available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Quizzes</h1>
        <div className="space-y-8">
          {quizzes.map((quiz) => (
            <div key={quiz.id}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-800">{quiz.title}</h2>
                <Badge variant="secondary">{quiz.questions.length} questions</Badge>
              </div>
              {quiz.description && (
                <p className="text-sm text-muted-foreground mb-4">{quiz.description}</p>
              )}
              <QuizPageClient
                quizId={quiz.id}
                title={quiz.title}
                questions={quiz.questions}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
