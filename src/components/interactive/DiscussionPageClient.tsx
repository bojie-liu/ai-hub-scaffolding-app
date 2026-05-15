'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getDiscussions } from '@/lib/actions/discussion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, MessageSquare, Pin } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface DiscussionSummary {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  postCount: number;
  isPinned: boolean;
  creatorName: string | null;
}

export default function DiscussionPageClient() {
  const { user, isGuest } = useUser();
  const [discussions, setDiscussions] = useState<DiscussionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const result = await getDiscussions();
      if (result.success && result.data) {
        setDiscussions(result.data as DiscussionSummary[]);
      }
      setLoading(false);
    }
    load();
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (discussions.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No discussions available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {discussions.map((d) => (
        <Card
          key={d.id}
          className="cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => router.push(`/discussion/${d.id}`)}
        >
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {d.isPinned && <Pin className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                  <h3 className="font-semibold text-slate-900 truncate">{d.title}</h3>
                </div>
                {d.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{d.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {d.creatorName && <span>by {d.creatorName}</span>}
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {d.postCount} {d.postCount === 1 ? 'post' : 'posts'}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0">
                <MessageSquare className="h-3 w-3 mr-1" />
                {d.postCount}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
