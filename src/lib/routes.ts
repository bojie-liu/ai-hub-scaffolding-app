export const routes = {
  dashboard: '/dashboard',
  lesson: '/lesson',
  slides: '/slides',
  login: '/login',
  discussion: '/discussion',
  discussionDetail: (id: number) => `/discussion/${id}`,
  quizzes: '/quizzes',
} as const;
