'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft, ChevronRight, Maximize, Minimize, X,
  Presentation, List
} from 'lucide-react';

interface Slide {
  id: number;
  slideOrder: number;
  title: string;
  content: string;
  slideType: string;
  backgroundColor?: string | null;
}

export function SlidesClient({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const router = useRouter();

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, slides.length - 1)));
  }, [slides.length]);

  const nextSlide = useCallback(() => goToSlide(currentIndex + 1), [currentIndex, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentIndex - 1), [currentIndex, goToSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showOverview) return;
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'Backspace':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            router.push('/lesson');
          }
          break;
        case 'f':
        case 'F':
          setIsFullscreen(prev => !prev);
          break;
        case 'o':
        case 'O':
          setShowOverview(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen, router, showOverview]);

  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  const currentSlide = slides[currentIndex];

  if (!currentSlide) return null;

  return (
    <AuthGuard>
      <div className={`min-h-screen bg-slate-900 text-white flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Top Bar */}
        {!isFullscreen && (
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Presentation className="h-5 w-5 text-blue-400" />
              <span className="font-medium text-sm">The Modern Software Developer</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowOverview(!showOverview)} className="text-slate-300 hover:text-white">
                <List className="h-4 w-4 mr-1" />
                {showOverview ? 'Slide' : 'Overview'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(true)} className="text-slate-300 hover:text-white">
                <Maximize className="h-4 w-4 mr-1" />
                Fullscreen
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/lesson')} className="text-slate-300 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {showOverview ? (
          /* Overview Grid */
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-xl font-bold mb-4">Slide Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    onClick={() => { goToSlide(i); setShowOverview(false); }}
                    className={`p-4 rounded-lg text-left transition-all hover:ring-2 hover:ring-blue-400 ${
                      i === currentIndex ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-slate-800'
                    }`}
                  >
                    <p className="text-xs text-slate-400 mb-1">{i + 1}</p>
                    <p className="text-sm font-medium truncate">{slide.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Slide Content */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl">
              {currentSlide.slideType === 'title' ? (
                <div className="text-center space-y-6">
                  <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                    {currentSlide.title}
                  </h1>
                  <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
                  <p className="text-xl text-slate-300 whitespace-pre-line">
                    {currentSlide.content}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-3xl sm:text-4xl font-bold border-b border-slate-700 pb-4">
                    {currentSlide.title}
                  </h2>
                  <div className="text-lg sm:text-xl text-slate-200 whitespace-pre-line leading-relaxed">
                    {currentSlide.content}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex items-center justify-between px-4 py-3 bg-slate-800 border-t border-slate-700 ${isFullscreen ? '' : ''}`}>
          <Button
            variant="ghost"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="text-slate-300 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">
              {currentIndex + 1} / {slides.length}
            </span>
            <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={nextSlide}
            disabled={currentIndex === slides.length - 1}
            className="text-slate-300 hover:text-white"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>

        {/* Fullscreen exit hint */}
        {isFullscreen && (
          <div className="absolute top-4 right-4 text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
            Press ESC to exit &bull; F to toggle fullscreen &bull; O for overview
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
