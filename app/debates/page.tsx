import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DebateCard } from '@/components/debate/DebateCard';
import { db } from '@/lib/db';
import { debates } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export default async function DebatesPage() {
  const allDebates = await db.select().from(debates).orderBy(desc(debates.createdAt));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Debate History</h1>
              <p className="text-muted-foreground mt-2">
                Review your past debates and continue discussions
              </p>
            </div>
            <Link href="/debates/new">
              <Button>New Debate</Button>
            </Link>
          </div>

          {/* Debates Grid */}
          {allDebates.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-xl text-muted-foreground">
                No debates yet. Start your first debate!
              </p>
              <Link href="/debates/new">
                <Button size="lg">Create Your First Debate</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allDebates.map((debate) => (
                <DebateCard key={debate.id} debate={debate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
