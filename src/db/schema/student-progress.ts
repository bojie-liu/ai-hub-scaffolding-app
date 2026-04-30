import { pgTable, integer, text, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

export const studentProgress = pgTable('student_progress', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  sectionKey: text('section_key').notNull(),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
}, (table) => [
  uniqueIndex('student_progress_user_id_section_key_idx').on(table.userId, table.sectionKey),
]);

export type StudentProgress = typeof studentProgress.$inferSelect;
export type NewStudentProgress = typeof studentProgress.$inferInsert;
