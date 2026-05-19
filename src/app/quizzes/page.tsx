'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import QuizPageClient from '@/components/interactive/QuizPageClient';
import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface QuizListItem {
  id: number;
  title: string;
  description: string | null;
  quizType: string;
}

interface QuizDetail {
  quiz: { id: number; title: string };
  questions: {
    id: number;
    questionText: string;
    questionType: string;
    questionOrder: number;
    explanation: string | null;
    answers: { id: number; answerText: string; isCorrect: boolean; answerOrder: number }[];
  }[];
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);
  const [quizData, setQuizData] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllQuizzes().then((result) => {
      if (result.success && result.data) setQuizzes(result.data as QuizListItem[]);
      setLoading(false);
    });
  }, []);

  async function handleExpand(quizId: number) {
    if (expandedQuiz === quizId) {
      setExpandedQuiz(null);
      setQuizData(null);
      return;
    }
    const result = await getQuiz(quizId);
    if (result.success && result.data) {
      setQuizData(result.data as unknown as QuizDetail);
      setExpandedQuiz(quizId);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> Quizzes & Assessments
        </h1>
        {loading ? (
          <p className="text-muted-foreground">Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
          <p className="text-muted-foreground">No quizzes available yet.</p>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => handleExpand(quiz.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {quiz.quizType.replace('_', ' ')}
                    </Badge>
                    {expandedQuiz === quiz.id ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>
                {quiz.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {quiz.description}
                  </p>
                )}
              </CardHeader>
              {expandedQuiz === quiz.id && quizData && (
                <CardContent>
                  <QuizPageClient
                    quizId={quizData.quiz.id}
                    title={quizData.quiz.title}
                    questions={quizData.questions}
                  />
                </CardContent>
              )}
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
