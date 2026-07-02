'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Quiz from '@/components/lesson/interactive/Quiz';
import { useUser } from '@/contexts/UserContext';
import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface QuizData {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  quizType: string;
}

interface QuestionData {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

export default function QuizzesPage() {
  const { user } = useUser();
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);
  const [quizData, setQuizData] = useState<Map<number, { questions: QuestionData[] }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllQuizzes().then((result) => {
      if (result.success && result.data) {
        setQuizzes(result.data as QuizData[]);
      }
      setLoading(false);
    });
  }, []);

  async function handleExpandQuiz(quizId: number) {
    if (expandedQuiz === quizId) {
      setExpandedQuiz(null);
      return;
    }

    if (!quizData.has(quizId)) {
      const result = await getQuiz(quizId);
      if (result.success && result.data) {
        setQuizData((prev) => new Map(prev).set(quizId, { questions: result.data.questions as QuestionData[] }));
      }
    }
    setExpandedQuiz(quizId);
  }

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-6 bg-slate-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
          <p className="text-muted-foreground text-sm mt-1">Test your understanding of professional ethics in teaching</p>
        </div>

        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No quizzes available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => {
              const isExpanded = expandedQuiz === quiz.id;
              const data = quizData.get(quiz.id);

              return (
                <Card key={quiz.id}>
                  <CardHeader className="cursor-pointer" onClick={() => handleExpandQuiz(quiz.id)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        {quiz.description && (
                          <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {quiz.quizType === 'mixed' ? 'Mixed' : quiz.quizType === 'multiple_choice' ? 'Multiple Choice' : quiz.quizType}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && data && user && user.userId > 0 && (
                    <CardContent>
                      <Quiz
                        quizId={quiz.id}
                        title={quiz.title}
                        questions={data.questions}
                        userId={user.userId}
                      />
                    </CardContent>
                  )}

                  {isExpanded && (!user || user.userId <= 0) && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-center py-4">Please sign in to take this quiz.</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
