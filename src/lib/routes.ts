// Route constants — keep in sync with src/app/ directory structure.
// Convention: every static route here MUST have a matching page.tsx in src/app/.
// Dynamic routes use helper functions.
// To verify: ensure each value below has a corresponding src/app/{path}/page.tsx file.

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
