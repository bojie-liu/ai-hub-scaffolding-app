import { getQuiz } from '@/lib/actions/quiz';
import { getDiscussions } from '@/lib/actions/discussion';
import { getConceptChecks } from '@/lib/actions/concept-check';
import Navbar from '@/components/common/Navbar';
import { ScrollRootProvider } from '@/contexts/ScrollRootContext';
import LessonPageClient from './LessonPageClient';

export default async function LessonPage() {
  // Fetch quiz data (quizId=1 from seed)
  const quizResult = await getQuiz(1);
  const quizData = quizResult.success && quizResult.data ? quizResult.data : null;

  // Fetch discussions
  const discussionsResult = await getDiscussions();
  const discussionsData = discussionsResult.success && discussionsResult.data ? discussionsResult.data : [];

  // Fetch concept checks
  const conceptChecksResult = await getConceptChecks();
  const conceptChecksData = conceptChecksResult.success && conceptChecksResult.data ? conceptChecksResult.data : [];

  return (
    <ScrollRootProvider>
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              知識管理與學校發展
            </h1>
            <p className="text-slate-500 mt-2">大學一年級 | 教學課程計劃</p>
          </div>
          <LessonPageClient
            quizData={quizData}
            discussionsData={discussionsData}
            conceptChecksData={conceptChecksData}
          />
        </div>
      </div>
    </ScrollRootProvider>
  );
}
