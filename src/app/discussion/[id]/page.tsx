'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Discussion from '@/components/lesson/interactive/Discussion';
import { getDiscussion } from '@/lib/actions/discussion';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PostData {
  id: number;
  parentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { user } = useUser();
  const [discussion, setDiscussion] = useState<{
    id: number;
    title: string;
    description: string | null;
  } | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDiscussion(id).then((result) => {
      if (result.success && result.data) {
        const { discussion: d, posts: p } = result.data;
        setDiscussion({
          id: d.id,
          title: d.title,
          description: d.description,
        });
        setPosts(
          p.map((post) => ({
            id: post.id,
            parentId: post.parentPostId,
            authorId: post.authorId,
            authorName: post.authorDisplayName ?? post.authorUsername ?? 'Unknown',
            content: post.content,
            createdAt: String(post.createdAt ?? new Date()),
          }))
        );
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/2" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
        </main>
      </AuthGuard>
    );
  }

  if (!discussion) {
    return (
      <AuthGuard>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Discussion not found.</p>
          <Link href="/discussion">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Discussions
            </Button>
          </Link>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/discussion">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> All Discussions
          </Button>
        </Link>
        <Discussion
          discussionId={discussion.id}
          title={discussion.title}
          description={discussion.description}
          posts={posts}
          userId={user?.userId ?? 0}
          userRole={user?.role ?? 'GUEST'}
        />
      </main>
    </AuthGuard>
  );
}
