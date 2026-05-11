'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface DiscussionProps {
  discussionId?: number;
  title: string;
  description?: string;
  storageKey?: string;
}

export function Discussion({ title, description }: DiscussionProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-50 rounded-lg shrink-0">
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-slate-800">{title}</p>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          <Link href="/discussion">
            <Button size="sm" variant="outline" className="gap-1">
              <MessageSquare className="h-3.5 w-3.5" /> Discuss
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
