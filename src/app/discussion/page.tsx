'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MessageSquare, Plus, Pin, MessageCircle, Clock, User } from 'lucide-react';
import { createDiscussion } from '@/lib/actions/discussion';

interface DiscussionItem {
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
  const { user, isGuest } = useUser();
  const router = useRouter();
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchDiscussions() {
      const { getDiscussions } = await import('@/lib/actions/discussion');
      const result = await getDiscussions();
      if (result.success && result.data) {
        setDiscussions(result.data as DiscussionItem[]);
      }
      setLoading(false);
    }
    fetchDiscussions();
  }, []);

  async function handleCreate() {
    if (!user || isGuest || !newTitle.trim()) return;
    setCreating(true);
    try {
      const result = await createDiscussion(newTitle, newDescription, user.userId);
      if (result.success) {
        setShowNewDialog(false);
        setNewTitle('');
        setNewDescription('');
        const { getDiscussions } = await import('@/lib/actions/discussion');
        const refresh = await getDiscussions();
        if (refresh.success && refresh.data) {
          setDiscussions(refresh.data as DiscussionItem[]);
        }
      }
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Discussion Forum
            </h1>
            <p className="text-muted-foreground mt-1">Share ideas and discuss lesson topics</p>
          </div>
          {!isGuest && (
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
              <DialogTrigger
                render={<Button className="gap-2" />}
              >
                <Plus className="h-4 w-4" />
                New Discussion
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a New Discussion</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Discussion title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea
                      id="desc"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="What would you like to discuss?"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCreate} disabled={creating || !newTitle.trim()} className="w-full">
                    {creating ? 'Creating...' : 'Create Discussion'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="space-y-3">
          {discussions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No discussions yet. Start the conversation!</p>
              </CardContent>
            </Card>
          ) : (
            discussions.map((discussion) => (
              <Card
                key={discussion.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/discussion/${discussion.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {discussion.isPinned && <Pin className="h-4 w-4 text-amber-500 shrink-0" />}
                        <h3 className="font-medium text-slate-800 truncate">{discussion.title}</h3>
                      </div>
                      {discussion.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{discussion.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {discussion.creatorName || discussion.creatorUsername || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {discussion.postCount} posts
                        </span>
                        {discussion.createdAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(discussion.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
