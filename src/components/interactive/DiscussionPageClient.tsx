'use client';

import { useUser } from '@/contexts/UserContext';
import { Discussion } from '@/components/lesson/interactive/Discussion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface DiscussionPageClientProps {
  discussionId: number;
  title: string;
  description: string | null;
  posts: {
    id: number;
    parentId: number | null;
    authorId: number;
    authorName: string;
    content: string;
    createdAt: string;
  }[];
}

export default function DiscussionPageClient({
  discussionId,
  title,
  description,
}: DiscussionPageClientProps) {
  const { user, isGuest } = useUser();

  if (!user || isGuest) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-amber-500 mb-2" />
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please sign in to participate in discussions. Guest accounts cannot post.
            </p>
            <Link href="/login" className="inline-flex items-center justify-center h-8 rounded-md border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted transition-colors">
              Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Discussion
      discussionId={discussionId}
      title={title}
      description={description ?? undefined}
    />
  );
}
