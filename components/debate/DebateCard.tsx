'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Debate } from '@/lib/types/debate';

interface DebateCardProps {
  debate: Debate;
}

export function DebateCard({ debate }: DebateCardProps) {
  const formattedDate = new Date(debate.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/debates/${debate.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="line-clamp-2">{debate.topic}</CardTitle>
          <CardDescription>AI Stance: {debate.stance}</CardDescription>
        </CardHeader>
        <CardContent>
          {debate.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {debate.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
