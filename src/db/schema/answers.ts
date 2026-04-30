import { pgTable, integer, text, boolean } from 'drizzle-orm/pg-core';
import { questions } from './questions';

export const answers = pgTable('answers', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  questionId: integer('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  answerText: text('answer_text').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false),
  answerOrder: integer('answer_order').notNull().default(0),
});

export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
