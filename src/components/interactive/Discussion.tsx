'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createPost } from '@/lib/actions/discussion';
import { MessageSquare, Reply, Send } from 'lucide-react';
import { toast } from 'sonner';

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

interface DiscussionProps {
  discussionId: number;
  title: string;
  description: string | null;
  posts: Post[];
  userId: number;
}

export default function Discussion({
  discussionId,
  title,
  description,
  posts: initialPosts,
  userId,
}: DiscussionProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topLevelPosts = posts.filter((p) => p.parentPostId === null);
  const getReplies = useCallback(
    (parentId: number) => posts.filter((p) => p.parentPostId === parentId),
    [posts]
  );

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createPost(discussionId, userId, newPostContent.trim());

      if (result.success && result.data) {
        const newPost: Post = {
          ...result.data,
          authorUsername: null,
          authorDisplayName: null,
          authorRole: null,
        };
        // Fill in the current user info since the server action only returns the row
        setPosts((prev) => [...prev, newPost]);
        setNewPostContent('');
        toast.success('Post created successfully');
      } else {
        toast.error(result.error ?? 'Failed to create post');
      }
    } catch {
      toast.error('An error occurred while creating your post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentPostId: number) => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createPost(discussionId, userId, replyContent.trim(), parentPostId);

      if (result.success && result.data) {
        const newPost: Post = {
          ...result.data,
          authorUsername: null,
          authorDisplayName: null,
          authorRole: null,
        };
        setPosts((prev) => [...prev, newPost]);
        setReplyContent('');
        setReplyingTo(null);
        toast.success('Reply posted successfully');
      } else {
        toast.error(result.error ?? 'Failed to create reply');
      }
    } catch {
      toast.error('An error occurred while posting your reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string | null, username: string | null) => {
    if (name) return name.slice(0, 2).toUpperCase();
    if (username) return username.slice(0, 2).toUpperCase();
    return '??';
  };

  const renderPost = (post: Post, depth = 0) => {
    const replies = getReplies(post.id);
    const isOwnPost = post.authorId === userId;
    const isInstructor = post.authorRole === 'TEACHER' || post.authorRole === 'INSTRUCTOR';

    return (
      <div key={post.id} className={depth > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}>
        <div className="flex gap-3 py-4">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className={isInstructor ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
              {getInitials(post.authorDisplayName, post.authorUsername)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {post.authorDisplayName ?? post.authorUsername ?? 'Unknown User'}
              </span>
              {isInstructor && (
                <Badge variant="secondary" className="text-xs">
                  Instructor
                </Badge>
              )}
              {isOwnPost && (
                <Badge variant="outline" className="text-xs">
                  You
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDate(post.createdAt)}
              </span>
            </div>

            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground"
                onClick={() => {
                  setReplyingTo(replyingTo === post.id ? null : post.id);
                  setReplyContent('');
                }}
              >
                <Reply className="h-3 w-3" />
                Reply
              </Button>
            </div>

            {replyingTo === post.id && (
              <div className="mt-2 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReply(post.id)}
                    disabled={isSubmitting || !replyContent.trim()}
                    className="gap-1"
                  >
                    <Send className="h-3 w-3" />
                    Post Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {replies.length > 0 && (
          <div className="space-y-0">
            {replies.map((reply) => renderPost(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Discussion Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {title}
              </CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            <Badge variant="secondary" className="shrink-0">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* New Post Form */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Textarea
            placeholder="Share your thoughts or start a discussion..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="min-h-[100px] text-sm"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleCreatePost}
              disabled={isSubmitting || !newPostContent.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Post Comment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          {topLevelPosts.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No posts yet. Be the first to start the discussion!
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y divide-border">
                {topLevelPosts.map((post) => renderPost(post))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
