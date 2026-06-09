'use server';

import { db } from '@/db';
import { conceptChecks, conceptCheckResponses, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getConceptChecks() {
  try {
    const checks = await db
      .select()
      .from(conceptChecks)
      .orderBy(desc(conceptChecks.createdAt));

    return { success: true, data: checks };
  } catch (error) {
    console.error('Failed to fetch concept checks:', error);
    return { success: false, error: 'Failed to fetch concept checks' };
  }
}

export async function getConceptCheckResults() {
  try {
    // Get all concept checks
    const checks = await db
      .select()
      .from(conceptChecks);

    // Get all responses with user info
    const responses = await db
      .select({
        id: conceptCheckResponses.id,
        checkId: conceptCheckResponses.checkId,
        userId: conceptCheckResponses.userId,
        responseValue: conceptCheckResponses.responseValue,
        createdAt: conceptCheckResponses.createdAt,
        username: users.username,
        displayName: users.displayName,
      })
      .from(conceptCheckResponses)
      .leftJoin(users, eq(conceptCheckResponses.userId, users.id));

    // Group responses by check
    const results = checks.map((check) => {
      const checkResponses = responses.filter((r) => r.checkId === check.id);

      // Aggregate response values
      const responseCounts = new Map<string, number>();
      for (const response of checkResponses) {
        const value = response.responseValue;
        responseCounts.set(value, (responseCounts.get(value) ?? 0) + 1);
      }

      return {
        check,
        responses: checkResponses,
        responseCounts: Object.fromEntries(responseCounts),
        totalResponses: checkResponses.length,
      };
    });

    return { success: true, data: results };
  } catch (error) {
    console.error('Failed to fetch concept check results:', error);
    return { success: false, error: 'Failed to fetch concept check results' };
  }
}

export async function getUserConceptCheckResponse(checkId: number, userId: number) {
  try {
    const result = await db
      .select({ responseValue: conceptCheckResponses.responseValue })
      .from(conceptCheckResponses)
      .where(eq(conceptCheckResponses.checkId, checkId))
      .orderBy(desc(conceptCheckResponses.createdAt))
      .limit(1);

    if (result.length === 0) return null;
    return result[0].responseValue;
  } catch (error) {
    console.error('Failed to fetch user concept check response:', error);
    return null;
  }
}

export async function submitConceptCheckResponse(
  checkId: number,
  userId: number,
  responseValue: string
) {
  try {
    const [newResponse] = await db
      .insert(conceptCheckResponses)
      .values({
        checkId,
        userId,
        responseValue,
      })
      .returning();

    return { success: true, data: newResponse };
  } catch (error) {
    console.error('Failed to submit concept check response:', error);
    return { success: false, error: 'Failed to submit concept check response' };
  }
}
