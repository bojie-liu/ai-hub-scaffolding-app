import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const seedLog = pgTable('_seed_log', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  seedVersion: text('seed_version').notNull().unique(),
  appliedAt: timestamp('applied_at').defaultNow(),
});

export type SeedLog = typeof seedLog.$inferSelect;
export type NewSeedLog = typeof seedLog.$inferInsert;
