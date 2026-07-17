'use client';

import { useEffect, useState, use } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import Discussion from '@/components/lesson/interactive/Discussion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { getDiscussion } from '@/lib/actions/discussion';

interface DiscussionData {
  discussion: {
    id: number;
    title: string;
    description: string | null;
  };
  creator: {
    username: string;
    displayName: string | null;
  } | null;
  posts: {
    id: number;
    parentPostId: number | null;
    authorId: number;
    authorUsername: string | null;
    authorDisplayName: string | null;
    content: string;
    createdAt: Date | null;
  }[];
}

export default function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const [data, setData] = useState<DiscussionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const discussionId = parseInt(id, 10);
    if (isNaN(discussionId)) return;
    getDiscussion(discussionId).then((result) => {
      if (result.success && result.data) {
        setData(result.data);
      }
      setLoading(false);
    });
  }, [id]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !data ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Discussion not found.</p>
              </CardContent>
            </Card>
          ) : (
            <Discussion
              discussionId={data.discussion.id}
              title={data.discussion.title}
              description={data.discussion.description}
              posts={data.posts.map((p) => ({
                id: p.id,
                parentId: p.parentPostId,
                authorId: p.authorId,
                authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
                content: p.content,
                createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
              }))}
              userId={user?.userId ?? -1}
              userRole={user?.role ?? 'GUEST'}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
