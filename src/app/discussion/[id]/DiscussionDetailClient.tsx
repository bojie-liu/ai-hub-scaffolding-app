'use client';

import Navbar from '@/components/common/Navbar';
import DiscussionPageClient from '@/components/interactive/DiscussionPageClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface DiscussionDetailClientProps {
  discussionId: number;
  title: string;
  description: string | null;
  creatorName: string;
  posts: {
    id: number;
    parentId: number | null;
    authorId: number;
    authorName: string;
    content: string;
    createdAt: string;
  }[];
}

export default function DiscussionDetailClient({
  discussionId,
  title,
  description,
  posts,
}: DiscussionDetailClientProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/discussion">
          <Button variant="ghost" size="sm" className="mb-4 gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Discussions
          </Button>
        </Link>
        <DiscussionPageClient
          discussionId={discussionId}
          title={title}
          description={description}
          posts={posts}
        />
      </div>
    </div>
  );
}
