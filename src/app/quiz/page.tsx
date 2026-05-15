import { getQuizByStorageKey } from '@/lib/actions/quiz';
import QuizPageClient from './QuizPageClient';

export default async function QuizPage() {
  const result = await getQuizByStorageKey('pre_test_quiz');

  if (!result.success || !result.data) {
    return <QuizPageClient quiz={null} />;
  }

  const { quiz, questions } = result.data;

  const mappedQuestions = questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    questionType: q.questionType as 'multiple_choice' | 'true_false' | 'short_answer',
    explanation: q.explanation,
    answers: q.answers.map((a) => ({
      id: a.id,
      answerText: a.answerText,
      isCorrect: a.isCorrect,
    })),
  }));

  return (
    <QuizPageClient
      quiz={{
        quizId: quiz.id,
        title: quiz.title,
        questions: mappedQuestions,
      }}
    />
  );
}
