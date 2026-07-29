'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Quiz from '@/components/lesson/interactive/Quiz';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getQuiz } from '@/lib/actions/quiz';
import { useUser } from '@/contexts/UserContext';

interface QuizData {
  quiz: { id: number; title: string; description: string | null };
  questions: Array<{
    id: number;
    questionText: string;
    questionType: string;
    explanation: string | null;
    answers: Array<{ id: number; answerText: string; isCorrect: boolean }>;
  }>;
}

function castQuizQuestions(questions: QuizData['questions']) {
  return questions.map(q => ({
    ...q,
    questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
  }));
}

export default function QuizDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { user, isGuest } = useUser();
  const [data, setData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuiz() {
      const result = await getQuiz(id);
      if (result.success && result.data) {
        setData(result.data as QuizData);
      }
      setLoading(false);
    }
    loadQuiz();
  }, [id]);

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}><CardContent className="pt-4"><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
            ))}
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!data) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Quiz not found.</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  const userId = user?.userId ?? -1;

  return (
    <AuthGuard>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {!isGuest && userId > 0 ? (
          <Quiz quizId={data.quiz.id} title={data.quiz.title} questions={castQuizQuestions(data.questions)} userId={userId} />
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please sign in to take this quiz.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
