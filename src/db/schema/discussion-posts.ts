import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { discussions } from './discussions';

export const discussionPosts = pgTable('discussion_posts', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  discussionId: integer('discussion_id')
    .notNull()
    .references(() => discussions.id, { onDelete: 'cascade' }),
  parentPostId: integer('parent_post_id').references(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (): any => discussionPosts.id
  ),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type DiscussionPost = typeof discussionPosts.$inferSelect;
export type NewDiscussionPost = typeof discussionPosts.$inferInsert;
