'use client';

import { useState } from 'react';
import { submitQuizAttempt } from '@/lib/actions/quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  explanation: string | null;
  answers: { id: number; answerText: string; isCorrect: boolean }[];
}

interface QuizProps {
  quizId: number;
  title: string;
  questions: QuizQuestion[];
  userId: number;
}

export default function Quiz({ quizId, title, questions, userId }: QuizProps) {
  const [answers, setAnswers] = useState<Map<number, number | string>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  function handleSelect(questionId: number, answerId: number) {
    if (submitted) return;
    setAnswers((prev) => new Map(prev).set(questionId, answerId));
  }

  function handleTextChange(questionId: number, text: string) {
    if (submitted) return;
    setAnswers((prev) => new Map(prev).set(questionId, text));
  }

  async function handleSubmit() {
    setLoading(true);
    const responses = Array.from(answers.entries()).map(([questionId, value]) => ({
      questionId,
      answerId: typeof value === 'number' ? value : undefined,
      textResponse: typeof value === 'string' ? value : undefined,
    }));

    const result = await submitQuizAttempt(userId, quizId, responses);
    if (result.success && result.data) {
      setScore(result.data.score);
      setSubmitted(true);
    }
    setLoading(false);
  }

  function handleReset() {
    setAnswers(new Map());
    setSubmitted(false);
    setScore(0);
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-blue-600 px-6 py-4">
        <CardTitle className="text-white text-lg">{title}</CardTitle>
        <p className="text-blue-100 text-sm mt-0.5">{questions.length} questions</p>
      </div>
      <CardContent className="p-6 space-y-6">
        {questions.map((q, qi) => {
          const selected = answers.get(q.id);
          const isCorrect =
            submitted &&
            typeof selected === 'number' &&
            q.answers.find((a) => a.isCorrect)?.id === selected;

          return (
            <div key={q.id}>
              <p className="font-medium text-slate-800 mb-3">
                <span className="text-blue-600 font-bold mr-2">{qi + 1}.</span>
                {q.questionText}
                <Badge variant="outline" className="ml-2 text-xs">
                  {q.questionType === 'true_false' ? 'True/False' : q.questionType === 'short_answer' ? 'Short Answer' : 'Multiple Choice'}
                </Badge>
              </p>

              {q.questionType === 'short_answer' ? (
                <Textarea
                  placeholder="Type your answer..."
                  value={typeof selected === 'string' ? selected : ''}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  disabled={submitted}
                  className="mb-2"
                />
              ) : (
                <div className="space-y-2">
                  {q.answers.map((a) => {
                    let cls = 'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ';
                    if (!submitted) {
                      cls += selected === a.id
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300';
                    } else {
                      if (a.isCorrect) cls += 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium';
                      else if (selected === a.id && !isCorrect) cls += 'border-red-400 bg-red-50 text-red-700';
                      else cls += 'border-slate-200 text-slate-500';
                    }
                    return (
                      <button key={a.id} className={cls} onClick={() => handleSelect(q.id, a.id)} disabled={submitted}>
                        <span className="font-semibold mr-2">{String.fromCharCode(65 + q.answers.indexOf(a))}.</span>
                        {a.answerText}
                      </button>
                    );
                  })}
                </div>
              )}

              {submitted && q.explanation && (
                <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}

        <div className="flex items-center gap-4">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={loading || answers.size < questions.filter(q => q.questionType !== 'short_answer').length}>
              {loading ? 'Submitting...' : 'Submit Answers'}
            </Button>
          ) : (
            <>
              <div className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700">
                Score:{' '}
                <span className={score === questions.length ? 'text-emerald-600' : score >= questions.length / 2 ? 'text-blue-600' : 'text-red-500'}>
                  {score}/{questions.length}
                </span>
              </div>
              <Button variant="outline" onClick={handleReset}>Try Again</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
