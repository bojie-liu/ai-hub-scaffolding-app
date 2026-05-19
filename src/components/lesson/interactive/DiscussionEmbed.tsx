'use client';

import { useEffect, useState } from 'react';
import { getDiscussion, createPost } from '@/lib/actions/discussion';
import Discussion from './Discussion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

interface DiscussionEmbedProps {
  discussionId: number;
  userId: number;
  userRole: string;
}

export default function DiscussionEmbed({ discussionId, userId, userRole }: DiscussionEmbedProps) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDiscussion>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiscussion(discussionId).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [discussionId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.success || !data.data) {
    return (
      <Card>
        <CardContent className="pt-4 text-center">
          <p className="text-sm text-muted-foreground">Unable to load discussion.</p>
        </CardContent>
      </Card>
    );
  }

  const { discussion, creator, posts } = data.data;

  const formattedPosts = posts.map((p) => ({
    id: p.id,
    parentId: p.parentPostId,
    authorId: p.authorId,
    authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
    content: p.content,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
  }));

  if (userId <= 0) {
    return (
      <Card>
        <CardContent className="pt-4 text-center">
          <p className="text-sm text-muted-foreground">Please log in to participate in discussions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Discussion
      discussionId={discussion.id}
      title={discussion.title}
      description={discussion.description}
      posts={formattedPosts}
      userId={userId}
      userRole={userRole}
    />
  );
}
