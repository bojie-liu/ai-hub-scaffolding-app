'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Pin, ArrowRight } from 'lucide-react';
import { getDiscussions } from '@/lib/actions/discussion';
import Link from 'next/link';

interface DiscussionItem {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  createdBy: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  creatorName: string | null;
  creatorUsername: string;
  postCount: number;
}

export default function DiscussionPage() {
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiscussions() {
      const result = await getDiscussions();
      if (result.success && result.data) {
        setDiscussions(result.data as DiscussionItem[]);
      }
      setLoading(false);
    }
    loadDiscussions();
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}><CardContent className="pt-6"><div className="animate-pulse h-6 bg-muted rounded w-3/4 mb-2" /><div className="animate-pulse h-4 bg-muted rounded w-1/2" /></CardContent></Card>
            ))}
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Discussion Forums</h1>
        <p className="text-muted-foreground mb-6">Engage in threaded discussions and collaborative inquiry.</p>

        <div className="space-y-4">
          {discussions.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No discussions available yet.</p>
              </CardContent>
            </Card>
          )}

          {discussions.map((disc) => (
            <Link key={disc.id} href={`/discussion/${disc.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {disc.isPinned && <Pin className="h-4 w-4 text-blue-600" />}
                    <CardTitle className="text-base">{disc.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {disc.description && (
                    <p className="text-sm text-muted-foreground mb-2">{disc.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Created by {disc.creatorName ?? disc.creatorUsername}</span>
                    <Badge variant="outline" className="text-xs">{disc.postCount} posts</Badge>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
