'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import { getDiscussions, createDiscussion } from '@/lib/actions/discussion';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Pin, Plus } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/lib/routes';

interface DiscussionItem {
  id: number;
  title: string;
  description: string | null;
  creatorName: string | null;
  creatorUsername: string | null;
  postCount: number;
  isPinned: boolean;
  createdAt: Date | null;
}

export default function DiscussionPage() {
  const { user } = useUser();
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getDiscussions().then((result) => {
      if (result.success && result.data) setDiscussions(result.data as DiscussionItem[]);
      setLoading(false);
    });
  }, []);

  async function handleCreate() {
    if (!newTitle.trim() || !user) return;
    setCreating(true);
    const result = await createDiscussion(
      newTitle.trim(),
      newDesc.trim(),
      user.userId
    );
    if (result.success) {
      setNewTitle('');
      setNewDesc('');
      setShowCreate(false);
      const refresh = await getDiscussions();
      if (refresh.success && refresh.data) setDiscussions(refresh.data as DiscussionItem[]);
    }
    setCreating(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6" /> Discussions
          </h1>
          {user && user.role === 'TEACHER' && (
            <Button onClick={() => setShowCreate(!showCreate)} size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Discussion
            </Button>
          )}
        </div>

        {showCreate && (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <Input
                placeholder="Discussion title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={creating || !newTitle.trim()}
                  size="sm"
                >
                  Create
                </Button>
                <Button
                  onClick={() => setShowCreate(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading discussions...</p>
        ) : discussions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No discussions yet.
          </p>
        ) : (
          discussions.map((d) => (
            <Link key={d.id} href={routes.discussionDetail(d.id)}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {d.isPinned && (
                      <Pin className="h-4 w-4 text-indigo-600" />
                    )}
                    <CardTitle className="text-base">{d.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>by {d.creatorName || d.creatorUsername || 'Unknown'}</span>
                    <span>
                      {d.postCount} post{d.postCount !== 1 ? 's' : ''}
                    </span>
                    {d.createdAt && (
                      <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {d.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {d.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}
