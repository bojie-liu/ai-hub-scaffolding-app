import Navbar from '@/components/common/Navbar';
import LessonContent from '@/components/lesson/LessonContent';
import { getAllQuizzes, getQuiz } from '@/lib/actions/quiz';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { getDiscussions, getDiscussion } from '@/lib/actions/discussion';

export default async function LessonPage() {
  const [quizzesResult, ccResult, discResult] = await Promise.all([
    getAllQuizzes(),
    getConceptChecks(),
    getDiscussions(),
  ]);

  const quizList = quizzesResult.success && quizzesResult.data ? quizzesResult.data : [];
  const conceptChecks = ccResult.success && ccResult.data ? ccResult.data : [];
  const discList = discResult.success && discResult.data ? discResult.data : [];

  const [quizData, discussionData] = await Promise.all([
    Promise.all(
      quizList.map(async (quiz) => {
        const result = await getQuiz(quiz.id);
        return result.success && result.data ? result.data : undefined;
      })
    ).then((arr) => arr.filter((v): v is NonNullable<typeof v> => v !== undefined)),
    Promise.all(
      discList.map(async (disc) => {
        const result = await getDiscussion(disc.id);
        return result.success && result.data ? result.data : undefined;
      })
    ).then((arr) => arr.filter((v): v is NonNullable<typeof v> => v !== undefined)),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <LessonContent
          quizData={quizData}
          conceptChecks={conceptChecks}
          discussionData={discussionData}
        />
      </main>
    </div>
  );
}
