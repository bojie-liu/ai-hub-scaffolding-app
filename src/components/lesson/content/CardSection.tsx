import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export default function CardSection({ children, className }: CardSectionProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}
