'use server';

import { db } from '@/db';
import { studentProgress, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { routes } from '@/lib/routes';

export async function markSectionComplete(userId: number, sectionKey: string) {
  try {
    // Check if a record already exists
    const existing = await db
      .select()
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.userId, userId),
          eq(studentProgress.sectionKey, sectionKey)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(studentProgress)
        .set({
          completed: true,
          completedAt: new Date(),
        })
        .where(eq(studentProgress.id, existing[0].id));
    } else {
      // Insert new record
      await db.insert(studentProgress).values({
        userId,
        sectionKey,
        completed: true,
        completedAt: new Date(),
      });
    }

    revalidatePath(routes.dashboard);

    return { success: true };
  } catch (error) {
    console.error('Failed to mark section complete:', error);
    return { success: false, error: 'Failed to mark section complete' };
  }
}

export async function getStudentProgress(userId: number) {
  try {
    const progress = await db
      .select()
      .from(studentProgress)
      .where(eq(studentProgress.userId, userId));

    return { success: true, data: progress };
  } catch (error) {
    console.error('Failed to fetch student progress:', error);
    return { success: false, error: 'Failed to fetch student progress' };
  }
}

export async function getAllStudentProgress() {
  try {
    // Get all students with their progress
    const allStudents = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.role, 'STUDENT'));

    // Get all progress records
    const allProgress = await db
      .select()
      .from(studentProgress);

    // Group progress by user
    const progressByUser = new Map<number, typeof allProgress>();

    for (const record of allProgress) {
      if (!progressByUser.has(record.userId)) {
        progressByUser.set(record.userId, []);
      }
      progressByUser.get(record.userId)!.push(record);
    }

    // Combine student info with their progress
    const data = allStudents.map((student) => ({
      student,
      progress: progressByUser.get(student.id) ?? [],
    }));

    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch all student progress:', error);
    return { success: false, error: 'Failed to fetch all student progress' };
  }
}
