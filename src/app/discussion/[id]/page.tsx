'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import Discussion from '@/components/lesson/interactive/Discussion';
import { getDiscussion } from '@/lib/actions/discussion';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

interface PostData {
  id: number;
  discussionId: number;
  parentPostId: number | null;
  authorId: number;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  authorUsername: string | null;
  authorDisplayName: string | null;
  authorRole: string | null;
}

interface DiscussionData {
  discussion: {
    id: number;
    storageKey: string;
    title: string;
    description: string | null;
    createdBy: number;
    isPinned: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
  creator: {
    id: number;
    username: string;
    displayName: string | null;
    role: string;
  } | null;
  posts: PostData[];
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [data, setData] = useState<DiscussionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Number(params.id);

  useEffect(() => {
    if (isNaN(id)) {
      setError('Invalid discussion ID'); // eslint-disable-line react-hooks/set-state-in-effect
      setLoading(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }

    getDiscussion(id).then((result) => {
      if (result.success && result.data) {
        setData(result.data as DiscussionData);
      } else {
        setError(result.error ?? 'Discussion not found');
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </main>
      </AuthGuard>
    );
  }

  if (error || !data) {
    return (
      <AuthGuard>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <Button variant="outline" onClick={() => router.push('/discussion')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Discussions
          </Button>
          <p className="text-destructive">{error ?? 'Discussion not found'}</p>
        </main>
      </AuthGuard>
    );
  }

  const rawPosts: {
    id: number;
    parentId: number | null;
    authorId: number;
    authorName: string;
    content: string;
    createdAt: string;
  }[] = data.posts.map((p) => ({
    id: p.id,
    parentId: p.parentPostId,
    authorId: p.authorId,
    authorName: p.authorDisplayName ?? p.authorUsername ?? `User ${p.authorId}`,
    content: p.content,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Button variant="outline" onClick={() => router.push('/discussion')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Discussions
        </Button>
        {user && user.userId > 0 ? (
          <Discussion
            discussionId={data.discussion.id}
            title={data.discussion.title}
            description={data.discussion.description}
            posts={rawPosts}
            userId={user.userId}
            userRole={user.role}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please log in to participate in discussions.</p>
            <Button variant="outline" onClick={() => router.push('/login')} className="mt-4">
              Sign In
            </Button>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
