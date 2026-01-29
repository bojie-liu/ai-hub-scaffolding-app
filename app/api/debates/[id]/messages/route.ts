import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET /api/debates/[id]/messages - Get all messages for a debate
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const debateMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.debateId, id))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json(debateMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
