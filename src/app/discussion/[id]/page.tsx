'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, MessageCircle, Reply, Send, Pin } from 'lucide-react';
import { createPost } from '@/lib/actions/discussion';

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
}

interface DiscussionDetail {
  discussion: { id: number; title: string; description: string | null; isPinned: boolean; storageKey: string; createdBy: number; createdAt: Date | null; updatedAt: Date | null };
  creator: { id: number; username: string; displayName: string | null; role: string } | null;
  posts: Post[];
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isGuest } = useUser();
  const discussionId = parseInt(params.id as string);
  const [data, setData] = useState<DiscussionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchDiscussion() {
      const { getDiscussion } = await import('@/lib/actions/discussion');
      const result = await getDiscussion(discussionId);
      if (result.success && result.data) {
        setData(result.data as DiscussionDetail);
      }
      setLoading(false);
    }
    fetchDiscussion();
  }, [discussionId]);

  async function handlePost(content: string, parentPostId?: number) {
    if (!user || isGuest || !content.trim()) return;
    setSubmitting(true);
    try {
      const result = await createPost(discussionId, user.userId, content, parentPostId);
      if (result.success) {
        setNewPostContent('');
        setReplyContent('');
        setReplyingTo(null);
        const { getDiscussion } = await import('@/lib/actions/discussion');
        const refresh = await getDiscussion(discussionId);
        if (refresh.success && refresh.data) {
          setData(refresh.data as DiscussionDetail);
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  function renderPost(post: Post, depth = 0) {
    const replies = data?.posts.filter(p => p.parentPostId === post.id) || [];
    return (
      <div key={post.id} className={`${depth > 0 ? 'ml-8 border-l-2 border-slate-200 pl-4' : ''}`}>
        <Card className="mb-3">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                  {(post.authorDisplayName || post.authorUsername || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{post.authorDisplayName || post.authorUsername || 'Anonymous'}</span>
                  {post.authorRole && <Badge variant="outline" className="text-xs">{post.authorRole}</Badge>}
                  {post.createdAt && <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</span>}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
                {!isGuest && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}
                {replyingTo === post.id && (
                  <div className="mt-2 flex gap-2">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handlePost(replyContent, post.id)}
                      disabled={submitting || !replyContent.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {replies.map(reply => renderPost(reply, depth + 1))}
      </div>
    );
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

  if (!data) {
    return (
      <AuthGuard>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Discussion not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/discussion')}>
            Back to Discussions
          </Button>
        </div>
      </AuthGuard>
    );
  }

  const topLevelPosts = data.posts.filter(p => p.parentPostId === null);

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.push('/discussion')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Discussions
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              {data.discussion.isPinned && <Pin className="h-4 w-4 text-amber-500" />}
              <CardTitle>{data.discussion.title}</CardTitle>
            </div>
            {data.discussion.description && (
              <p className="text-muted-foreground text-sm mt-1">{data.discussion.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Badge variant="outline">{data.posts.length} posts</Badge>
              {data.creator && <span>Created by {data.creator.displayName || data.creator.username}</span>}
            </div>
          </CardHeader>
        </Card>

        {/* New post form */}
        {!isGuest && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={() => handlePost(newPostContent)}
                  disabled={submitting || !newPostContent.trim()}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator className="my-4" />

        {/* Posts */}
        <div>
          {topLevelPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No posts yet. Be the first to share!</p>
            </div>
          ) : (
            topLevelPosts.map(post => renderPost(post))
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
