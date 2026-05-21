import { getDiscussion } from '@/lib/actions/discussion';
import Navbar from '@/components/common/Navbar';
import DiscussionDetailClient from './DiscussionDetailClient';

export default async function DiscussionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const discussionId = parseInt(id, 10);

  if (isNaN(discussionId)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">
                無效的討論編號
              </h2>
              <p className="text-muted-foreground">
                請確認網址是否正確。
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const result = await getDiscussion(discussionId);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">
                無法載入討論
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

  const { discussion, posts } = result.data;

  const mappedPosts = posts.map((post) => ({
    id: post.id,
    parentId: post.parentPostId,
    authorId: post.authorId,
    authorName: post.authorDisplayName ?? post.authorUsername ?? '未知使用者',
    content: post.content,
    createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <DiscussionDetailClient
          discussionId={discussion.id}
          title={discussion.title}
          description={discussion.description}
          posts={mappedPosts}
        />
      </main>
    </div>
  );
}
