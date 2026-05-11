'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { submitConceptCheckResponse } from '@/lib/actions/concept-check';
import { getConceptChecks } from '@/lib/actions/concept-check';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface ConceptCheckProps {
  checkId: number;
  storageKey: string;
  title: string;
  prompt: string;
  checkType?: 'thumbs' | 'scale' | 'text';
  sectionKey?: string;
}

export function ConceptCheck({ checkId, storageKey, title, prompt, checkType = 'thumbs', sectionKey }: ConceptCheckProps) {
  const { user } = useUser();
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolvedCheckId, setResolvedCheckId] = useState<number | null>(checkId || null);

  useState(() => {
    if (checkId > 0) return;
    getConceptChecks().then((result) => {
      if (result.success && result.data) {
        const found = result.data.find((c: { storageKey: string; id: number }) => c.storageKey === storageKey);
        if (found) setResolvedCheckId(found.id);
      }
    });
  });

  async function submit(value: string) {
    if (!user || user.role === 'GUEST' || !resolvedCheckId) {
      toast.error('Please log in to submit a response');
      return;
    }
    setLoading(true);
    const result = await submitConceptCheckResponse(resolvedCheckId, user.userId, value);
    if (result.success) {
      setResponse(value);
      toast.success('Response recorded');
    } else {
      toast.error('Failed to submit response');
    }
    setLoading(false);
  }

  if (response !== null) {
    return (
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="pt-4">
          <p className="font-medium text-emerald-800 text-sm">{title}</p>
          <p className="text-emerald-700 text-sm mt-1">
            Your response: <span className="font-medium capitalize">{response.replace(/_/g, ' ')}</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  const isGuest = !user || user.role === 'GUEST';

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <p className="font-medium text-sm text-slate-800">{title}</p>
        <p className="text-sm text-slate-600">{prompt}</p>

        {checkType === 'thumbs' && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
              onClick={() => submit('thumbs_up')}
              disabled={loading || isGuest}
            >
              <ThumbsUp className="h-4 w-4" /> Yes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700"
              onClick={() => submit('neutral')}
              disabled={loading || isGuest}
            >
              <Minus className="h-4 w-4" /> Unsure
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
              onClick={() => submit('thumbs_down')}
              disabled={loading || isGuest}
            >
              <ThumbsDown className="h-4 w-4" /> No
            </Button>
          </div>
        )}

        {checkType === 'scale' && (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Button
                key={n}
                variant="outline"
                size="sm"
                className="flex-1 text-sm font-bold"
                onClick={() => submit(String(n))}
                disabled={loading || isGuest}
              >
                {n}
              </Button>
            ))}
          </div>
        )}

        {isGuest && (
          <p className="text-xs text-slate-400">Sign in to submit a response</p>
        )}
      </CardContent>
    </Card>
  );
}
