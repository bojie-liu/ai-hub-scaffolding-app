import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { debates, messages } from '@/lib/db/schema';
import { openai, buildSystemPrompt } from '@/lib/openai/client';
import { nanoid } from 'nanoid';
import { eq, asc } from 'drizzle-orm';

// POST /api/chat - Send a message and get AI response
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { debateId, content, chatId } = body;

    if (!debateId || !content) {
      return NextResponse.json(
        { error: 'Debate ID and content are required' },
        { status: 400 }
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // Get debate details
    const debate = await db
      .select()
      .from(debates)
      .where(eq(debates.id, debateId))
      .limit(1);

    if (debate.length === 0) {
      return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
    }

    // Save user message
    const userMessage = {
      id: nanoid(),
      debateId,
      role: 'user' as const,
      content,
      createdAt: new Date(),
    };

    await db.insert(messages).values(userMessage);

    // Get previous messages for context (last 10)
    const previousMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.debateId, debateId))
      .orderBy(asc(messages.createdAt))
      .limit(10);

    // Build messages array for OpenAI
    const systemPrompt = buildSystemPrompt(debate[0].topic, debate[0].stance);
    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...previousMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // Call OpenAI API
    console.log('josh base url', openai.baseURL);
    // @ts-expect-error - Custom API parameters (chatId, stream, detail) not in standard OpenAI types
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      chatId: chatId,
      stream: false,
      detail: false,
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0].message.content || '';

    // Save AI response
    const assistantMessage = {
      id: nanoid(),
      debateId,
      role: 'assistant' as const,
      content: aiResponse,
      createdAt: new Date(),
    };

    await db.insert(messages).values(assistantMessage);

    return NextResponse.json({
      message: aiResponse,
      messageId: assistantMessage.id,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
