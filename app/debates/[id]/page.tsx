import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChatWindow } from '@/components/debate/ChatWindow';
import { db } from '@/lib/db';
import { debates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function DebatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const debate = await db
    .select()
    .from(debates)
    .where(eq(debates.id, id))
    .limit(1);

  if (debate.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Back Button */}
          <Link href="/debates">
            <Button variant="ghost" size="sm">
              ← Back to Debates
            </Button>
          </Link>

          {/* Chat Window */}
          <ChatWindow
            debateId={debate[0].id}
            topic={debate[0].topic}
            stance={debate[0].stance}
          />
        </div>
      </div>
    </div>
  );
}
