'use client';

import { useState } from 'react';
import { submitConceptCheckResponse } from '@/lib/actions/concept-check';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

interface ConceptCheckProps {
  checkId: number;
  title: string;
  prompt: string;
  checkType: 'thumbs' | 'scale' | 'text';
  userId: number;
  userRole: string;
  existingResponse?: string | null;
}

export default function ConceptCheck({ checkId, title, prompt, checkType, userId, existingResponse }: ConceptCheckProps) {
  const [response, setResponse] = useState<string | null>(existingResponse ?? null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(value: string) {
    setLoading(true);
    const result = await submitConceptCheckResponse(checkId, userId, value);
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
          <p className="text-emerald-700 text-sm mt-1">Your response: <span className="font-medium">{response}</span></p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <p className="font-medium text-sm text-slate-800">{title}</p>
        <p className="text-sm text-slate-600">{prompt}</p>

        {checkType === 'thumbs' && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 gap-2 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
              onClick={() => submit('up')}
              disabled={loading}
            >
              <ThumbsUp className="h-5 w-5" /> Yes
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
              onClick={() => submit('down')}
              disabled={loading}
            >
              <ThumbsDown className="h-5 w-5" /> No
            </Button>
          </div>
        )}

        {checkType === 'scale' && (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Button
                key={n}
                variant="outline"
                size="lg"
                className="flex-1 text-lg font-bold"
                onClick={() => submit(String(n))}
                disabled={loading}
              >
                {n}
              </Button>
            ))}
          </div>
        )}

        {checkType === 'text' && (
          <div className="space-y-2">
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your response..."
              rows={3}
            />
            <Button size="sm" onClick={() => submit(textInput)} disabled={loading || !textInput.trim()}>
              Submit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
