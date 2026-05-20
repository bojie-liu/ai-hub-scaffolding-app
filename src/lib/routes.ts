export const routes = {
  lesson: '/lesson',
  slides: '/slides',
  dashboard: '/dashboard',
  login: '/login',
  discussion: '/discussion',
  discussionDetail: (id: number) => `/discussion/${id}`,
  quizzes: '/quizzes',
} as const;
