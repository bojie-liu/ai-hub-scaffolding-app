import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const slides = pgTable('slides', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  storageKey: text('storage_key').notNull().unique(),
  slideOrder: integer('slide_order').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  slideType: text('slide_type').notNull().default('content'),
  backgroundColor: text('background_color'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Slide = typeof slides.$inferSelect;
export type NewSlide = typeof slides.$inferInsert;
