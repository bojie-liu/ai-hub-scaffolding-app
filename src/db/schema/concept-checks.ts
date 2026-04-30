import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const conceptChecks = pgTable('concept_checks', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  storageKey: text('storage_key').notNull().unique(),
  title: text('title').notNull(),
  prompt: text('prompt').notNull(),
  checkType: text('check_type').notNull().default('thumbs'),
  sectionKey: text('section_key'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type ConceptCheck = typeof conceptChecks.$inferSelect;
export type NewConceptCheck = typeof conceptChecks.$inferInsert;
