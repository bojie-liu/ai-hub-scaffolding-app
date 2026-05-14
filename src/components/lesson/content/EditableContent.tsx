'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import EditableText from '@/components/interactive/EditableText';
import { getEditableContent } from '@/lib/actions/editable-content';

interface EditableContentProps {
  storageKey: string;
  fallback: string;
  isTeacher?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  multiline?: boolean;
}

export function EditableContent({
  storageKey,
  fallback,
  isTeacher: isTeacherProp,
  as = 'span',
  className,
  multiline = false,
}: EditableContentProps) {
  const { user } = useUser();
  const isTeacher = isTeacherProp ?? user?.role === 'TEACHER';
  const [savedValue, setSavedValue] = useState<string | null>(null);

  useEffect(() => {
    if (!isTeacher) {
      getEditableContent(storageKey).then((content) => {
        if (content !== null) setSavedValue(content);
      });
    }
  }, [storageKey, isTeacher]);

  if (isTeacher) {
    return (
      <EditableText
        storageKey={storageKey}
        initialValue={fallback}
        as={as}
        className={className}
        multiline={multiline}
      />
    );
  }

  const Tag = as;
  return <Tag className={className}>{savedValue ?? fallback}</Tag>;
}

export { EditableContent as default };
