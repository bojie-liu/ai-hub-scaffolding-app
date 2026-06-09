'use server';

import { db } from '@/db';
import { slides } from '@/db/schema/slides';
import { eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getSlides() {
  try {
    const result = await db.select().from(slides).orderBy(asc(slides.slideOrder));
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to fetch slides:', error);
    return { success: false, error: 'Failed to fetch slides' };
  }
}

export async function getSlide(id: number) {
  try {
    const result = await db.select().from(slides).where(eq(slides.id, id)).limit(1);
    if (result.length === 0) return { success: false, error: 'Slide not found' };
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Failed to fetch slide:', error);
    return { success: false, error: 'Failed to fetch slide' };
  }
}

export async function saveSlide(id: number, title: string, content: string) {
  try {
    await db
      .update(slides)
      .set({ title, content, updatedAt: new Date() })
      .where(eq(slides.id, id));

    revalidatePath('/slides');
    revalidatePath('/lesson');
    return { success: true };
  } catch (error) {
    console.error('Failed to save slide:', error);
    return { success: false, error: 'Failed to save slide' };
  }
}

export async function getSlideByKey(storageKey: string) {
  try {
    const result = await db
      .select()
      .from(slides)
      .where(eq(slides.storageKey, storageKey))
      .limit(1);
    if (result.length === 0) return { success: false, error: 'Slide not found' };
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Failed to fetch slide by key:', error);
    return { success: false, error: 'Failed to fetch slide by key' };
  }
}
