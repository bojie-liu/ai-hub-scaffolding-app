'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getDiscussions, createDiscussion } from '@/lib/actions/discussion';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Pin, Plus } from 'lucide-react';
import Link from 'next/link';

interface DiscussionSummary {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  createdBy: number;
  creatorName: string | null;
  creatorUsername: string | null;
  isPinned: boolean;
  postCount: number;
}

export default function DiscussionPage() {
  const { user, isGuest } = useUser();
  const [discussions, setDiscussions] = useState<DiscussionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDiscussions().then((result) => {
      if (cancelled) return;
      if (result.success && result.data) {
        setDiscussions(result.data as DiscussionSummary[]);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  async function handleCreate() {
    if (!user || isGuest || !newTitle.trim()) return;
    setCreating(true);
    await createDiscussion(newTitle.trim(), newDescription.trim(), user.userId);
    setNewTitle('');
    setNewDescription('');
    setShowCreate(false);
    setCreating(false);
    // Refresh discussions list
    const result = await getDiscussions();
    if (result.success && result.data) {
      setDiscussions(result.data as DiscussionSummary[]);
    }
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Discussion Forum</h1>
            <p className="text-muted-foreground">Discuss AI in software development</p>
          </div>
          {!isGuest && user && (
            <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
              <Plus className="h-4 w-4" /> New Discussion
            </Button>
          )}
        </div>

        {showCreate && (
          <Card className="mb-6">
            <CardContent className="pt-6 space-y-3">
              <Input
                placeholder="Discussion title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={creating || !newTitle.trim()}>
                  {creating ? 'Creating...' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-16 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No discussions yet. Start one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {discussions.map((d) => (
              <Link key={d.id} href={`/discussion/${d.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {d.isPinned && <Pin className="h-3 w-3 text-amber-500" />}
                          <h3 className="font-semibold text-slate-800 truncate">{d.title}</h3>
                        </div>
                        {d.description && (
                          <CardDescription className="mt-1 line-clamp-2">{d.description}</CardDescription>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>by {d.creatorName ?? d.creatorUsername ?? 'Unknown'}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> {d.postCount} posts
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary">{d.postCount}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
