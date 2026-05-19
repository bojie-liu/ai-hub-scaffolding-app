export const routes = {
  dashboard: '/dashboard',
  discussion: '/discussion',
  discussionDetail: (id: number) => `/discussion/${id}`,
  quizzes: '/quizzes',
  lesson: '/lesson',
  slides: '/slides',
  login: '/login',
} as const;
