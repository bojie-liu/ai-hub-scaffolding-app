'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function DebateForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    stance: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/debates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create debate');
      }

      const debate = await response.json();
      router.push(`/debates/${debate.id}`);
    } catch (error) {
      console.error('Error creating debate:', error);
      alert('Failed to create debate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Debate</CardTitle>
        <CardDescription>
          Set up a debate topic and the AI will take a strong stance to help you
          practice your argumentation skills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Debate Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., AI should replace teachers"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stance">AI's Stance *</Label>
            <Input
              id="stance"
              placeholder="e.g., Strongly in favor / Strongly against"
              value={formData.stance}
              onChange={(e) =>
                setFormData({ ...formData, stance: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Context (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context or specific angles you want to explore..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Start Debate'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
