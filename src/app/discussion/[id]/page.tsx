'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import DiscussionPageClient from '@/components/interactive/DiscussionPageClient';
import { getDiscussion } from '@/lib/actions/discussion';
import { Skeleton } from '@/components/ui/skeleton';

interface DiscussionData {
  discussion: { id: number; title: string; description: string | null };
  posts: {
    id: number;
    parentPostId: number | null;
    authorId: number;
    authorDisplayName: string | null;
    authorUsername: string | null;
    content: string;
    createdAt: Date | null;
  }[];
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [data, setData] = useState<DiscussionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDiscussion(id).then((result) => {
      if (result.success && result.data) setData(result.data as unknown as DiscussionData);
      setLoading(false);
    });
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data ? (
          <DiscussionPageClient
            discussionId={data.discussion.id}
            title={data.discussion.title}
            description={data.discussion.description}
            posts={data.posts.map((p) => ({
              id: p.id,
              parentId: p.parentPostId,
              authorId: p.authorId,
              authorName: p.authorDisplayName || p.authorUsername || 'Unknown',
              content: p.content,
              createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
            }))}
          />
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Discussion not found.
          </p>
        )}
      </main>
    </div>
  );
}
