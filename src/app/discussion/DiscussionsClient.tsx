'use client';

import { useState } from 'react';
import Navbar from '@/components/common/Navbar';
import { useUser } from '@/contexts/UserContext';
import { createDiscussion } from '@/lib/actions/discussion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Pin, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

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

export default function DiscussionsClient({ discussions: initialDiscussions }: { discussions: DiscussionSummary[] }) {
  const { user } = useUser();
  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    if (!user || !newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await createDiscussion(newTitle.trim(), newDesc.trim(), user.userId);
      if (result.success && result.data) {
        setDiscussions((prev) => [
          {
            ...result.data,
            creatorName: user.username,
            creatorUsername: user.username,
            postCount: 0,
          },
          ...prev,
        ]);
        setNewTitle('');
        setNewDesc('');
        setShowNew(false);
        toast.success('Discussion created');
      }
    } catch {
      toast.error('Failed to create discussion');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Discussions</h1>
          {user && user.role !== 'GUEST' && (
            <Button onClick={() => setShowNew(!showNew)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Discussion
            </Button>
          )}
        </div>

        {showNew && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Start a New Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Discussion title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={isSubmitting || !newTitle.trim()}>
                  {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
                <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {discussions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No discussions yet. Start one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {discussions.map((d) => (
              <Link key={d.id} href={`/discussion/${d.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                          <span>By {d.creatorName ?? d.creatorUsername ?? 'Unknown'}</span>
                          {d.createdAt && <span>{new Date(d.createdAt).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {d.postCount} {d.postCount === 1 ? 'post' : 'posts'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
