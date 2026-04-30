'use server';

import { db } from '@/db';
import { discussions, discussionPosts, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { routes } from '@/lib/routes';

export async function getDiscussions() {
  try {
    const allDiscussions = await db
      .select({
        id: discussions.id,
        storageKey: discussions.storageKey,
        title: discussions.title,
        description: discussions.description,
        createdBy: discussions.createdBy,
        isPinned: discussions.isPinned,
        createdAt: discussions.createdAt,
        updatedAt: discussions.updatedAt,
        creatorName: users.displayName,
        creatorUsername: users.username,
      })
      .from(discussions)
      .leftJoin(users, eq(discussions.createdBy, users.id))
      .orderBy(desc(discussions.isPinned), desc(discussions.createdAt));

    // Get post counts for each discussion
    const discussionsWithCounts = await Promise.all(
      allDiscussions.map(async (discussion) => {
        const posts = await db
          .select({ id: discussionPosts.id })
          .from(discussionPosts)
          .where(eq(discussionPosts.discussionId, discussion.id));

        return {
          ...discussion,
          postCount: posts.length,
        };
      })
    );

    return { success: true, data: discussionsWithCounts };
  } catch (error) {
    console.error('Failed to fetch discussions:', error);
    return { success: false, error: 'Failed to fetch discussions' };
  }
}

export async function getDiscussion(id: number) {
  try {
    const discussionRows = await db
      .select()
      .from(discussions)
      .where(eq(discussions.id, id))
      .limit(1);

    if (discussionRows.length === 0) {
      return { success: false, error: 'Discussion not found' };
    }

    const discussion = discussionRows[0];

    // Fetch the creator
    const creatorRows = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, discussion.createdBy))
      .limit(1);

    const creator = creatorRows[0] ?? null;

    // Fetch all posts for this discussion with author info
    const posts = await db
      .select({
        id: discussionPosts.id,
        discussionId: discussionPosts.discussionId,
        parentPostId: discussionPosts.parentPostId,
        authorId: discussionPosts.authorId,
        content: discussionPosts.content,
        createdAt: discussionPosts.createdAt,
        updatedAt: discussionPosts.updatedAt,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorRole: users.role,
      })
      .from(discussionPosts)
      .leftJoin(users, eq(discussionPosts.authorId, users.id))
      .where(eq(discussionPosts.discussionId, id))
      .orderBy(discussionPosts.createdAt);

    return {
      success: true,
      data: {
        discussion,
        creator,
        posts,
      },
    };
  } catch (error) {
    console.error('Failed to fetch discussion:', error);
    return { success: false, error: 'Failed to fetch discussion' };
  }
}

export async function createDiscussion(
  title: string,
  description: string,
  createdBy: number,
  storageKey?: string
) {
  try {
    const key = storageKey ?? `discussion:${title.toLowerCase().replace(/\s+/g, '-')}`;

    const [newDiscussion] = await db
      .insert(discussions)
      .values({
        storageKey: key,
        title,
        description,
        createdBy,
      })
      .returning();

    revalidatePath(routes.discussion);

    return { success: true, data: newDiscussion };
  } catch (error) {
    console.error('Failed to create discussion:', error);
    return { success: false, error: 'Failed to create discussion' };
  }
}

export async function createPost(
  discussionId: number,
  authorId: number,
  content: string,
  parentPostId?: number
) {
  try {
    const [newPost] = await db
      .insert(discussionPosts)
      .values({
        discussionId,
        authorId,
        content,
        parentPostId: parentPostId ?? null,
      })
      .returning();

    revalidatePath(routes.discussionDetail(discussionId));

    return { success: true, data: newPost };
  } catch (error) {
    console.error('Failed to create post:', error);
    return { success: false, error: 'Failed to create post' };
  }
}
