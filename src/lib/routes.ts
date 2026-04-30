export const routes = {
  dashboard: '/dashboard',
  discussion: '/discussion',
  discussionDetail: (id: number) => `/discussion/${id}`,
  quizzes: '/quizzes',
} as const;
