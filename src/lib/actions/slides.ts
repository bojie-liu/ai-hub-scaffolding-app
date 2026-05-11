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

export async function updateSlide(id: number, data: { title?: string; content?: string; backgroundColor?: string }) {
  try {
    await db
      .update(slides)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(slides.id, id));
    revalidatePath('/slides');
    return { success: true };
  } catch (error) {
    console.error('Failed to update slide:', error);
    return { success: false, error: 'Failed to update slide' };
  }
}

export async function createSlide(data: { storageKey: string; slideOrder: number; title: string; content: string; slideType?: string; backgroundColor?: string }) {
  try {
    const [newSlide] = await db
      .insert(slides)
      .values(data)
      .returning();
    revalidatePath('/slides');
    return { success: true, data: newSlide };
  } catch (error) {
    console.error('Failed to create slide:', error);
    return { success: false, error: 'Failed to create slide' };
  }
}
