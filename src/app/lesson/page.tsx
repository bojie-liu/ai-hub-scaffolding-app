import { getQuiz } from '@/lib/actions/quiz';
import { getDiscussions } from '@/lib/actions/discussion';
import { getConceptChecks } from '@/lib/actions/concept-check';
import LessonClient from './LessonClient';

export const metadata = {
  title: 'Lesson Plan - Knowledge Management & School Development',
};

export default async function LessonPage() {
  const [preTestResult, postTestResult, discussionsResult, conceptChecksResult] = await Promise.all([
    getQuiz(1).catch(() => ({ success: false as const, error: 'Failed to load pre-test' })),
    getQuiz(2).catch(() => ({ success: false as const, error: 'Failed to load post-test' })),
    getDiscussions().catch(() => ({ success: false as const, error: 'Failed to load discussions' })),
    getConceptChecks().catch(() => ({ success: false as const, error: 'Failed to load concept checks' })),
  ]);

  const preTest = preTestResult.success && preTestResult.data ? preTestResult.data : null;
  const postTest = postTestResult.success && postTestResult.data ? postTestResult.data : null;
  const discussions = discussionsResult.success && discussionsResult.data ? discussionsResult.data : [];
  const conceptChecks = conceptChecksResult.success && conceptChecksResult.data ? conceptChecksResult.data : [];

  return (
    <LessonClient
      preTest={preTest}
      postTest={postTest}
      discussions={discussions}
      conceptChecks={conceptChecks}
    />
  );
}
