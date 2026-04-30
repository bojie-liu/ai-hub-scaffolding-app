import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { conceptChecks } from './concept-checks';

export const conceptCheckResponses = pgTable('concept_check_responses', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  checkId: integer('check_id')
    .notNull()
    .references(() => conceptChecks.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  responseValue: text('response_value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type ConceptCheckResponse = typeof conceptCheckResponses.$inferSelect;
export type NewConceptCheckResponse = typeof conceptCheckResponses.$inferInsert;
