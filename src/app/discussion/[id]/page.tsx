'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Discussion from '@/components/lesson/interactive/Discussion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getDiscussion } from '@/lib/actions/discussion';
import { useUser } from '@/contexts/UserContext';

interface DiscussionData {
  discussion: { id: number; title: string; description: string | null };
  creator: { id: number; username: string; displayName: string | null; role: string } | null;
  posts: Array<{
    id: number;
    discussionId: number;
    parentPostId: number | null;
    authorId: number;
    authorUsername: string;
    authorDisplayName: string | null;
    authorRole: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { user, isGuest } = useUser();
  const [data, setData] = useState<DiscussionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiscussion() {
      const result = await getDiscussion(id);
      if (result.success && result.data) {
        setData(result.data as DiscussionData);
      }
      setLoading(false);
    }
    loadDiscussion();
  }, [id]);

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Card key={i}><CardContent className="pt-4"><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
            ))}
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!data) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Discussion not found.</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  const userId = user?.userId ?? -1;
  const userRole = user?.role ?? 'GUEST';
  const rawPosts = data.posts.map(p => ({
    id: p.id,
    parentId: p.parentPostId,
    authorId: p.authorId,
    authorName: p.authorDisplayName ?? p.authorUsername,
    content: p.content,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  }));

  return (
    <AuthGuard>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {!isGuest && userId > 0 ? (
          <Discussion
            discussionId={data.discussion.id}
            title={data.discussion.title}
            description={data.discussion.description}
            posts={rawPosts}
            userId={userId}
            userRole={userRole}
          />
        ) : (
          <Card>
            <CardContent className="pt-4">
              <h2 className="text-xl font-bold mb-2">{data.discussion.title}</h2>
              {data.discussion.description && <p className="text-muted-foreground mb-4">{data.discussion.description}</p>}
              <p className="text-sm text-muted-foreground">Sign in to participate in this discussion.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
