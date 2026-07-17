'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Pin } from 'lucide-react';
import { getDiscussions } from '@/lib/actions/discussion';

interface DiscussionItem {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  createdBy: number;
  isPinned: boolean;
  createdAt: Date | null;
  creatorName: string | null;
  creatorUsername: string | null;
  postCount: number;
}

export default function DiscussionPage() {
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiscussions().then((result) => {
      if (result.success && result.data) {
        setDiscussions(result.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Discussions</h1>
              <p className="text-muted-foreground mt-1">Share ideas and collaborate with peers</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : discussions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No discussions yet.</p>
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
                          {d.isPinned && <Pin className="h-4 w-4 text-blue-600 shrink-0" />}
                          <CardTitle className="text-base">{d.title}</CardTitle>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {d.postCount} {d.postCount === 1 ? 'post' : 'posts'}
                        </Badge>
                      </div>
                    </CardHeader>
                    {d.description && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">{d.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          By {d.creatorName ?? d.creatorUsername ?? 'Unknown'}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
