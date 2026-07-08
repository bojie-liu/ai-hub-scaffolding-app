'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { getDiscussion } from '@/lib/actions/discussion';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import DiscussionComponent from '@/components/lesson/interactive/Discussion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
    title: string;
    description: string | null;
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
  const { user } = useUser();
  const params = useParams();
  const id = Number(params.id);
  const [data, setData] = useState<DiscussionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getDiscussion(id);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error ?? 'Discussion not found');
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const posts = (data?.posts ?? []).map((p: PostData) => ({
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
        <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
          <Link href="/discussion">
            <Button variant="ghost" size="sm" className="gap-1 mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Discussions
            </Button>
          </Link>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          ) : data && user ? (
            <DiscussionComponent
              discussionId={data.discussion.id}
              title={data.discussion.title}
              description={data.discussion.description}
              posts={posts}
              userId={user.userId}
              userRole={user.role}
            />
          ) : null}
        </main>
      </div>
    </AuthGuard>
  );
}
