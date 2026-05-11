'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/common/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  PenTool,
  Presentation,
} from 'lucide-react';
import { getSlides, updateSlide } from '@/lib/actions/slides';

interface Slide {
  id: number;
  storageKey: string;
  slideOrder: number;
  title: string;
  content: string;
  slideType: string;
  backgroundColor: string | null;
}

export default function SlidesPage() {
  const { user } = useUser();
  const isTeacher = user?.role === 'TEACHER';
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSlides().then((result) => {
      if (result.success && result.data) {
        setSlides(result.data);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (editingSlide === null) return;
    setSaving(true);
    await updateSlide(editingSlide, { title: editTitle, content: editContent });
    setSlides((prev) =>
      prev.map((s) => s.id === editingSlide ? { ...s, title: editTitle, content: editContent } : s)
    );
    setEditingSlide(null);
    setSaving(false);
  }, [editingSlide, editTitle, editContent]);

  const startEditing = useCallback((slide: Slide) => {
    setEditingSlide(slide.id);
    setEditTitle(slide.title);
    setEditContent(slide.content);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (editingSlide !== null) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      setCurrentSlide((c) => Math.min(c + 1, slides.length - 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setCurrentSlide((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Escape') {
      setFullscreen(false);
    } else if (e.key === 'f' || e.key === 'F') {
      setFullscreen((f) => !f);
    }
  }, [slides.length, editingSlide]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [fullscreen]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-slate-400">Loading slides...</div>
        </div>
      </>
    );
  }

  if (slides.length === 0) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Presentation className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500">No slides available. Seed the database first.</p>
          </div>
        </div>
      </>
    );
  }

  const slide = slides[currentSlide];
  const bg = slide.backgroundColor || '#ffffff';
  const isDark = slide.backgroundColor && slide.backgroundColor !== '#ffffff';
  const isTitle = slide.slideType === 'title' || slide.slideType === 'closing';

  const slideContent = (
    <div
      className="relative w-full aspect-[16/9] max-h-[80vh] rounded-xl overflow-hidden shadow-xl flex flex-col justify-center"
      style={{ backgroundColor: bg }}
    >
      {editingSlide === slide.id ? (
        <div className="p-8 space-y-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-2xl font-bold bg-transparent border-b-2 border-slate-300 focus:outline-none focus:border-blue-500 pb-2"
            placeholder="Slide title"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full flex-1 min-h-[200px] text-base bg-transparent border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Slide content"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditingSlide(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-10 md:p-14">
          {isTitle ? (
            <div className="text-center">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {slide.title}
              </h1>
              <div className={`whitespace-pre-wrap text-base sm:text-lg md:text-xl leading-relaxed ${isDark ? 'text-white/80' : 'text-slate-600'}`}>
                {slide.content}
              </div>
            </div>
          ) : (
            <>
              <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {slide.title}
              </h2>
              <div className={`whitespace-pre-wrap text-sm sm:text-base md:text-lg leading-relaxed ${isDark ? 'text-white/85' : 'text-slate-700'}`}>
                {slide.content}
              </div>
            </>
          )}
          {isTeacher && !fullscreen && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-4 right-4 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
              onClick={() => startEditing(slide)}
            >
              <PenTool className="h-4 w-4 mr-1" /> Edit
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <AuthGuard>
      <>
        {!fullscreen && <Navbar />}
        <div className={`min-h-screen bg-slate-50 ${fullscreen ? 'fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-4' : ''}`}>
          {!fullscreen && (
            <div className="max-w-5xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Presentation Slides</h1>
                <p className="text-sm text-slate-500">Cognitive &amp; Social Constructivism — 10 slides</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setFullscreen(true)} className="gap-1.5">
                <Maximize2 className="h-4 w-4" /> Fullscreen
              </Button>
            </div>
          )}

          <div className={`max-w-5xl mx-auto px-4 ${fullscreen ? 'w-full max-w-6xl' : ''}`}>
            <div className="group relative">
              {slideContent}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSlide((c) => Math.max(c - 1, 0))}
                disabled={currentSlide === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              <div className="flex items-center gap-2">
                {!fullscreen && (
                  <div className="flex gap-1">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          i === currentSlide ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
                <span className="text-sm text-slate-500 font-medium">
                  {currentSlide + 1} / {slides.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {fullscreen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFullscreen(false)}
                    className="text-white hover:text-white hover:bg-white/10 gap-1"
                  >
                    <Minimize2 className="h-4 w-4" /> Exit
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide((c) => Math.min(c + 1, slides.length - 1))}
                  disabled={currentSlide === slides.length - 1}
                  className="gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Keyboard hints */}
          {!fullscreen && (
            <div className="max-w-5xl mx-auto px-4 mt-6">
              <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">&larr;</kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">&rarr;</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">F</kbd>
                  Fullscreen
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Space</kbd>
                  Next slide
                </span>
              </div>
            </div>
          )}
        </div>
      </>
    </AuthGuard>
  );
}
