interface Slide {
  id: number;
  storageKey: string;
  slideOrder: number;
  title: string;
  content: string;
  slideType: 'title' | 'content' | 'activity' | 'assessment';
  backgroundColor: string | null;
}

interface SlideCardProps {
  slide: Slide;
}

export default function SlideCard({ slide }: SlideCardProps) {
  const bgStyle = slide.backgroundColor ? { backgroundColor: slide.backgroundColor } : {};

  if (slide.slideType === 'title') {
    return (
      <div
        className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 sm:p-16"
        style={bgStyle}
      >
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-center mb-4 leading-tight">
          {slide.title}
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 text-center max-w-2xl">
          {slide.content}
        </p>
      </div>
    );
  }

  const iconMap: Record<string, string> = {
    activity: '\u{1F3AF}',
    assessment: '\u{1F4CB}',
  };

  const borderMap: Record<string, string> = {
    activity: 'border-l-4 border-l-blue-500',
    assessment: 'border-l-4 border-l-amber-500',
  };

  return (
    <div className={`flex flex-col h-full w-full bg-white p-6 sm:p-10 lg:p-14 ${borderMap[slide.slideType] ?? ''}`} style={bgStyle}>
      <div className="flex items-center gap-3 mb-6">
        {iconMap[slide.slideType] && <span className="text-2xl">{iconMap[slide.slideType]}</span>}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">{slide.title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {slide.content.split('\n').map((line, i) => {
          if (line.startsWith('- ')) {
            return (
              <div key={i} className="flex items-start gap-2 mb-2">
                <span className="text-blue-600 mt-1">&#8226;</span>
                <span className="text-base sm:text-lg text-slate-700">{line.slice(2)}</span>
              </div>
            );
          }
          if (line.trim() === '') return <div key={i} className="h-2" />;
          return (
            <p key={i} className="text-base sm:text-lg text-slate-700 mb-2">{line}</p>
          );
        })}
      </div>
    </div>
  );
}
