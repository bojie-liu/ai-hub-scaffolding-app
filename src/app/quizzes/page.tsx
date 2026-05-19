import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import QuizzesClient from './QuizzesClient';

export const dynamic = 'force-dynamic';

type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export default async function QuizzesPage() {
  const result = await getAllQuizzes();
  const quizzes = result.success && result.data ? result.data : [];

  const quizzesWithQuestions = await Promise.all(
    quizzes.map(async (quiz) => {
      const quizResult = await getQuiz(quiz.id);
      if (quizResult.success && quizResult.data) {
        return {
          ...quiz,
          questions: quizResult.data.questions.map((q) => ({
            ...q,
            questionType: q.questionType as QuestionType,
          })),
        };
      }
      return { ...quiz, questions: [] };
    })
  );

  return <QuizzesClient quizzes={quizzesWithQuestions} />;
}
