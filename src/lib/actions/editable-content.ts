'use server';

import { db } from '@/db';
import { editableContent } from '@/db/schema/editable-content';
import { eq } from 'drizzle-orm';

export async function saveEditableContent(storageKey: string, content: string) {
  'use server';

  try {
    const existing = await db
      .select()
      .from(editableContent)
      .where(eq(editableContent.storageKey, storageKey))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(editableContent)
        .set({ content, updatedAt: new Date() })
        .where(eq(editableContent.storageKey, storageKey));
    } else {
      await db.insert(editableContent).values({ storageKey, content });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to save editable content:', error);
    return { success: false, error: 'Failed to save content' };
  }
}

export async function getEditableContent(storageKey: string) {
  'use server';

  try {
    const result = await db
      .select()
      .from(editableContent)
      .where(eq(editableContent.storageKey, storageKey))
      .limit(1);

    return result[0]?.content || null;
  } catch (error) {
    console.error('Failed to fetch editable content:', error);
    return null;
  }
}
