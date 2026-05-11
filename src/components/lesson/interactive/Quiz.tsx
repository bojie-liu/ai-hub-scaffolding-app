'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface QuizProps {
  quizId?: number;
  title: string;
  description?: string;
  questionCount?: number;
  storageKey?: string;
}

export function Quiz({ quizId, title, description, questionCount = 5, storageKey }: QuizProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="bg-blue-600 text-white rounded-t-lg pb-3 pt-4 px-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <p className="text-blue-100 text-xs mt-0.5">{description}</p>}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>{questionCount} questions</span>
            <Badge variant="outline" className="text-xs">Multiple Choice</Badge>
          </div>
          <Link href="/quizzes">
            <Button size="sm">Take Quiz</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
