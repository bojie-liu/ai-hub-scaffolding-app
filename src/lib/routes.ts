export const routes = {
  home: '/',
  login: '/login',
  lesson: '/lesson',
  dashboard: '/dashboard',
  slides: '/slides',
  quizzes: '/quizzes',
  discussion: '/discussion',
  discussionDetail: (id: number) => `/discussion/${id}`,
} as const;
