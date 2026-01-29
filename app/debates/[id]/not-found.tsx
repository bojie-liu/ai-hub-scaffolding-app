import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Debate Not Found</h1>
        <p className="text-muted-foreground">
          The debate you're looking for doesn't exist or has been deleted.
        </p>
        <Link href="/debates">
          <Button>Back to Debates</Button>
        </Link>
      </div>
    </div>
  );
}
