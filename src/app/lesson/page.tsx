import { getQuizByStorageKey } from '@/lib/actions/quiz';
import { getDiscussions } from '@/lib/actions/discussion';
import { getConceptChecks } from '@/lib/actions/concept-check';
import LessonPageClient from './LessonPageClient';

export const metadata = {
  title: 'AI-Powered Software Engineering - Lesson Plan',
  description:
    'Full lesson plan: From Manual Coding to Intelligent Workflows. Interactive activities, assessments, and materials.',
};

export default async function LessonPage() {
  // Fetch quiz data (pre-test quiz)
  const quizResult = await getQuizByStorageKey('pre_test_quiz');
  const quizData = quizResult.success && quizResult.data
    ? {
        quizId: quizResult.data.quiz.id,
        title: quizResult.data.quiz.title,
        questions: quizResult.data.questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType as
            | 'multiple_choice'
            | 'true_false'
            | 'short_answer',
          explanation: q.explanation,
          answers: q.answers.map((a) => ({
            id: a.id,
            answerText: a.answerText,
            isCorrect: a.isCorrect,
          })),
        })),
      }
    : null;

  // Fetch discussion data (guiding questions)
  const discussionsResult = await getDiscussions();
  let discussionData: {
    discussionId: number;
    title: string;
    description: string | null;
    posts: {
      id: number;
      parentId: number | null;
      authorId: number;
      authorName: string;
      content: string;
      createdAt: string;
    }[];
  } | null = null;

  if (discussionsResult.success && discussionsResult.data) {
    const guidingDiscussion = discussionsResult.data.find(
      (d) => d.storageKey === 'guiding_questions'
    );
    if (guidingDiscussion) {
      // We need to fetch full discussion with posts. Since getDiscussion is
      // also a server action, import and call it here.
      const { getDiscussion } = await import('@/lib/actions/discussion');
      const fullDiscussion = await getDiscussion(guidingDiscussion.id);
      if (fullDiscussion.success && fullDiscussion.data) {
        discussionData = {
          discussionId: fullDiscussion.data.discussion.id,
          title: fullDiscussion.data.discussion.title,
          description: fullDiscussion.data.discussion.description,
          posts: fullDiscussion.data.posts.map((p) => ({
            id: p.id,
            parentId: p.parentPostId,
            authorId: p.authorId,
            authorName: p.authorDisplayName ?? p.authorUsername ?? 'Anonymous',
            content: p.content,
            createdAt: p.createdAt instanceof Date
              ? p.createdAt.toISOString()
              : String(p.createdAt),
          })),
        };
      }
    }
  }

  // Fetch concept checks
  const conceptChecksResult = await getConceptChecks();
  const conceptChecksData =
    conceptChecksResult.success && conceptChecksResult.data
      ? conceptChecksResult.data
      : [];

  // Find specific concept checks by storageKey
  const findCheck = (storageKey: string) => {
    const check = conceptChecksData.find((c) => c.storageKey === storageKey);
    if (!check) return null;
    return {
      checkId: check.id,
      title: check.title,
      prompt: check.prompt,
      checkType: check.checkType as 'thumbs' | 'scale' | 'text',
    };
  };

  const conceptCheckILOs = findCheck('check_ilos');
  const conceptCheckMod1 = findCheck('check_mod1');
  const conceptCheckMod3 = findCheck('check_mod3');

  return (
    <LessonPageClient
      quizData={quizData}
      discussionData={discussionData}
      conceptCheckILOs={conceptCheckILOs}
      conceptCheckMod1={conceptCheckMod1}
      conceptCheckMod3={conceptCheckMod3}
    />
  );
}
