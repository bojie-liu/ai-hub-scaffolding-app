'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { getAllQuizzes, getQuiz, submitQuizAttempt } from '@/lib/actions/quiz';

interface QuizInfo {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  quizType: string;
}

interface QuestionWithAnswers {
  id: number;
  quizId: number;
  storageKey: string;
  questionText: string;
  questionOrder: number;
  questionType: string;
  explanation: string | null;
  answers: { id: number; questionId: number; answerText: string; isCorrect: boolean; answerOrder: number }[];
}

export default function QuizzesPage() {
  const { user } = useUser();
  const [quizzes, setQuizzes] = useState<QuizInfo[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<{ quiz: QuizInfo; questions: QuestionWithAnswers[] } | null>(null);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllQuizzes().then((result) => {
      if (result.success && result.data) {
        setQuizzes(result.data);
      }
      setLoading(false);
    });
  }, []);

  const openQuiz = useCallback(async (id: number) => {
    const result = await getQuiz(id);
    if (result.success && result.data) {
      setSelectedQuiz(result.data as { quiz: QuizInfo; questions: QuestionWithAnswers[] });
      setAnswers(new Map());
      setSubmitted(false);
      setScore(0);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedQuiz || !user || user.role === 'GUEST') return;
    setSubmitting(true);

    const questions = selectedQuiz.questions;
    let correct = 0;
    const responses: { questionId: number; answerId?: number }[] = [];

    for (const q of questions) {
      const selectedAnswerId = answers.get(q.id);
      if (selectedAnswerId) {
        responses.push({ questionId: q.id, answerId: selectedAnswerId });
        const answer = q.answers.find((a) => a.id === selectedAnswerId);
        if (answer?.isCorrect) correct++;
      }
    }

    await submitQuizAttempt(user.userId, selectedQuiz.quiz.id, responses);
    setScore(correct);
    setSubmitted(true);
    setSubmitting(false);
  }, [selectedQuiz, user, answers]);

  const handleReset = useCallback(() => {
    setAnswers(new Map());
    setSubmitted(false);
    setScore(0);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-slate-400">Loading quizzes...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {selectedQuiz ? (
            /* Quiz View */
            <div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedQuiz(null)} className="mb-4 gap-1">
                &larr; Back to Quizzes
              </Button>

              <Card>
                <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                  <CardTitle className="text-lg">{selectedQuiz.quiz.title}</CardTitle>
                  {selectedQuiz.quiz.description && (
                    <CardDescription className="text-blue-100">{selectedQuiz.quiz.description}</CardDescription>
                  )}
                  <p className="text-blue-200 text-sm mt-1">{selectedQuiz.questions.length} questions</p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {selectedQuiz.questions.map((q, qi) => {
                    const selectedAnswer = answers.get(q.id);
                    const isCorrect = submitted && q.answers.find((a) => a.id === selectedAnswer)?.isCorrect;

                    return (
                      <div key={q.id}>
                        <p className="font-medium text-slate-800 mb-3">
                          <span className="text-blue-600 font-bold mr-2">{qi + 1}.</span>
                          {q.questionText}
                        </p>
                        <div className="space-y-2">
                          {q.answers.map((a, ai) => {
                            let cls = 'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ';
                            if (!submitted) {
                              cls += selectedAnswer === a.id
                                ? 'border-blue-500 bg-blue-50 text-blue-800'
                                : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50';
                            } else {
                              if (a.isCorrect) cls += 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium';
                              else if (selectedAnswer === a.id && !a.isCorrect) cls += 'border-red-400 bg-red-50 text-red-700';
                              else cls += 'border-slate-200 text-slate-400';
                            }
                            return (
                              <button
                                key={a.id}
                                className={cls}
                                onClick={() => {
                                  if (!submitted) {
                                    setAnswers((prev) => new Map(prev).set(q.id, a.id));
                                  }
                                }}
                                disabled={submitted}
                              >
                                <span className="font-semibold mr-2">{String.fromCharCode(65 + ai)}.</span>
                                {a.answerText}
                              </button>
                            );
                          })}
                        </div>
                        {submitted && q.explanation && (
                          <div className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>

                <div className="px-6 pb-6 flex items-center gap-4">
                  {!submitted ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={answers.size < selectedQuiz.questions.length || submitting}
                      className="gap-1"
                    >
                      {submitting ? 'Submitting...' : 'Submit Answers'}
                    </Button>
                  ) : (
                    <>
                      <div className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Score: <span className={score === selectedQuiz.questions.length ? 'text-emerald-600' : score >= selectedQuiz.questions.length / 2 ? 'text-blue-600' : 'text-red-500'}>
                          {score}/{selectedQuiz.questions.length}
                        </span>
                        <span className="text-slate-400">({Math.round((score / selectedQuiz.questions.length) * 100)}%)</span>
                      </div>
                      <Button variant="outline" onClick={handleReset} className="gap-1">
                        <RotateCcw className="h-3.5 w-3.5" /> Try Again
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            /* Quiz List View */
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Quizzes</h1>
                <p className="text-sm text-slate-500 mt-1">Pre-test and post-test assessments</p>
              </div>

              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openQuiz(quiz.id)}>
                    <CardContent className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl shrink-0">
                          <HelpCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">{quiz.title}</h3>
                          {quiz.description && (
                            <p className="text-sm text-slate-500 mt-0.5">{quiz.description}</p>
                          )}
                        </div>
                        <Badge variant={quiz.storageKey.includes('pretest') ? 'outline' : 'default'}>
                          {quiz.storageKey.includes('pretest') ? 'Pre-Test' : 'Post-Test'}
                        </Badge>
                        <ArrowRight className="h-5 w-5 text-slate-300" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {quizzes.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-slate-500">No quizzes available. Seed the database first.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
