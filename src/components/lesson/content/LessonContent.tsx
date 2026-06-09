'use client';

import { useUser } from '@/contexts/UserContext';
import EditableText from '@/components/interactive/EditableText';
import { useEffect, useState } from 'react';
import { getEditableContent } from '@/lib/actions/editable-content';

interface LessonContentProps {
  storageKey: string;
  initialValue: string;
  className?: string;
}

function renderFormatted(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('- ')) {
      return (
        <div key={i} className="flex items-start gap-2 mb-1.5">
          <span className="text-blue-600 mt-0.5 shrink-0">&#8226;</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i} className="mb-2 last:mb-0">{line}</p>;
  });
}

export default function LessonContent({ storageKey, initialValue, className }: LessonContentProps) {
  const { user } = useUser();
  const [savedValue, setSavedValue] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'TEACHER') {
      getEditableContent(storageKey).then((content) => {
        if (content !== null) setSavedValue(content);
      });
    }
  }, [storageKey, user?.role]);

  if (user?.role === 'TEACHER') {
    return (
      <EditableText
        storageKey={storageKey}
        initialValue={initialValue}
        as="div"
        className={className}
        multiline
      />
    );
  }

  return (
    <div className={className}>
      {renderFormatted(savedValue ?? initialValue)}
    </div>
  );
}
