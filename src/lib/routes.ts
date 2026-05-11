export const routes = {
  home: '/',
  login: '/login',
  lesson: '/lesson',
  slides: '/slides',
  dashboard: '/dashboard',
  discussion: '/discussion',
  discussionDetail: (id: number) => `/discussion/${id}`,
  quizzes: '/quizzes',
} as const;
