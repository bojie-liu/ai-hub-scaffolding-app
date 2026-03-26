import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const editableContent = pgTable('editable_content', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  storageKey: text('storage_key').notNull().unique(),
  content: text('content').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type EditableContent = typeof editableContent.$inferSelect;
export type NewEditableContent = typeof editableContent.$inferInsert;
