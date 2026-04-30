import { relations } from 'drizzle-orm';
import { quizzes } from './quizzes';
import { questions } from './questions';
import { answers } from './answers';
import { quizAttempts } from './quiz-attempts';
import { questionResponses } from './question-responses';
import { users } from './users';
import { discussions } from './discussions';
import { discussionPosts } from './discussion-posts';
import { conceptChecks } from './concept-checks';
import { conceptCheckResponses } from './concept-check-responses';
import { studentProgress } from './student-progress';

export const quizzesRelations = relations(quizzes, ({ many }) => ({
  questions: many(questions),
  attempts: many(quizAttempts),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  answers: many(answers),
  responses: many(questionResponses),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
  responses: many(questionResponses),
}));

export const questionResponsesRelations = relations(questionResponses, ({ one }) => ({
  attempt: one(quizAttempts, {
    fields: [questionResponses.attemptId],
    references: [quizAttempts.id],
  }),
  question: one(questions, {
    fields: [questionResponses.questionId],
    references: [questions.id],
  }),
  answer: one(answers, {
    fields: [questionResponses.answerId],
    references: [answers.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  quizAttempts: many(quizAttempts),
  discussionPosts: many(discussionPosts),
  conceptCheckResponses: many(conceptCheckResponses),
  studentProgress: many(studentProgress),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [discussions.createdBy],
    references: [users.id],
  }),
  posts: many(discussionPosts),
}));

export const discussionPostsRelations = relations(discussionPosts, ({ one, many }) => ({
  discussion: one(discussions, {
    fields: [discussionPosts.discussionId],
    references: [discussions.id],
  }),
  author: one(users, {
    fields: [discussionPosts.authorId],
    references: [users.id],
  }),
  parentPost: one(discussionPosts, {
    fields: [discussionPosts.parentPostId],
    references: [discussionPosts.id],
    relationName: 'postReplies',
  }),
  replies: many(discussionPosts, {
    relationName: 'postReplies',
  }),
}));

export const conceptChecksRelations = relations(conceptChecks, ({ many }) => ({
  responses: many(conceptCheckResponses),
}));

export const conceptCheckResponsesRelations = relations(conceptCheckResponses, ({ one }) => ({
  conceptCheck: one(conceptChecks, {
    fields: [conceptCheckResponses.checkId],
    references: [conceptChecks.id],
  }),
  user: one(users, {
    fields: [conceptCheckResponses.userId],
    references: [users.id],
  }),
}));

export const studentProgressRelations = relations(studentProgress, ({ one }) => ({
  user: one(users, {
    fields: [studentProgress.userId],
    references: [users.id],
  }),
}));
