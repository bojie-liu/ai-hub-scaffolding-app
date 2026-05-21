'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export default function SlideNavigation({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  onToggleFullscreen,
  isFullscreen,
}: SlideNavigationProps) {
  const progress = totalSlides > 0 ? ((currentSlide + 1) / totalSlides) * 100 : 0;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/90 backdrop-blur text-white">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrev}
        disabled={currentSlide === 0}
        className="text-white hover:bg-white/10 disabled:opacity-30"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex-1 flex flex-col items-center gap-1">
        <span className="text-sm font-medium">
          投影片 {currentSlide + 1} / {totalSlides}
        </span>
        <Progress value={progress} className="h-1 w-full max-w-xs" />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        disabled={currentSlide === totalSlides - 1}
        className="text-white hover:bg-white/10 disabled:opacity-30"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleFullscreen}
        className="text-white hover:bg-white/10 ml-1"
        title={isFullscreen ? '退出全螢幕' : '全螢幕'}
      >
        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
      </Button>
    </div>
  );
}
