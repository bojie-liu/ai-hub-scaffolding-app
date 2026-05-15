'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import { getDiscussions } from '@/lib/actions/discussion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Pin } from 'lucide-react';

interface DiscussionSummary {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  createdBy: number;
  isPinned: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  creatorName: string | null;
  creatorUsername: string | null;
  postCount: number;
}

export default function DiscussionPage() {
  const [discussions, setDiscussions] = useState<DiscussionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiscussions().then((result) => {
      if (result.success && result.data) {
        setDiscussions(result.data as DiscussionSummary[]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Discussions</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No discussions available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Link key={discussion.id} href={`/discussion/${discussion.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {discussion.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                      <CardTitle className="text-lg">{discussion.title}</CardTitle>
                    </div>
                    {discussion.description && (
                      <CardDescription className="line-clamp-2">{discussion.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {discussion.postCount} {discussion.postCount === 1 ? 'post' : 'posts'}
                      </Badge>
                      <span>
                        By {discussion.creatorName ?? discussion.creatorUsername ?? 'Unknown'}
                      </span>
                      {discussion.createdAt && (
                        <span className="ml-auto text-xs">
                          {new Date(discussion.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
