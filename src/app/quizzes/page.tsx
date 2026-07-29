'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';
import { getAllQuizzes } from '@/lib/actions/quiz';
import Link from 'next/link';

interface QuizItem {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  quizType: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizzes() {
      const result = await getAllQuizzes();
      if (result.success && result.data) {
        setQuizzes(result.data as QuizItem[]);
      }
      setLoading(false);
    }
    loadQuizzes();
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Card key={i}><CardContent className="pt-6"><div className="animate-pulse h-6 bg-muted rounded w-3/4 mb-2" /><div className="animate-pulse h-4 bg-muted rounded w-1/2" /></CardContent></Card>
            ))}
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Quizzes</h1>
        <p className="text-muted-foreground mb-6">Test your understanding with pre-class and post-class assessments.</p>

        <div className="space-y-4">
          {quizzes.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No quizzes available yet.</p>
              </CardContent>
            </Card>
          )}

          {quizzes.map((quiz) => (
            <Link key={quiz.id} href={`/quizzes/${quiz.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{quiz.title}</CardTitle>
                    <Badge variant="outline">{quiz.quizType === 'mixed' ? 'Mixed' : quiz.quizType}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {quiz.description && (
                    <p className="text-sm text-muted-foreground mb-2">{quiz.description}</p>
                  )}
                  <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                    Take Quiz <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
