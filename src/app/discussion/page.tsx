'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getDiscussions } from '@/lib/actions/discussion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Pin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DiscussionSummary {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  createdBy: number | null;
  isPinned: boolean;
  createdAt: Date | null;
  creatorName: string | null;
  creatorUsername: string | null;
  postCount: number;
}

export default function DiscussionPage() {
  const [discussions, setDiscussions] = useState<DiscussionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDiscussions();
      if (result.success && result.data) {
        setDiscussions(result.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Discussions</h1>
            <p className="text-muted-foreground mt-1">Engage with guiding questions and peer discussions</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : discussions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No discussions yet. Check back later!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {discussions.map((d) => (
                <Link key={d.id} href={`/discussion/${d.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {d.isPinned && <Pin className="h-4 w-4 text-blue-600" />}
                          <CardTitle className="text-base">{d.title}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {d.postCount} {d.postCount === 1 ? 'post' : 'posts'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {d.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{d.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>by {d.creatorName ?? d.creatorUsername ?? 'Unknown'}</span>
                        {d.createdAt && (
                          <>
                            <span>&middot;</span>
                            <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
