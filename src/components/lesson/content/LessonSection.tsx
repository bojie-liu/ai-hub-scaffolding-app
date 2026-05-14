'use client';

import { useState, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import EditableText from '@/components/interactive/EditableText';

interface LessonSectionProps {
  icon?: ReactNode;
  title: string;
  storageKey?: string;
  defaultContent?: string | null;
  isTeacher?: boolean;
  badge?: string;
  children: ReactNode;
  className?: string;
  expanded?: boolean;
  onToggle?: () => void;
  variant?: 'default' | 'inline';
  id?: string;
}

export function LessonSection({
  icon,
  title,
  storageKey,
  defaultContent,
  isTeacher = false,
  badge,
  children,
  className = '',
  expanded = true,
  onToggle,
  variant = 'default',
  id,
}: LessonSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(expanded);
  const isExpanded = onToggle ? expanded : internalExpanded;
  const toggle = onToggle ?? (() => setInternalExpanded(prev => !prev));

  if (variant === 'inline') {
    return (
      <section id={id} className={`scroll-mt-20 ${className}`}>
        <Card>
          <CardHeader className="pb-3 cursor-pointer" onClick={toggle}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {icon}
                {isTeacher && storageKey ? (
                  <EditableText
                    storageKey={storageKey}
                    initialValue={title}
                    as="h3"
                    className="text-lg font-semibold"
                  />
                ) : (
                  <CardTitle className="text-lg">{title}</CardTitle>
                )}
              </div>
              {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
            </div>
          </CardHeader>
          {isExpanded && <CardContent>{children}</CardContent>}
        </Card>
      </section>
    );
  }

  return (
    <section id={id} className={`scroll-mt-20 ${className}`}>
      <Card>
        <CardHeader className="pb-4 cursor-pointer" onClick={toggle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon}
              {isTeacher && storageKey ? (
                <EditableText
                  storageKey={storageKey}
                  initialValue={title}
                  as="h2"
                  className="text-xl"
                />
              ) : (
                <CardTitle className="text-xl">{title}</CardTitle>
              )}
              {badge && <Badge variant="secondary">{badge}</Badge>}
            </div>
            {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </div>
        </CardHeader>
        {isExpanded && <CardContent>{children}</CardContent>}
      </Card>
    </section>
  );
}

export default LessonSection;
