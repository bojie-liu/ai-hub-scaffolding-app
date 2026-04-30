'use client';

import { useUser } from '@/contexts/UserContext';
import EditableText from '@/components/interactive/EditableText';
import { useEffect, useState } from 'react';
import { getEditableContent } from '@/lib/actions/editable-content';

interface EditableContentProps {
  storageKey: string;
  initialValue: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  multiline?: boolean;
}

export default function EditableContent({
  storageKey,
  initialValue,
  as = 'span',
  className,
  multiline = false,
}: EditableContentProps) {
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
        as={as}
        className={className}
        multiline={multiline}
      />
    );
  }

  const Tag = as;
  return <Tag className={className}>{savedValue ?? initialValue}</Tag>;
}
