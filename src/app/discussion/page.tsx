'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getDiscussions } from '@/lib/actions/discussion';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Pin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DiscussionItem {
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
  const { user } = useUser();
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getDiscussions();
      if (result.success && result.data) {
        setDiscussions(result.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Discussions</h1>
            <p className="text-muted-foreground mt-1">Join conversations about curriculum design topics</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-80" />
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
              {discussions.map((d: DiscussionItem) => (
                <Card key={d.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {d.isPinned && <Pin className="h-4 w-4 text-blue-600 shrink-0" />}
                        <CardTitle className="text-base truncate">{d.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {d.postCount} {d.postCount === 1 ? 'post' : 'posts'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {d.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{d.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        By {d.creatorName ?? d.creatorUsername ?? 'Unknown'}
                        {d.createdAt && ` · ${new Date(d.createdAt).toLocaleDateString()}`}
                      </span>
                      <Link href={`/discussion/${d.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          View <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
