'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { submitQuizAttempt } from '@/lib/actions/quiz';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface Answer {
  id: number;
  answerText: string;
  isCorrect: boolean;
  answerOrder: number;
}

interface Question {
  id: number;
  questionText: string;
  questionType: string;
  questionOrder: number;
  explanation: string | null;
  answers: Answer[];
}

interface QuizProps {
  quizId: number;
  title: string;
  questions: Question[];
  userId: number;
}

export default function Quiz({ quizId, title, questions, userId }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number>>(new Map());
  const [textResponses, setTextResponses] = useState<Map<number, string>>(new Map());
  const [revealed, setRevealed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelectAnswer = useCallback((questionId: number, answerId: number) => {
    if (revealed || submitted) return;
    setSelectedAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, answerId);
      return next;
    });
  }, [revealed, submitted]);

  const handleTextResponse = useCallback((questionId: number, text: string) => {
    if (revealed || submitted) return;
    setTextResponses((prev) => {
      const next = new Map(prev);
      next.set(questionId, text);
      return next;
    });
  }, [revealed, submitted]);

  const handleCheckAnswer = () => {
    setRevealed(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setRevealed(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const responses = questions.map((q) => ({
        questionId: q.id,
        answerId: selectedAnswers.get(q.id),
        textResponse: textResponses.get(q.id),
      }));

      const result = await submitQuizAttempt(userId, quizId, responses);

      if (result.success && result.data) {
        setScore(result.data.score);
        setSubmitted(true);
        toast.success(`Quiz submitted! You scored ${result.data.score}/${result.data.totalQuestions}`);
      } else {
        toast.error(result.error ?? 'Failed to submit quiz');
      }
    } catch {
      toast.error('An error occurred while submitting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswers(new Map());
    setTextResponses(new Map());
    setRevealed(false);
    setSubmitted(false);
    setScore(0);
  };

  // Results screen
  if (submitted) {
    const percentage = Math.round((score / questions.length) * 100);
    const getMessage = () => {
      if (percentage >= 90) return 'Outstanding! You have an excellent understanding of this material.';
      if (percentage >= 75) return 'Great job! You have a solid grasp of the concepts.';
      if (percentage >= 60) return 'Good effort! Review the areas you missed to improve.';
      if (percentage >= 40) return 'Keep studying! Focus on the concepts where you struggled.';
      return 'Consider reviewing the material and trying again.';
    };

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <Trophy className="mx-auto h-12 w-12 text-amber-500 mb-2" />
          <CardTitle className="text-2xl">Quiz Results</CardTitle>
          <p className="text-muted-foreground">{title}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-5xl font-bold">
              {score}<span className="text-2xl text-muted-foreground">/{questions.length}</span>
            </p>
            <p className="text-lg font-medium text-primary">{percentage}%</p>
            <Progress value={percentage} className="h-2" />
          </div>
          <p className="text-center text-muted-foreground">{getMessage()}</p>
          <Separator />

          {/* Show each question with correct/incorrect */}
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const selected = selectedAnswers.get(q.id);
              const correctAnswer = q.answers.find((a) => a.isCorrect);
              const isCorrect = q.answers.find((a) => a.id === selected)?.isCorrect ?? false;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border ${
                    isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    )}
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm">
                        {idx + 1}. {q.questionText}
                      </p>
                      {!isCorrect && correctAnswer && (
                        <p className="text-sm text-emerald-700">
                          Correct answer: {correctAnswer.answerText}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-sm text-muted-foreground mt-1">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button onClick={handleReset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Question screen
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <Badge variant="secondary">
            {currentQuestion.questionType === 'multiple_choice'
              ? 'Multiple Choice'
              : currentQuestion.questionType === 'short_answer'
                ? 'Short Answer'
                : currentQuestion.questionType}
          </Badge>
        </div>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-base font-medium leading-relaxed">
          {currentQuestion.questionText}
        </p>

        {currentQuestion.questionType === 'multiple_choice' ? (
          <div className="space-y-2">
            {currentQuestion.answers
              .sort((a, b) => a.answerOrder - b.answerOrder)
              .map((answer) => {
                const isSelected = selectedAnswers.get(currentQuestion.id) === answer.id;
                const isCorrectAnswer = answer.isCorrect;

                let buttonClass =
                  'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all cursor-pointer';

                if (!revealed) {
                  if (isSelected) {
                    buttonClass += ' border-primary bg-primary/5 text-primary font-medium';
                  } else {
                    buttonClass +=
                      ' border-border text-foreground hover:border-primary/50 hover:bg-muted/50';
                  }
                } else {
                  if (isCorrectAnswer) {
                    buttonClass += ' border-emerald-500 bg-emerald-50 text-emerald-800 font-medium';
                  } else if (isSelected && !isCorrectAnswer) {
                    buttonClass += ' border-red-400 bg-red-50 text-red-700';
                  } else {
                    buttonClass += ' border-border text-muted-foreground';
                  }
                }

                return (
                  <button
                    key={answer.id}
                    className={buttonClass}
                    onClick={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                    disabled={revealed}
                  >
                    <span className="font-semibold mr-2">
                      {String.fromCharCode(65 + answer.answerOrder)}.
                    </span>
                    {answer.answerText}
                    {revealed && isCorrectAnswer && (
                      <CheckCircle2 className="inline-block h-4 w-4 ml-2 text-emerald-600" />
                    )}
                    {revealed && isSelected && !isCorrectAnswer && (
                      <XCircle className="inline-block h-4 w-4 ml-2 text-red-600" />
                    )}
                  </button>
                );
              })}
          </div>
        ) : (
          <textarea
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
            placeholder="Type your answer here..."
            value={textResponses.get(currentQuestion.id) ?? ''}
            onChange={(e) => handleTextResponse(currentQuestion.id, e.target.value)}
            disabled={revealed}
          />
        )}

        {revealed && currentQuestion.explanation && (
          <div className="bg-muted border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground leading-relaxed">
            {currentQuestion.explanation}
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {!revealed ? (
              <Button
                onClick={handleCheckAnswer}
                disabled={
                  currentQuestion.questionType === 'multiple_choice'
                    ? !selectedAnswers.has(currentQuestion.id)
                    : !textResponses.has(currentQuestion.id)
                }
              >
                Check Answer
              </Button>
            ) : currentIndex + 1 < questions.length ? (
              <Button onClick={handleNext} className="gap-2">
                Next Question
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full ${
                  idx < currentIndex
                    ? 'bg-primary'
                    : idx === currentIndex
                      ? 'bg-primary/60'
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
