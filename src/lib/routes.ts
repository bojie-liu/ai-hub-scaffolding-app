// Route constants — keep in sync with src/app/ directory structure.
// Convention: every static route here MUST have a matching page.tsx in src/app/.
// Dynamic routes use helper functions.

export const routes = {
  home: '/',
  login: '/login',
  lesson: '/lesson',
  slides: '/slides',
  dashboard: '/dashboard',
  discussion: '/discussion',
  discussionDetail: (id: number) => `/discussion/${id}`,
  quizzes: '/quizzes',
  quizDetail: (id: number) => `/quizzes/${id}`,
} as const;
