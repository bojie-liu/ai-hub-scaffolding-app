'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Pin,
  Plus,
  ArrowLeft,
  Reply,
  Send,
  MessagesSquare,
} from 'lucide-react';
import { getDiscussions, getDiscussion, createDiscussion, createPost } from '@/lib/actions/discussion';
import Link from 'next/link';

interface DiscussionListItem {
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

interface Post {
  id: number;
  discussionId: number;
  parentPostId: number | null;
  authorId: number;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  authorUsername: string | null;
  authorDisplayName: string | null;
  authorRole: string | null;
  replies?: Post[];
}

interface DiscussionDetail {
  discussion: {
    id: number;
    storageKey: string;
    title: string;
    description: string | null;
    isPinned: boolean;
    createdAt: Date | null;
  };
  creator: { id: number; username: string; displayName: string | null; role: string } | null;
  posts: Post[];
}

function buildPostTree(posts: Post[]): Post[] {
  const map = new Map<number, Post>();
  const roots: Post[] = [];
  for (const post of posts) {
    map.set(post.id, { ...post, replies: [] });
  }
  for (const post of map.values()) {
    if (post.parentPostId && map.has(post.parentPostId)) {
      map.get(post.parentPostId)!.replies!.push(post);
    } else {
      roots.push(post);
    }
  }
  return roots;
}

function PostItem({ post, onReply, depth = 0 }: { post: Post; onReply: (postId: number, authorName: string) => void; depth?: number }) {
  const displayName = post.authorDisplayName || post.authorUsername || 'Unknown';
  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-slate-100 pl-4' : ''}`}>
      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-slate-800">{displayName}</span>
          {post.authorRole && (
            <Badge variant={post.authorRole === 'TEACHER' ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
              {post.authorRole}
            </Badge>
          )}
          <span className="text-xs text-slate-400">
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
          </span>
        </div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 text-xs h-6 text-slate-500"
          onClick={() => onReply(post.id, displayName)}
        >
          <Reply className="h-3 w-3 mr-1" /> Reply
        </Button>
      </div>
      {post.replies?.map((reply) => (
        <PostItem key={reply.id} post={reply} onReply={onReply} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function DiscussionPage() {
  const { user } = useUser();
  const [discussions, setDiscussions] = useState<DiscussionListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<DiscussionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [replyTo, setReplyTo] = useState<{ postId: number; authorName: string } | null>(null);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    const result = await getDiscussions();
    if (result.success && result.data) {
      setDiscussions(result.data as DiscussionListItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDiscussions(); }, [fetchDiscussions]);

  const openDiscussion = useCallback(async (id: number) => {
    setSelectedId(id);
    const result = await getDiscussion(id);
    if (result.success && result.data) {
      setDetail(result.data as DiscussionDetail);
    }
  }, []);

  const handleCreatePost = useCallback(async () => {
    if (!user || user.role === 'GUEST' || !selectedId || !newPost.trim()) return;
    setSubmitting(true);
    await createPost(selectedId, user.userId, newPost.trim(), replyTo?.postId);
    setNewPost('');
    setReplyTo(null);
    await openDiscussion(selectedId);
    setSubmitting(false);
  }, [user, selectedId, newPost, replyTo, openDiscussion]);

  const handleCreateDiscussion = useCallback(async () => {
    if (!user || user.role === 'GUEST' || !newTitle.trim()) return;
    setSubmitting(true);
    await createDiscussion(newTitle.trim(), newDesc.trim(), user.userId);
    setNewTitle('');
    setNewDesc('');
    setShowNewDiscussion(false);
    await fetchDiscussions();
    setSubmitting(false);
  }, [user, newTitle, newDesc, fetchDiscussions]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-slate-400">Loading discussions...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {selectedId && detail ? (
            /* Discussion Detail View */
            <div>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedId(null); setDetail(null); }} className="mb-4 gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Discussions
              </Button>
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-2">
                    {detail.discussion.isPinned && <Pin className="h-4 w-4 text-amber-500 shrink-0 mt-1" />}
                    <div>
                      <CardTitle className="text-lg">{detail.discussion.title}</CardTitle>
                      {detail.discussion.description && (
                        <CardDescription className="mt-1">{detail.discussion.description}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Posts */}
                  {buildPostTree(detail.posts).map((post) => (
                    <PostItem
                      key={post.id}
                      post={post}
                      onReply={(postId, authorName) => setReplyTo({ postId, authorName })}
                    />
                  ))}

                  {/* Reply input */}
                  {user && user.role !== 'GUEST' && (
                    <div className="border-t pt-4 mt-4">
                      {replyTo && (
                        <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
                          <Reply className="h-3 w-3" /> Replying to <span className="font-medium">{replyTo.authorName}</span>
                          <Button variant="ghost" size="sm" className="h-5 text-xs" onClick={() => setReplyTo(null)}>Cancel</Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Textarea
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          placeholder={replyTo ? `Reply to ${replyTo.authorName}...` : 'Write a post...'}
                          className="min-h-[80px]"
                        />
                      </div>
                      <Button
                        size="sm"
                        className="mt-2 gap-1"
                        onClick={handleCreatePost}
                        disabled={!newPost.trim() || submitting}
                      >
                        <Send className="h-3.5 w-3.5" /> {submitting ? 'Posting...' : 'Post'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Discussion List View */
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Discussion Forum</h1>
                  <p className="text-sm text-slate-500 mt-1">Discuss guiding questions and share reflections</p>
                </div>
                {user && user.role !== 'GUEST' && (
                  <Button size="sm" onClick={() => setShowNewDiscussion(true)} className="gap-1">
                    <Plus className="h-4 w-4" /> New Discussion
                  </Button>
                )}
              </div>

              {showNewDiscussion && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Create New Discussion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Discussion title"
                    />
                    <Textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Description (optional)"
                      className="min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCreateDiscussion} disabled={!newTitle.trim() || submitting}>
                        {submitting ? 'Creating...' : 'Create'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowNewDiscussion(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {discussions.map((disc) => (
                  <Card
                    key={disc.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openDiscussion(disc.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {disc.isPinned && <Pin className="h-3 w-3 text-amber-500" />}
                            <h3 className="font-medium text-slate-800 text-sm truncate">{disc.title}</h3>
                          </div>
                          {disc.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{disc.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span>by {disc.creatorName || disc.creatorUsername || 'Unknown'}</span>
                            <span>{disc.postCount} {disc.postCount === 1 ? 'post' : 'posts'}</span>
                            {disc.createdAt && <span>{new Date(disc.createdAt).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {discussions.length === 0 && (
                  <div className="text-center py-12">
                    <MessagesSquare className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-slate-500">No discussions yet. Start one!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
