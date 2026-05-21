import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import QuizPageClient from '@/components/interactive/QuizPageClient';
import Navbar from '@/components/common/Navbar';

export default async function QuizzesPage() {
  const quizzesResult = await getAllQuizzes();

  if (!quizzesResult.success || !quizzesResult.data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">
                無法載入測驗
              </h2>
              <p className="text-muted-foreground">
                請稍後再試，或聯絡系統管理員。
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (quizzesResult.data.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">
                目前沒有可用的測驗
              </h2>
              <p className="text-muted-foreground">
                課程測驗將在稍後發布。
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Fetch full quiz data (with questions and answers) for each quiz
  const quizzesWithQuestions = await Promise.all(
    quizzesResult.data.map(async (quiz) => {
      const detail = await getQuiz(quiz.id);
      if (detail.success && detail.data) {
        return {
          id: quiz.id,
          title: quiz.title,
          questions: detail.data.questions,
        };
      }
      return {
        id: quiz.id,
        title: quiz.title,
        questions: [],
      };
    })
  );

  // Display the first available quiz by default
  const quiz = quizzesWithQuestions[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <QuizPageClient
          quizId={quiz.id}
          title={quiz.title}
          questions={quiz.questions}
        />
      </main>
    </div>
  );
}
