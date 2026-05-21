'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Discussion from '@/components/lesson/interactive/Discussion';
import { getDiscussion } from '@/lib/actions/discussion';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface DiscussionData {
  discussion: {
    id: number;
    storageKey: string;
    title: string;
    description: string | null;
  };
  creator: {
    id: number;
    username: string;
    displayName: string | null;
    role: string;
  } | null;
  posts: {
    id: number;
    parentPostId: number | null;
    authorId: number;
    authorUsername: string | null;
    authorDisplayName: string | null;
    authorRole: string | null;
    content: string;
    createdAt: Date | null;
  }[];
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const { user } = useUser();
  const [data, setData] = useState<DiscussionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Number(params.id);

  const fetchDiscussion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDiscussion(id);
      if (result.success && result.data) {
        setData(result.data as DiscussionData);
      } else {
        setError(result.error ?? 'Discussion not found');
      }
    } catch {
      setError('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDiscussion();
  }, [fetchDiscussion]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-48 mb-8" />
            <Skeleton className="h-40 w-full" />
          </main>
        </div>
      </AuthGuard>
    );
  }

  if (error || !data) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-8">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-red-600">{error ?? 'Discussion not found'}</p>
                <Link href="/discussion">
                  <Button variant="outline" className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Discussions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </AuthGuard>
    );
  }

  const posts = data.posts.map((p) => ({
    id: p.id,
    parentId: p.parentPostId,
    authorId: p.authorId,
    authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
    content: p.content,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/discussion">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Discussions
            </Button>
          </Link>
          <Discussion
            discussionId={data.discussion.id}
            title={data.discussion.title}
            description={data.discussion.description}
            posts={posts}
            userId={user?.userId ?? -1}
            userRole={user?.role ?? 'GUEST'}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
