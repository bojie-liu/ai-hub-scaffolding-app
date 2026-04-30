import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const quizzes = pgTable('quizzes', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  storageKey: text('storage_key').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  quizType: text('quiz_type').notNull().default('multiple_choice'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
