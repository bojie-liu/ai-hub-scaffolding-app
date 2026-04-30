'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import SlideCard from './SlideCard';
import SlideNavigation from './SlideNavigation';

interface Slide {
  id: number;
  storageKey: string;
  slideOrder: number;
  title: string;
  content: string;
  slideType: 'title' | 'content' | 'activity' | 'assessment';
  backgroundColor: string | null;
}

interface SlidesProps {
  slides: Slide[];
}

export default function Slides({ slides }: SlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlide(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlide(slides.length - 1);
          break;
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, slides.length, toggleFullscreen]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-lg text-muted-foreground">No slides available.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-black'
          : 'max-w-5xl mx-auto my-4 rounded-xl overflow-hidden shadow-xl border border-slate-200'
      }`}
    >
      <div className={`flex-1 ${isFullscreen ? 'h-[calc(100vh-56px)]' : 'min-h-[60vh] sm:min-h-[70vh]'}`}>
        <SlideCard slide={slides[currentSlide]} />
      </div>
      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onPrev={goPrev}
        onNext={goNext}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
    </div>
  );
}
