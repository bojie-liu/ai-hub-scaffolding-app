'use client';

import { useEffect, useState } from 'react';
import { getDiscussion } from '@/lib/actions/discussion';
import { useUser } from '@/contexts/UserContext';
import Discussion from '@/components/lesson/interactive/Discussion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DiscussionDetailProps {
  discussionId: number;
}

interface PostData {
  id: number;
  parentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function DiscussionDetailClient({ discussionId }: DiscussionDetailProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();

  async function loadDiscussion() {
    try {
      const result = await getDiscussion(discussionId);
      if (result.success && result.data) {
        const { discussion: d, posts: p } = result.data;
        setTitle(d.title);
        setDescription(d.description);
        setPosts(
          p.map((post) => ({
            id: post.id,
            parentId: post.parentPostId,
            authorId: post.authorId,
            authorName: post.authorDisplayName || post.authorUsername || 'Unknown',
            content: post.content,
            createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
          }))
        );
      } else {
        setError(result.error || 'Discussion not found');
      }
    } catch {
      setError('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDiscussion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discussionId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.push('/discussion')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Discussions
        </Button>
      </div>
    );
  }

  if (!user || user.role === 'GUEST') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Please sign in to participate in discussions.</p>
        <Button onClick={() => router.push('/login')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push('/discussion')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Discussions
      </Button>
      <Discussion
        discussionId={discussionId}
        title={title}
        description={description}
        posts={posts}
        userId={user.userId}
        userRole={user.role}
      />
    </div>
  );
}
