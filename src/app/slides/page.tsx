'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSlides, saveSlide } from '@/lib/actions/slides';
import { useUser } from '@/contexts/UserContext';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Slides from '@/components/lesson/presentation/Slides';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit3, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Slide {
  id: number;
  storageKey: string;
  slideOrder: number;
  title: string;
  content: string;
  slideType: 'title' | 'content' | 'activity' | 'assessment';
  backgroundColor: string | null;
}

export default function SlidesPage() {
  const { user } = useUser();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSlides = useCallback(async () => {
    const result = await getSlides();
    if (result.success && result.data) {
      setSlides(result.data as Slide[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSlides(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchSlides]);

  async function handleSave() {
    if (!editingSlide) return;
    setSaving(true);
    const result = await saveSlide(editingSlide.id, editTitle, editContent);
    if (result.success) {
      toast.success('Slide saved');
      setEditingSlide(null);
      fetchSlides();
    } else {
      toast.error('Failed to save slide');
    }
    setSaving(false);
  }

  function startEditing(slide: Slide) {
    setEditingSlide(slide);
    setEditTitle(slide.title);
    setEditContent(slide.content);
  }

  const isTeacher = user?.role === 'TEACHER';

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Presentation Slides</h1>
          {isTeacher && (
            <Button
              variant={editMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setEditMode(!editMode);
                setEditingSlide(null);
              }}
              className="gap-2"
            >
              {editMode ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              {editMode ? 'Preview Mode' : 'Edit Mode'}
            </Button>
          )}
        </div>

        {editMode ? (
          <div className="space-y-4">
            {slides.map((slide) => (
              <Card key={slide.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Slide {slide.slideOrder}: {slide.title}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(slide)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingSlide?.id === slide.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Title</label>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Slide title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Content</label>
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Slide content (use - for bullet points, newlines for paragraphs)"
                          rows={8}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} disabled={saving}>
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSlide(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{slide.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Slides slides={slides} />
        )}
      </div>
    </AuthGuard>
  );
}
