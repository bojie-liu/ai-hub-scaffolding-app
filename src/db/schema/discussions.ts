import { pgTable, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const discussions = pgTable('discussions', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  storageKey: text('storage_key').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  isPinned: boolean('is_pinned').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Discussion = typeof discussions.$inferSelect;
export type NewDiscussion = typeof discussions.$inferInsert;
