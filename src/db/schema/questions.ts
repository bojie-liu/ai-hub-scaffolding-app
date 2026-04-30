import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { quizzes } from './quizzes';

export const questions = pgTable('questions', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  quizId: integer('quiz_id')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  storageKey: text('storage_key').notNull().unique(),
  questionText: text('question_text').notNull(),
  questionOrder: integer('question_order').notNull().default(0),
  questionType: text('question_type').notNull().default('multiple_choice'),
  explanation: text('explanation'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
