'use client';

import { useState, use, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getDiscussion } from '@/lib/actions/discussion';
import Discussion from '@/components/lesson/interactive/Discussion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
  posts: {
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
  }[];
}

export default function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isGuest } = useUser();
  const [data, setData] = useState<DiscussionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const discussionId = parseInt(id, 10);

    let cancelled = false;

    if (isNaN(discussionId)) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setError('Invalid discussion ID');
          setLoading(false);
        }
      });
      return () => { cancelled = true; };
    }

    getDiscussion(discussionId).then((result) => {
      if (cancelled) return;
      if (result.success && result.data) {
        setData(result.data as DiscussionData);
      } else {
        setError(result.error ?? 'Discussion not found');
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AuthGuard>
    );
  }

  if (error || !data) {
    return (
      <AuthGuard>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/discussion">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to discussions
            </Button>
          </Link>
          <p className="text-muted-foreground">{error ?? 'Discussion not found'}</p>
        </div>
      </AuthGuard>
    );
  }

  const mappedPosts = data.posts.map((p) => ({
    id: p.id,
    parentId: p.parentPostId,
    authorId: p.authorId,
    authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
    content: p.content,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/discussion">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to discussions
          </Button>
        </Link>

        {user && !isGuest ? (
          <Discussion
            discussionId={data.discussion.id}
            title={data.discussion.title}
            description={data.discussion.description}
            posts={mappedPosts}
            userId={user.userId}
            userRole={user.role}
          />
        ) : (
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">{data.discussion.title}</h1>
            {data.discussion.description && <p className="text-muted-foreground mb-4">{data.discussion.description}</p>}
            <p className="text-sm text-muted-foreground">Sign in to participate in the discussion.</p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
