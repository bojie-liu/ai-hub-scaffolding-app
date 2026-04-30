import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';

interface LessonSectionProps {
  id: string;
  title: string;
  badge?: string;
  children: ReactNode;
  className?: string;
}

export default function LessonSection({ id, title, badge, children, className }: LessonSectionProps) {
  return (
    <section id={id} className={`scroll-mt-20 ${className ?? ''}`}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl">{title}</CardTitle>
            {badge && <Badge variant="secondary">{badge}</Badge>}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}
