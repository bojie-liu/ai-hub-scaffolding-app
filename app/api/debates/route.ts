import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { debates } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { desc } from 'drizzle-orm';

// GET /api/debates - List all debates
export async function GET() {
  try {
    const allDebates = await db
      .select()
      .from(debates)
      .orderBy(desc(debates.createdAt));

    return NextResponse.json(allDebates);
  } catch (error) {
    console.error('Error fetching debates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debates' },
      { status: 500 }
    );
  }
}

// POST /api/debates - Create a new debate
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, stance, description } = body;

    if (!topic || !stance) {
      return NextResponse.json(
        { error: 'Topic and stance are required' },
        { status: 400 }
      );
    }

    const newDebate = {
      id: nanoid(),
      topic,
      stance,
      description: description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(debates).values(newDebate);

    return NextResponse.json(newDebate, { status: 201 });
  } catch (error) {
    console.error('Error creating debate:', error);
    return NextResponse.json(
      { error: 'Failed to create debate' },
      { status: 500 }
    );
  }
}
