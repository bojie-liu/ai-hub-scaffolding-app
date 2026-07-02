'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getDiscussions } from '@/lib/actions/discussion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Pin, ArrowRight } from 'lucide-react';

interface DiscussionItem {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  createdBy: number | null;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  creatorName: string | null;
  creatorUsername: string | null;
  postCount: number;
}

export default function DiscussionListPage() {
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDiscussions().then((result) => {
      if (result.success && result.data) {
        setDiscussions(result.data as DiscussionItem[]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Discussions</h1>
            <p className="text-muted-foreground text-sm mt-1">Share your thoughts on ethical dilemmas and professional conduct</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {discussions.length} {discussions.length === 1 ? 'topic' : 'topics'}
          </Badge>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No discussions yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {discussions.map((d) => (
              <Link key={d.id} href={`/discussion/${d.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {d.isPinned && <Pin className="h-4 w-4 text-indigo-500" />}
                        <CardTitle className="text-lg">{d.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {d.postCount} {d.postCount === 1 ? 'post' : 'posts'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {d.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{d.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        By {d.creatorName ?? d.creatorUsername ?? 'Unknown'} &middot; {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
