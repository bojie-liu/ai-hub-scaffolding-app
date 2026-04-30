'use server';

import { db } from '@/db';
import { slides } from '@/db/schema/slides';
import { eq, asc } from 'drizzle-orm';

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
