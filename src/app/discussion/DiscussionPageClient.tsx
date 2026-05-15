'use client';

import { useState, useCallback } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Navbar from '@/components/common/Navbar';
import { useUser } from '@/contexts/UserContext';
import Discussion from '@/components/lesson/interactive/Discussion';
import { getDiscussion } from '@/lib/actions/discussion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

interface DiscussionSummary {
  id: number;
  storageKey: string;
  title: string;
  description: string | null;
  postCount: number;
  createdBy: number;
}

interface RawPost {
  id: number;
  parentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

interface DiscussionData {
  discussionId: number;
  title: string;
  description: string | null;
  posts: RawPost[];
}

interface DiscussionPageClientProps {
  discussions: DiscussionSummary[];
}

export default function DiscussionPageClient({ discussions }: DiscussionPageClientProps) {
  const { user } = useUser();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [discussionData, setDiscussionData] = useState<DiscussionData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDiscussion = useCallback(async (id: number) => {
    setLoading(true);
    const result = await getDiscussion(id);
    if (result.success && result.data) {
      const { discussion, posts } = result.data;
      const mappedPosts: RawPost[] = posts.map((p) => ({
        id: p.id,
        parentId: p.parentPostId,
        authorId: p.authorId,
        authorName: p.authorDisplayName ?? p.authorUsername ?? 'Unknown',
        content: p.content,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      }));
      setDiscussionData({
        discussionId: discussion.id,
        title: discussion.title,
        description: discussion.description,
        posts: mappedPosts,
      });
    }
    setLoading(false);
  }, []);

  // Fetch discussion when selectedId changes
  // Using event handler pattern instead of effect to avoid set-state-in-effect warning
  function handleSelectDiscussion(id: number) {
    setSelectedId(id);
    fetchDiscussion(id);
  }

  if (discussions.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AuthGuard>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-2">
                <p className="text-lg text-muted-foreground">
                  No discussions available yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please check back later.
                </p>
              </div>
            </div>
          </AuthGuard>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <AuthGuard>
          <div className="max-w-4xl mx-auto space-y-6">
            {selectedId === null ? (
              <>
                <h1 className="text-2xl font-bold text-slate-900">Discussions</h1>
                <div className="space-y-3">
                  {discussions.map((d) => (
                    <Card
                      key={d.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSelectDiscussion(d.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{d.title}</CardTitle>
                          <Badge variant="outline" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {d.postCount}
                          </Badge>
                        </div>
                      </CardHeader>
                      {d.description && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {d.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedId(null);
                    setDiscussionData(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 mb-2"
                >
                  &larr; Back to discussions
                </button>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : discussionData ? (
                  <Discussion
                    discussionId={discussionData.discussionId}
                    title={discussionData.title}
                    description={discussionData.description}
                    posts={discussionData.posts}
                    userId={user?.userId ?? -1}
                  />
                ) : null}
              </>
            )}
          </div>
        </AuthGuard>
      </main>
    </>
  );
}
