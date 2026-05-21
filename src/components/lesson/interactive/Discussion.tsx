'use client';

import { useState } from 'react';
import { createPost } from '@/lib/actions/discussion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface DiscussionPost {
  id: number;
  parentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
  replies: DiscussionPost[];
}

interface RawPost {
  id: number;
  parentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

interface DiscussionProps {
  discussionId: number;
  title: string;
  description: string | null;
  posts: RawPost[];
  userId: number;
  userRole: string;
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
            <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
          <Button variant="ghost" size="sm" className="mt-1 text-xs text-slate-500" onClick={() => setShowReply(!showReply)}>
            回覆
          </Button>
        </div>
      </div>

      {showReply && (
        <div className="ml-11 mb-3 flex gap-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="撰寫回覆..."
            className="text-sm"
            rows={2}
          />
          <Button size="sm" onClick={handleReply} disabled={submitting || !replyText.trim()}>
            {submitting ? '...' : '發佈'}
          </Button>
        </div>
      )}

      {post.replies.map((reply) => (
        <PostItem key={reply.id} post={reply} userId={userId} discussionId={discussionId} depth={depth + 1} />
      ))}
    </div>
  );
}

function buildPostTree(posts: RawPost[]): DiscussionPost[] {
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

export default function Discussion({ discussionId, title, description, posts: rawPosts, userId, userRole }: DiscussionProps) {
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const posts = buildPostTree(rawPosts);

  async function handleNewPost() {
    if (!newPost.trim()) return;
    setSubmitting(true);
    await createPost(discussionId, userId, newPost.trim());
    setNewPost('');
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>

      <Separator />

      <Card>
        <CardContent className="pt-4 space-y-2">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="分享您的想法..."
            rows={3}
          />
          <Button onClick={handleNewPost} disabled={submitting || !newPost.trim()} size="sm">
            {submitting ? '發佈中...' : '發佈'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-1">
        {posts.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">尚無回覆。開始討論吧！</p>
        )}
        {posts.map((post) => (
          <PostItem key={post.id} post={post} userId={userId} discussionId={discussionId} />
        ))}
      </div>
    </div>
  );
}
