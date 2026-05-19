import { getQuiz } from '@/lib/actions/quiz';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { getDiscussion } from '@/lib/actions/discussion';
import LessonClient from './LessonClient';

export const dynamic = 'force-dynamic';

type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

function mapQuizData(data: NonNullable<Awaited<ReturnType<typeof getQuiz>>['data']>) {
  return {
    quiz: data.quiz,
    questions: data.questions.map((q) => ({
      ...q,
      questionType: q.questionType as QuestionType,
      answers: q.answers.map((a) => ({
        ...a,
        isCorrect: a.isCorrect,
      })),
    })),
  };
}

export default async function LessonPage() {
  const [pretestResult, formativeResult, posttestResult, conceptResult, discussionResult] =
    await Promise.all([
      getQuiz(1).catch(() => ({ success: false, data: null })),
      getQuiz(2).catch(() => ({ success: false, data: null })),
      getQuiz(3).catch(() => ({ success: false, data: null })),
      getConceptChecks().catch(() => ({ success: false, data: null })),
      getDiscussion(1).catch(() => ({ success: false, data: null })),
    ]);

  const pretest = pretestResult.success && pretestResult.data ? mapQuizData(pretestResult.data) : null;
  const formative = formativeResult.success && formativeResult.data ? mapQuizData(formativeResult.data) : null;
  const posttest = posttestResult.success && posttestResult.data ? mapQuizData(posttestResult.data) : null;
  const conceptChecks = conceptResult.success && conceptResult.data ? conceptResult.data : [];
  const discussionRaw =
    discussionResult.success && discussionResult.data ? discussionResult.data : null;

  const discussion = discussionRaw
    ? {
        discussion: {
          id: discussionRaw.discussion.id,
          title: discussionRaw.discussion.title,
          description: discussionRaw.discussion.description,
        },
        creator: discussionRaw.creator
          ? {
              id: discussionRaw.creator.id,
              username: discussionRaw.creator.username,
              displayName: discussionRaw.creator.displayName,
            }
          : null,
        posts: discussionRaw.posts.map((p: { id: number; parentPostId: number | null; authorId: number; content: string; createdAt: Date | null; authorDisplayName: string | null; authorUsername: string | null }) => ({
          id: p.id,
          parentId: p.parentPostId ?? null,
          authorId: p.authorId,
          authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
          content: p.content,
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
        })),
      }
    : null;

  return (
    <LessonClient
      pretest={pretest}
      formative={formative}
      posttest={posttest}
      conceptChecks={conceptChecks}
      discussion={discussion}
    />
  );
}
