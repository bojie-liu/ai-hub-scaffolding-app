import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { debates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/debates/[id] - Get a single debate
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const debate = await db
      .select()
      .from(debates)
      .where(eq(debates.id, id))
      .limit(1);

    if (debate.length === 0) {
      return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
    }

    return NextResponse.json(debate[0]);
  } catch (error) {
    console.error('Error fetching debate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debate' },
      { status: 500 }
    );
  }
}

// DELETE /api/debates/[id] - Delete a debate
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(debates).where(eq(debates.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting debate:', error);
    return NextResponse.json(
      { error: 'Failed to delete debate' },
      { status: 500 }
    );
  }
}
