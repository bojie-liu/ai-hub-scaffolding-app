'use client';

import { useEffect, useState } from 'react';
import { useScrollRoot } from '@/contexts';

interface Section {
  id: string;
  label: string;
}

interface LessonSideMenuProps {
  sections: Section[];
}

export default function LessonSideMenu({ sections }: LessonSideMenuProps) {
  const [activeId, setActiveId] = useState<string>('');
  const scrollRootRef = useScrollRoot();

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;

    const visibleRefs = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleRefs.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleRefs.delete(entry.target.id);
          }
        }

        // Pick the first completely visible section, otherwise the one with highest ratio
        let topId = '';
        let topY = Infinity;
        let bestRatio = 0;

        for (const [id, ratio] of visibleRefs) {
          const el = document.getElementById(id);
          if (!el) continue;

          if (ratio >= 1) {
            const y = el.offsetTop;
            if (y < topY) {
              topY = y;
              topId = id;
            }
          } else if (!topId && ratio > bestRatio) {
            bestRatio = ratio;
            topId = id;
          }
        }

        if (topId) setActiveId(topId);
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections, scrollRootRef]);

  return (
    <aside className="hidden lg:block w-48 shrink-0">
      <nav className="sticky top-24 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sections</p>
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={() => setActiveId(s.id)}
            className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeId === s.id
                ? 'text-blue-600 bg-blue-50 font-medium'
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {s.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
