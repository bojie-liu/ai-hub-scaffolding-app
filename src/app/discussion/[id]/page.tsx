import { getDiscussion } from '@/lib/actions/discussion';
import DiscussionDetailClient from './DiscussionDetailClient';

export const dynamic = 'force-dynamic';

export default async function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const discussionId = parseInt(id, 10);

  if (isNaN(discussionId)) {
    return <div className="p-8 text-center text-muted-foreground">Invalid discussion ID.</div>;
  }

  const result = await getDiscussion(discussionId);

  if (!result.success || !result.data) {
    return <div className="p-8 text-center text-muted-foreground">Discussion not found.</div>;
  }

  const { discussion, creator, posts } = result.data;

  return (
    <DiscussionDetailClient
      discussionId={discussion.id}
      title={discussion.title}
      description={discussion.description}
      creatorName={creator?.displayName ?? creator?.username ?? 'Unknown'}
      posts={posts.map((p) => ({
        id: p.id,
        parentId: p.parentPostId,
        authorId: p.authorId,
        authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
        content: p.content,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
      }))}
    />
  );
}
