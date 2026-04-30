import { pgTable, integer, text, boolean } from 'drizzle-orm/pg-core';
import { quizAttempts } from './quiz-attempts';
import { questions } from './questions';
import { answers } from './answers';

export const questionResponses = pgTable('question_responses', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  attemptId: integer('attempt_id')
    .notNull()
    .references(() => quizAttempts.id, { onDelete: 'cascade' }),
  questionId: integer('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  answerId: integer('answer_id').references(() => answers.id),
  textResponse: text('text_response'),
  isCorrect: boolean('is_correct').notNull().default(false),
});

export type QuestionResponse = typeof questionResponses.$inferSelect;
export type NewQuestionResponse = typeof questionResponses.$inferInsert;
