'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { submitQuizAttempt } from '@/lib/actions/quiz';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Trophy, RotateCcw } from 'lucide-react';

interface Answer {
  id: number;
  answerText: string;
  isCorrect: boolean;
  answerOrder: number;
}

interface Question {
  id: number;
  storageKey: string;
  questionText: string;
  questionType: string;
  explanation: string | null;
  answers: Answer[];
}

interface QuizData {
  quiz: { id: number; title: string; description: string | null; quizType: string };
  questions: Question[];
}

export function QuizzesClient() {
  const searchParams = useSearchParams();
  const quizId = parseInt(searchParams.get('quiz') || '1');
  const { user } = useUser();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ score: number; totalQuestions: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const { getQuiz } = await import('@/lib/actions/quiz');
        const result = await getQuiz(quizId);
        if (result.success && result.data) {
          setQuizData(result.data);
        } else {
          setError('Quiz not found');
        }
      } catch {
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [quizId]);

  async function handleSubmit() {
    if (!user || !quizData) return;
    setError('');
    try {
      const responses = quizData.questions.map((q) => {
        const answer = answers[q.id];
        if (q.questionType === 'short_answer') {
          return { questionId: q.id, textResponse: answer as string };
        }
        return { questionId: q.id, answerId: answer as number };
      });

      const result = await submitQuizAttempt(user.userId, quizData.quiz.id, responses);
      if (result.success && result.data) {
        setResults(result.data);
        setSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit quiz');
      }
    } catch {
      setError('An unexpected error occurred');
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </AuthGuard>
    );
  }

  if (error && !quizData) {
    return (
      <AuthGuard>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Card>
            <CardContent className="p-8">
              <p className="text-red-600">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/lesson'}>
                Back to Lesson
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  if (!quizData) return null;

  if (submitted && results) {
    const percentage = Math.round((results.score / results.totalQuestions) * 100);
    return (
      <AuthGuard>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
              <CardDescription>{quizData.quiz.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-4xl font-bold text-blue-600">{results.score}/{results.totalQuestions}</p>
                <p className="text-muted-foreground">{percentage}% correct</p>
              </div>
              <Progress value={percentage} className="h-3" />
              <div className="space-y-3">
                {quizData.questions.map((q) => {
                  const userAnswer = answers[q.id];
                  const isCorrect = q.questionType === 'short_answer'
                    ? !!userAnswer
                    : q.answers.find(a => a.id === userAnswer)?.isCorrect ?? false;
                  return (
                    <div key={q.id} className={`p-3 rounded-lg text-left ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-start gap-2">
                        {isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" /> : <XCircle className="h-5 w-5 text-red-600 shrink-0" />}
                        <div>
                          <p className="font-medium text-sm">{q.questionText}</p>
                          {q.explanation && <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => window.location.href = '/lesson'}>
                  Back to Lesson
                </Button>
                <Button onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQuestion(0); setResults(null); }}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  const question = quizData.questions[currentQuestion];
  const totalQuestions = quizData.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{quizData.quiz.title}</h1>
          {quizData.quiz.description && <p className="text-muted-foreground mt-1">{quizData.quiz.description}</p>}
          <div className="flex items-center gap-4 mt-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground">{currentQuestion + 1}/{totalQuestions}</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">Question {currentQuestion + 1}</Badge>
              <Badge>{question.questionType === 'true_false' ? 'True/False' : question.questionType === 'short_answer' ? 'Short Answer' : 'Multiple Choice'}</Badge>
            </div>
            <CardTitle className="text-lg mt-2">{question.questionText}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.questionType === 'short_answer' ? (
              <div className="space-y-2">
                <Label htmlFor="answer">Your Answer</Label>
                <Textarea
                  id="answer"
                  value={(answers[question.id] as string) || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                  placeholder="Type your answer here..."
                  rows={3}
                />
              </div>
            ) : (
              <div className="space-y-2">
                {question.answers.map((answer) => (
                  <button
                    key={answer.id}
                    onClick={() => setAnswers(prev => ({ ...prev, [question.id]: answer.id }))}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      answers[question.id] === answer.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {answer.answerText}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          {currentQuestion === totalQuestions - 1 ? (
            <Button onClick={handleSubmit} disabled={Object.keys(answers).length < totalQuestions}>
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}>
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
