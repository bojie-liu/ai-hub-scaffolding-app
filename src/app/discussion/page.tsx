'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Pin, Plus, ArrowLeft } from 'lucide-react';
import { getDiscussions, getDiscussion, createDiscussion, createPost } from '@/lib/actions/discussion';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

interface DiscussionSummary {
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

interface DiscussionPostRaw {
  id: number;
  parentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string | null;
}

interface DiscussionPost {
  id: number;
  parentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string | null;
  replies: DiscussionPost[];
}

function buildPostTree(posts: DiscussionPostRaw[]): DiscussionPost[] {
  const map = new Map<number, DiscussionPost>();
  const roots: DiscussionPost[] = [];
  for (const p of posts) {
    map.set(p.id, { ...p, replies: [] });
  }
  for (const p of posts) {
    const node = map.get(p.id)!;
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function PostItem({ post, userId, discussionId, depth = 0 }: { post: DiscussionPost; userId: number; discussionId: number; depth?: number }) {
  const router = useRouter();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleReply() {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await createPost(discussionId, userId, replyText.trim(), post.id);
    setReplyText('');
    setShowReply(false);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div className={depth > 0 ? 'ml-6 pl-4 border-l-2 border-slate-200' : ''}>
      <div className="flex items-start gap-3 py-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{(post.authorName || 'U')[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-slate-800">{post.authorName}</span>
            <span className="text-xs text-muted-foreground">{post.createdAt ? new Date(post.createdAt).toLocaleDateString('zh-TW') : ''}</span>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
          <Button variant="ghost" size="sm" className="mt-1 text-xs text-slate-500" onClick={() => setShowReply(!showReply)}>
            回覆
          </Button>
        </div>
      </div>
      {showReply && (
        <div className="ml-11 mb-3 flex gap-2">
          <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="撰寫回覆..." className="text-sm" rows={2} />
          <Button size="sm" onClick={handleReply} disabled={submitting || !replyText.trim()}>
            {submitting ? '...' : '發送'}
          </Button>
        </div>
      )}
      {post.replies.map((reply) => (
        <PostItem key={reply.id} post={reply} userId={userId} discussionId={discussionId} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function DiscussionPage() {
  const { user } = useUser();
  const router = useRouter();
  const [discussions, setDiscussions] = useState<DiscussionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [posts, setPosts] = useState<DiscussionPostRaw[]>([]);
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionDesc, setDiscussionDesc] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    const result = await getDiscussions();
    if (result.success && result.data) {
      setDiscussions(result.data as DiscussionSummary[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  async function openDiscussion(id: number) {
    setSelectedId(id);
    const result = await getDiscussion(id);
    if (result.success && result.data) {
      const d = result.data;
      setDiscussionTitle(d.discussion.title);
      setDiscussionDesc(d.discussion.description || '');
      const rawPosts: DiscussionPostRaw[] = d.posts.map((p: { id: number; parentPostId: number | null; authorId: number; authorDisplayName: string | null; authorUsername: string | null; content: string; createdAt: Date | string | null }) => ({
        id: p.id,
        parentId: p.parentPostId,
        authorId: p.authorId,
        authorName: p.authorDisplayName || p.authorUsername || '使用者',
        content: p.content,
        createdAt: p.createdAt ? String(p.createdAt) : null,
      }));
      setPosts(rawPosts);
    }
  }

  async function handleCreateDiscussion() {
    if (!newTitle.trim() || !user || user.userId < 0) return;
    setSubmitting(true);
    const result = await createDiscussion(newTitle.trim(), newDesc.trim(), user.userId);
    if (result.success) {
      setNewTitle('');
      setNewDesc('');
      setShowNewForm(false);
      await fetchDiscussions();
    }
    setSubmitting(false);
  }

  async function handleNewPost() {
    if (!newPostText.trim() || !selectedId || !user || user.userId < 0) return;
    setSubmitting(true);
    await createPost(selectedId, user.userId, newPostText.trim());
    setNewPostText('');
    setSubmitting(false);
    await openDiscussion(selectedId);
  }

  const postTree = buildPostTree(posts);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-6">
          {selectedId ? (
            <div className="space-y-4">
              <Button variant="ghost" onClick={() => setSelectedId(null)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> 返回討論列表
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{discussionTitle}</h1>
                {discussionDesc && <p className="text-muted-foreground mt-1">{discussionDesc}</p>}
              </div>
              <Separator />
              {user && user.userId > 0 && (
                <Card>
                  <CardContent className="pt-4 space-y-2">
                    <Textarea value={newPostText} onChange={(e) => setNewPostText(e.target.value)} placeholder="分享您的想法..." rows={3} />
                    <Button onClick={handleNewPost} disabled={submitting || !newPostText.trim()} size="sm">
                      {submitting ? '發送中...' : '發布'}
                    </Button>
                  </CardContent>
                </Card>
              )}
              <div className="space-y-1">
                {postTree.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">尚未有貼文，開始討論吧！</p>
                )}
                {postTree.map((post) => (
                  <PostItem key={post.id} post={post} userId={user?.userId ?? -1} discussionId={selectedId} />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">討論區</h1>
                {user && user.userId > 0 && (
                  <Button onClick={() => setShowNewForm(!showNewForm)} className="gap-2">
                    <Plus className="h-4 w-4" /> 新增討論
                  </Button>
                )}
              </div>

              {showNewForm && (
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="討論主題" />
                    <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="描述（選填）" rows={2} />
                    <div className="flex gap-2">
                      <Button onClick={handleCreateDiscussion} disabled={submitting || !newTitle.trim()}>
                        建立
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewForm(false)}>取消</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {discussions.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">尚未有討論主題</p>
                  </div>
                )}
                {discussions.map((d) => (
                  <Card key={d.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDiscussion(d.id)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {d.isPinned && <Pin className="h-4 w-4 text-amber-500" />}
                          <CardTitle className="text-base">{d.title}</CardTitle>
                        </div>
                        <Badge variant="secondary">{d.postCount} 則貼文</Badge>
                      </div>
                    </CardHeader>
                    {d.description && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">{d.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
