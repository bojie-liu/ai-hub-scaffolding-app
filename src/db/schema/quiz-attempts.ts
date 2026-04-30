import { pgTable, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { quizzes } from './quizzes';

export const quizAttempts = pgTable('quiz_attempts', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  quizId: integer('quiz_id')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  score: integer('score').notNull().default(0),
  totalQuestions: integer('total_questions').notNull().default(0),
  completedAt: timestamp('completed_at').defaultNow(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
