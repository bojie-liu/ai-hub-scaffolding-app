# AI Hub Scaffolding App - Project Memory

> Complete reference for regenerating this project. Every architectural decision, schema, component, and pattern documented.

---

## 1. Project Identity

- **Repository**: ai-hub-scaffolding-app
- **Package name**: react-project
- **Domain**: AI-powered educational/learning management platform
- **Purpose**: Interactive learning experiences with quizzes, discussions, concept checks, slide presentations, and student progress tracking
- **Deployment context**: Designed to run as an iframe inside an AI Hub Server, with token-based authentication exchange

---

## 2. Technology Stack

### Runtime & Framework
| Technology | Version | Notes |
|---|---|---|
| Next.js | 16.1.6 | App Router, Turbopack, React Server Components |
| React | 19.2.3 | With React Compiler support |
| React DOM | 19.2.3 | |
| TypeScript | ^5 | Strict mode |

### Database
| Technology | Version | Notes |
|---|---|---|
| Drizzle ORM | ^0.44.6 | PostgreSQL dialect |
| drizzle-kit | ^0.31.5 | Migrations |
| postgres (postgres-js) | ^3.4.9 | Driver |
| bcryptjs | ^3.0.3 | Password hashing |

### UI & Styling
| Technology | Version | Notes |
|---|---|---|
| Tailwind CSS | ^4 | CSS-first configuration, OKLCH colors |
| @tailwindcss/postcss | ^4 | PostCSS plugin |
| shadcn | ^4.2.0 | CLI & component system |
| @base-ui/react | ^1.4.0 | Primitive components (not Radix) |
| class-variance-authority | ^0.7.1 | Component variants |
| tailwind-merge | ^3.5.0 | Class merging |
| clsx | ^2.1.1 | Conditional classes |
| tw-animate-css | ^1.4.0 | Animation utilities |
| Lucide React | ^1.8.0 | Icons |
| Sonner | ^2.0.7 | Toast notifications |
| next-themes | ^0.4.6 | Dark mode |

### Dev Dependencies
- @types/bcryptjs ^2.4.6
- @types/node ^20
- @types/react ^19
- @types/react-dom ^19
- eslint ^9
- eslint-config-next 16.1.6
- styled-jsx ^5.1.7

---

## 3. Directory Structure

```
ai-hub-scaffolding-app/
├── certificates/                    # SSL certs for local dev
│   ├── localhost-key.pem
│   └── localhost.pem
├── drizzle/                         # Database migrations
│   ├── 0000_awesome_tempest.sql     # Initial migration (all tables)
│   └── meta/
│       ├── _journal.json
│       └── 0000_snapshot.json
├── public/                          # Static assets
│   ├── next.svg
│   └── vercel.svg
├── scripts/
│   └── setup-hooks.sh              # Git hooks setup (preinstall)
├── src/
│   ├── app/
│   │   ├── globals.css             # Tailwind v4 theme, OKLCH colors, animations
│   │   ├── layout.tsx              # Root layout: fonts, AppProvider, TokenGuard
│   │   └── page.tsx                # Home page (default Next.js starter)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthGuard.tsx       # Role-based route protection
│   │   │   └── LoginForm.tsx       # Login form with guest mode
│   │   ├── common/
│   │   │   └── Navbar.tsx          # Responsive nav with user dropdown, role-based
│   │   ├── dashboard/
│   │   │   └── TeacherDashboard.tsx # Teacher overview
│   │   ├── interactive/
│   │   │   ├── Discussion.tsx      # Discussion thread component
│   │   │   ├── DiscussionPageClient.tsx # Client-side discussion page
│   │   │   ├── EditableText.tsx    # Inline editable text
│   │   │   ├── Quiz.tsx           # Quiz component
│   │   │   ├── QuizPageClient.tsx  # Client-side quiz page
│   │   │   └── VennDiagram.tsx     # Interactive Venn diagram
│   │   ├── learning/
│   │   │   ├── Flashcard.tsx       # 3D flip flashcard
│   │   │   ├── Quiz.tsx           # Learning quiz variant
│   │   │   └── ScenarioQuiz.tsx    # Scenario-based quiz
│   │   ├── lesson/
│   │   │   ├── content/
│   │   │   │   ├── CardSection.tsx    # Card-based content section
│   │   │   │   ├── EditableContent.tsx # Editable lesson content
│   │   │   │   └── LessonSection.tsx  # Lesson section wrapper
│   │   │   ├── interactive/
│   │   │   │   ├── ConceptCheck.tsx   # Thumbs-up concept check
│   │   │   │   ├── Discussion.tsx     # Lesson discussion
│   │   │   │   └── Quiz.tsx          # Lesson quiz
│   │   │   ├── presentation/
│   │   │   │   ├── SlideCard.tsx      # Individual slide card
│   │   │   │   ├── SlideNavigation.tsx # Slide prev/next controls
│   │   │   │   └── Slides.tsx        # Slide deck container
│   │   │   └── LessonSideMenu.tsx     # Sidebar navigation
│   │   ├── media/
│   │   │   └── VideoPlayer.tsx        # Video player
│   │   ├── ui/                        # shadcn/ui components (base-nova style)
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx            # Variants: default, outline, secondary, ghost, destructive, link
│   │   │   │                          # Sizes: default, xs, sm, lg, icon-xs, icon-sm, icon-lg
│   │   │   ├── card.tsx              # Sub: Header, Title, Description, Action, Content, Footer
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   └── TokenGuard.tsx            # Token exchange + auto-login guard
│   ├── contexts/
│   │   ├── AppProvider.tsx           # Root: UserProvider > CourseProvider
│   │   ├── CourseContext.tsx          # Course state (from token exchange)
│   │   ├── ScrollRootContext.tsx      # Scroll container ref
│   │   └── UserContext.tsx           # User state, guest mode, token status
│   ├── db/
│   │   ├── index.ts                  # Drizzle + postgres-js connection
│   │   ├── migrate.ts               # Run migrations programmatically
│   │   ├── seed.ts                   # Idempotent seed (admin user)
│   │   ├── dev-setup.ts             # Dev startup: migrate, seed, then next dev
│   │   ├── start.ts                 # Production startup: migrate, then next start
│   │   └── schema/
│   │       ├── index.ts              # Re-exports all tables + relations
│   │       ├── users.ts
│   │       ├── editable-content.ts
│   │       ├── quizzes.ts
│   │       ├── questions.ts
│   │       ├── answers.ts
│   │       ├── quiz-attempts.ts
│   │       ├── question-responses.ts
│   │       ├── discussions.ts
│   │       ├── discussion-posts.ts
│   │       ├── concept-checks.ts
│   │       ├── concept-check-responses.ts
│   │       ├── slides.ts
│   │       ├── student-progress.ts
│   │       ├── seed-log.ts
│   │       └── relations.ts          # All Drizzle relations
│   └── lib/
│       ├── utils.ts                  # cn() helper (clsx + tailwind-merge)
│       ├── routes.ts                 # Route constants
│       ├── actions/
│       │   ├── auth.ts               # loginUser, registerUser
│       │   ├── concept-check.ts      # getConceptChecks, getConceptCheckResults, submitConceptCheckResponse
│       │   ├── discussion.ts         # getDiscussions, getDiscussion, createDiscussion, createPost
│       │   ├── editable-content.ts   # saveEditableContent, getEditableContent
│       │   ├── progress.ts           # markSectionComplete, getStudentProgress, getAllStudentProgress
│       │   ├── quiz.ts              # getQuiz, getAllQuizzes, submitQuizAttempt, getQuizResults
│       │   └── slides.ts            # getSlides, getSlide
│       ├── api/
│       │   └── token-exchange.ts     # Server action: exchange token with AI Hub Server
│       └── types/
│           └── index.ts              # User, Course, TokenExchangeResponse interfaces
├── .env.local                        # Environment variables
├── .env                              # Environment variables
├── CLAUDE.md                         # Claude Code instructions
├── components.json                   # shadcn/ui config
├── drizzle.config.ts                 # Drizzle Kit config
├── eslint.config.mjs
├── next.config.ts                    # Minimal Next.js config
├── package.json
├── postcss.config.mjs
└── tsconfig.json                     # Path alias: @/* -> ./src/*
```

---

## 4. Database Schema

### Connection
```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

### Tables

#### users
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, generated by default as identity | auto |
| username | text | NOT NULL, UNIQUE | - |
| email | text | NOT NULL, UNIQUE | - |
| passwordHash | text | NOT NULL | - |
| role | text | NOT NULL | 'STUDENT' |
| displayName | text | | null |
| createdAt | timestamp | | now() |
| updatedAt | timestamp | | now() |

Roles: `STUDENT`, `TEACHER`, `GUEST` (GUEST is client-side only, not in DB)

#### editable_content
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| storageKey | text | NOT NULL, UNIQUE | - |
| content | text | NOT NULL | - |
| updatedAt | timestamp | NOT NULL | now() |

#### quizzes
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| storageKey | text | NOT NULL, UNIQUE | - |
| title | text | NOT NULL | - |
| description | text | | null |
| quizType | text | | 'multiple_choice' |
| createdAt | timestamp | | now() |
| updatedAt | timestamp | | now() |

#### questions
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| quizId | integer | FK -> quizzes.id ON DELETE CASCADE | - |
| storageKey | text | NOT NULL, UNIQUE | - |
| questionText | text | NOT NULL | - |
| questionOrder | integer | | 0 |
| questionType | text | | 'multiple_choice' |
| explanation | text | | null |
| createdAt | timestamp | | now() |

#### answers
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| questionId | integer | FK -> questions.id ON DELETE CASCADE | - |
| answerText | text | NOT NULL | - |
| isCorrect | boolean | | false |
| answerOrder | integer | | 0 |

#### quiz_attempts
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| userId | integer | FK -> users.id ON DELETE CASCADE | - |
| quizId | integer | FK -> quizzes.id ON DELETE CASCADE | - |
| score | integer | | 0 |
| totalQuestions | integer | | 0 |
| completedAt | timestamp | | now() |

#### question_responses
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| attemptId | integer | FK -> quiz_attempts.id ON DELETE CASCADE | - |
| questionId | integer | FK -> questions.id ON DELETE CASCADE | - |
| answerId | integer | FK -> answers.id | null |
| textResponse | text | | null |
| isCorrect | boolean | | false |

#### discussions
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| storageKey | text | NOT NULL, UNIQUE | - |
| title | text | NOT NULL | - |
| description | text | | null |
| createdBy | integer | FK -> users.id | - |
| isPinned | boolean | | false |
| createdAt | timestamp | | now() |
| updatedAt | timestamp | | now() |

#### discussion_posts
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| discussionId | integer | FK -> discussions.id ON DELETE CASCADE | - |
| parentPostId | integer | FK -> discussion_posts.id (self-ref) | null |
| authorId | integer | FK -> users.id | - |
| content | text | NOT NULL | - |
| createdAt | timestamp | | now() |
| updatedAt | timestamp | | now() |

#### concept_checks
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| storageKey | text | NOT NULL, UNIQUE | - |
| title | text | NOT NULL | - |
| prompt | text | NOT NULL | - |
| checkType | text | | 'thumbs' |
| sectionKey | text | | null |
| createdAt | timestamp | | now() |

#### concept_check_responses
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| checkId | integer | FK -> concept_checks.id ON DELETE CASCADE | - |
| userId | integer | FK -> users.id ON DELETE CASCADE | - |
| responseValue | text | NOT NULL | - |
| createdAt | timestamp | | now() |

#### slides
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| storageKey | text | NOT NULL, UNIQUE | - |
| slideOrder | integer | NOT NULL | - |
| title | text | NOT NULL | - |
| content | text | NOT NULL | - |
| slideType | text | | 'content' |
| backgroundColor | text | | null |
| createdAt | timestamp | | now() |
| updatedAt | timestamp | | now() |

#### student_progress
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| userId | integer | FK -> users.id ON DELETE CASCADE | - |
| sectionKey | text | NOT NULL | - |
| completed | boolean | | false |
| completedAt | timestamp | | null |

**UNIQUE constraint**: (userId, sectionKey)

#### _seed_log
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | integer | PK, identity | auto |
| seedVersion | text | NOT NULL, UNIQUE | - |
| appliedAt | timestamp | | now() |

### Relations (Drizzle ORM)
```
users
  ├── quizAttempts (many) -> quiz_attempts
  ├── discussionPosts (many) -> discussion_posts
  ├── conceptCheckResponses (many) -> concept_check_responses
  └── studentProgress (many) -> student_progress

quizzes
  ├── questions (many) -> questions
  └── attempts (many) -> quiz_attempts

questions
  ├── quiz (one) -> quizzes
  ├── answers (many) -> answers
  └── responses (many) -> question_responses

answers
  └── question (one) -> questions

quiz_attempts
  ├── user (one) -> users
  ├── quiz (one) -> quizzes
  └── responses (many) -> question_responses

question_responses
  ├── attempt (one) -> quiz_attempts
  ├── question (one) -> questions
  └── answer (one) -> answers

discussions
  ├── createdByUser (one) -> users
  └── posts (many) -> discussion_posts

discussion_posts
  ├── discussion (one) -> discussions
  ├── author (one) -> users
  ├── parentPost (one) -> discussion_posts (self-ref, relationName: 'postReplies')
  └── replies (many) -> discussion_posts (relationName: 'postReplies')

concept_checks
  └── responses (many) -> concept_check_responses

concept_check_responses
  ├── conceptCheck (one) -> concept_checks
  └── user (one) -> users

student_progress
  └── user (one) -> users
```

---

## 5. Server Actions (Complete API)

All server actions are in `src/lib/actions/` and use `'use server'` directive.
All return `{ success: boolean, data?: T, error?: string }` pattern.
All use `revalidatePath()` from `next/cache` for mutations.

### auth.ts
```typescript
loginUser(username: string, password: string)
  -> { success: true, user: { userId, username, email, role } } | { success: false, error: string }

registerUser(username: string, email: string, password: string, role?: string)
  // role defaults to 'STUDENT'
  -> { success: true, user: { userId, username, email, role } } | { success: false, error: string }
```

### quiz.ts
```typescript
getQuiz(id: number)
  -> { success: true, data: { quiz, questions: Array<Question & { answers: Answer[] }> } }

getAllQuizzes()
  -> { success: true, data: Quiz[] }

submitQuizAttempt(userId: number, quizId: number, responses: { questionId: number; answerId?: number; textResponse?: string }[])
  -> { success: true, data: { score: number, totalQuestions: number } }
  // Creates attempt, inserts responses, calculates score

getQuizResults(quizId: number)
  -> { success: true, data: Array<{ attempt: QuizAttempt, user: User | null }> }
```

### discussion.ts
```typescript
getDiscussions()
  -> { success: true, data: Array<Discussion & { creatorName, creatorUsername, postCount }> }
  // Sorted: pinned first, then by createdAt desc

getDiscussion(id: number)
  -> { success: true, data: { discussion, creator, posts: Array<Post & { authorUsername, authorDisplayName, authorRole }> } }

createDiscussion(title: string, description: string, createdBy: number, storageKey?: string)
  // storageKey defaults to "discussion:{slugified-title}"
  -> { success: true, data: Discussion }

createPost(discussionId: number, authorId: number, content: string, parentPostId?: number)
  -> { success: true, data: DiscussionPost }
```

### editable-content.ts
```typescript
saveEditableContent(storageKey: string, content: string)
  // Upsert: updates if storageKey exists, inserts otherwise
  -> { success: true } | { success: false, error: string }

getEditableContent(storageKey: string)
  // Note: has redundant 'use server' inside function
  -> string | null  // Returns content string directly (not wrapped in success/error)
```

### progress.ts
```typescript
markSectionComplete(userId: number, sectionKey: string)
  // Upsert: updates if record exists, inserts otherwise
  -> { success: true }

getStudentProgress(userId: number)
  -> { success: true, data: StudentProgress[] }

getAllStudentProgress()
  // Gets all STUDENT users with their progress records
  -> { success: true, data: Array<{ student: { id, username, displayName, email, role }, progress: StudentProgress[] }> }
```

### concept-check.ts
```typescript
getConceptChecks()
  -> { success: true, data: ConceptCheck[] }

getConceptCheckResults()
  // Aggregates responses by check with counts
  -> { success: true, data: Array<{ check: ConceptCheck, responses: Response[], responseCounts: Record<string, number>, totalResponses: number }> }

submitConceptCheckResponse(checkId: number, userId: number, responseValue: string)
  -> { success: true, data: ConceptCheckResponse }
```

### slides.ts
```typescript
getSlides()
  // Ordered by slideOrder ascending
  -> { success: true, data: Slide[] }

getSlide(id: number)
  -> { success: true, data: Slide } | { success: false, error: string }
```

### token-exchange.ts (src/lib/api/)
```typescript
exchangeToken(token: string)  // Server action
  // POSTs to {AI_HUB_SERVER_HOST}/api/iframe/exchange
  // Returns: { userId, username, email, role, course: Course | null }
```

---

## 6. Component Inventory

### shadcn/ui Components (base-nova style, @base-ui/react primitives)
| Component | File | Key Details |
|---|---|---|
| Avatar | `src/components/ui/avatar.tsx` | With fallback |
| Badge | `src/components/ui/badge.tsx` | Status indicators |
| Button | `src/components/ui/button.tsx` | 6 variants, 7 sizes, data-slot |
| Card | `src/components/ui/card.tsx` | Header, Title, Description, Action, Content, Footer |
| Dialog | `src/components/ui/dialog.tsx` | Modal overlay |
| DropdownMenu | `src/components/ui/dropdown-menu.tsx` | Menu |
| Input | `src/components/ui/input.tsx` | Form input |
| Label | `src/components/ui/label.tsx` | Form label |
| Progress | `src/components/ui/progress.tsx` | Progress bar |
| ScrollArea | `src/components/ui/scroll-area.tsx` | Scrollable container |
| Separator | `src/components/ui/separator.tsx` | Divider |
| Skeleton | `src/components/ui/skeleton.tsx` | Loading placeholder |
| Sonner | `src/components/ui/sonner.tsx` | Toast notifications |
| Tabs | `src/components/ui/tabs.tsx` | Tab navigation |
| Textarea | `src/components/ui/textarea.tsx` | Multi-line input |

### Custom Components

#### Authentication
| Component | File | Description |
|---|---|---|
| AuthGuard | `src/components/auth/AuthGuard.tsx` | Redirects to /login if no user; blocks access if requiredRole doesn't match |
| LoginForm | `src/components/auth/LoginForm.tsx` | Username/password form with guest mode option |
| TokenGuard | `src/components/TokenGuard.tsx` | Reads token from URL or sessionStorage, exchanges with AI Hub Server, sets user & course |

#### Navigation
| Component | File | Description |
|---|---|---|
| Navbar | `src/components/common/Navbar.tsx` | Responsive top nav with user dropdown, role-based menu items |

#### Dashboard
| Component | File | Description |
|---|---|---|
| TeacherDashboard | `src/components/dashboard/TeacherDashboard.tsx` | Teacher overview with student progress |

#### Interactive Learning
| Component | File | Description |
|---|---|---|
| Discussion | `src/components/interactive/Discussion.tsx` | Discussion thread UI |
| DiscussionPageClient | `src/components/interactive/DiscussionPageClient.tsx` | Client wrapper for discussion page |
| EditableText | `src/components/interactive/EditableText.tsx` | Inline editable text with save |
| Quiz | `src/components/interactive/Quiz.tsx` | Quiz taking interface |
| QuizPageClient | `src/components/interactive/QuizPageClient.tsx` | Client wrapper for quiz page |
| VennDiagram | `src/components/interactive/VennDiagram.tsx` | Interactive Venn diagram visualization |

#### Learning Components
| Component | File | Description |
|---|---|---|
| Flashcard | `src/components/learning/Flashcard.tsx` | 3D flip animation flashcard |
| Quiz | `src/components/learning/Quiz.tsx` | Learning quiz variant |
| ScenarioQuiz | `src/components/learning/ScenarioQuiz.tsx` | Scenario-based quiz |

#### Lesson Components
| Component | File | Description |
|---|---|---|
| CardSection | `src/components/lesson/content/CardSection.tsx` | Card-based content block |
| EditableContent | `src/components/lesson/content/EditableContent.tsx` | Editable lesson content block |
| LessonSection | `src/components/lesson/content/LessonSection.tsx` | Lesson section wrapper |
| ConceptCheck | `src/components/lesson/interactive/ConceptCheck.tsx` | Thumbs up/down check |
| Discussion | `src/components/lesson/interactive/Discussion.tsx` | Lesson-embedded discussion |
| Quiz | `src/components/lesson/interactive/Quiz.tsx` | Lesson-embedded quiz |
| LessonSideMenu | `src/components/lesson/LessonSideMenu.tsx` | Sidebar navigation for lessons |
| SlideCard | `src/components/lesson/presentation/SlideCard.tsx` | Individual slide |
| SlideNavigation | `src/components/lesson/presentation/SlideNavigation.tsx` | Prev/Next slide controls |
| Slides | `src/components/lesson/presentation/Slides.tsx` | Slide deck container |

#### Media
| Component | File | Description |
|---|---|---|
| VideoPlayer | `src/components/media/VideoPlayer.tsx` | Video playback |

### Contexts
| Context | File | Provides |
|---|---|---|
| AppProvider | `src/contexts/AppProvider.tsx` | UserProvider > CourseProvider composition |
| UserContext | `src/contexts/UserContext.tsx` | user, isGuest, tokenProcessed, setUser, setTokenProcessed, loginAsGuest, logout |
| CourseContext | `src/contexts/CourseContext.tsx` | course, setCourse |
| ScrollRootContext | `src/contexts/ScrollRootContext.tsx` | scrollRootRef for scroll container |

### Type Definitions
```typescript
// src/lib/types/index.ts
interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
}

interface TokenExchangeResponse {
  userId: number;
  username: string;
  email: string;
  role: string;
  course: Course | null;
}
```

---

## 7. Authentication & Authorization Flow

### Architecture
This app is designed to run as an **iframe** inside an AI Hub Server. Authentication is handled via token exchange:

1. **Parent app** (AI Hub Server) embeds this app in an iframe with `?token=xxx` in the URL
2. **TokenGuard** (client component, wraps all children in layout.tsx):
   - Reads token from URL query params or sessionStorage
   - Calls `exchangeToken(token)` server action
   - Server action POSTs to `{AI_HUB_SERVER_HOST}/api/iframe/exchange`
   - Response contains: userId, username, email, role, course
   - Sets UserContext and CourseContext from response
   - Clears token from sessionStorage after success
   - Blocks rendering until token processing completes

3. **AuthGuard** (client component, used per-page):
   - Checks if user exists in UserContext
   - Redirects to /login if no user
   - Checks `requiredRole` prop against user.role
   - Shows "Access Denied" card if role doesn't match

### Guest Mode
- LoginForm has a "Continue as Guest" option
- Guest user: `{ userId: -1, username: 'Guest', email: '', role: 'GUEST' }`
- Guest role is client-side only (not in database)
- isGuest = user.role === 'GUEST'

### Role System
- `STUDENT` - Default role for new registrations
- `TEACHER` - Can access TeacherDashboard, manage content
- `GUEST` - Client-side only, limited access

### Environment Variables
- `AI_HUB_SERVER_HOST` - AI Hub Server URL (default: https://localhost:3000)
- `DATABASE_URL` - PostgreSQL connection string
- `SEED_ADMIN_PASSWORD` - Admin password for seed (default: 'changeme')

---

## 8. Routing & Navigation

### Route Constants
```typescript
// src/lib/routes.ts
export const routes = {
  dashboard: '/dashboard',
  discussion: '/discussion',
  discussionDetail: (id: number) => `/discussion/${id}`,
  quizzes: '/quizzes',
} as const;
```

### App Directory Routes
Currently minimal (only root page exists):
- `/` - Home page (src/app/page.tsx) - Default Next.js starter page

Planned routes (based on routes.ts and component structure):
- `/dashboard` - Dashboard
- `/discussion` - Discussion list
- `/discussion/[id]` - Discussion detail
- `/quizzes` - Quiz list

---

## 9. Configuration Files

### next.config.ts
Minimal configuration - no custom settings.

### tsconfig.json
- Path alias: `@/*` maps to `./src/*`
- Target: ES2017, Module: esnext
- JSX: preserve
- Strict mode enabled

### drizzle.config.ts
```typescript
export default {
  schema: './src/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

### components.json (shadcn/ui)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### postcss.config.mjs
```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### globals.css (Tailwind v4 theme)
- Uses `@import "tailwindcss"` (no tailwind.config.js needed)
- OKLCH color system for all theme variables
- Dark mode via `@media (prefers-color-scheme: dark)`
- Custom flashcard flip animation (3D transform)
- Custom CSS variables: --color-background, --color-foreground, --color-primary, --color-secondary, --color-muted, --color-accent, --color-destructive, --color-border, --color-input, --color-ring, --radius

---

## 10. Development Workflow

### npm Scripts
```bash
npm run dev          # Runs: npx tsx src/db/dev-setup.ts
                     # Which: migrate (allow fail) -> seed (allow fail) -> next dev

npm run build        # NODE_ENV=production && next build

npm run start        # NODE_ENV=production && npx tsx src/db/start.ts
                     # Which: migrate -> next start

npm run lint         # ESLint

npm run db:generate  # drizzle-kit generate
npm run db:push      # drizzle-kit push
npm run db:migrate   # drizzle-kit migrate
npm run db:studio    # drizzle-kit studio
npm run db:seed      # npx tsx src/db/seed.ts
```

### Dev Startup Sequence (src/db/dev-setup.ts)
1. Run migrations (allow failure - DB might not exist yet)
2. Run seed (allow failure - might already be seeded)
3. Start Next.js dev server

### Seed Data (src/db/seed.ts)
- Idempotent: checks `_seed_log` table for seed version `v1_initial`
- Creates admin user:
  - username: 'admin'
  - email: 'admin@example.com'
  - role: 'TEACHER'
  - displayName: 'Admin User'
  - password: `SEED_ADMIN_PASSWORD` env var (default: 'changeme')

### Pre-install Hook
- `scripts/setup-hooks.sh` runs on `npm install` via `preinstall` script

---

## 11. Key Patterns & Conventions

### Server Action Pattern
```typescript
'use server';
import { db } from '@/db';
import { tableName } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { routes } from '@/lib/routes';

export async function someAction(params: Type) {
  try {
    // Drizzle ORM query
    const result = await db.select().from(tableName).where(eq(tableName.col, params));
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to ...:', error);
    return { success: false, error: 'Failed to ...' };
  }
}
```

### Component Pattern (shadcn/ui)
```typescript
// Uses @base-ui/react primitives (NOT Radix)
// data-slot attributes for styling
// React.forwardRef with displayName
// cn() for class merging
// CVA for variants
```

### Context Pattern
```typescript
'use client';
const Context = createContext<ContextValue | undefined>(undefined);
export function Provider({ children }: { children: ReactNode }) { ... }
export function useContext() {
  const context = useContext(Context);
  if (context === undefined) throw new Error('...');
  return context;
}
```

### Storage Key Pattern
Many tables use a `storageKey` text column as a unique identifier, often following the format:
- `discussion:{slugified-title}`
- Content sections use specific keys for retrieval

### Database Import Pattern
```typescript
// Single table import
import { users } from '@/db/schema/users';

// Multiple tables from index
import { quizzes, questions, answers } from '@/db/schema';

// DB connection
import { db } from '@/db';
```

---

## 12. Common Problems & Pitfalls

### Context providers must wrap their consumers
React context hooks throw if the component calling them is not nested inside the matching provider. This project uses several contexts with the same pattern (`useContext` + undefined check → throw).

| Hook | Required Provider | Rendered in |
|---|---|---|
| `useScrollRoot` | `ScrollRootProvider` | Lesson page (wraps `LessonContent`) |
| `useUser` | `UserProvider` | `AppProvider` → root layout |
| `useCourse` | `CourseProvider` | `AppProvider` → root layout |

**Symptom**: Runtime error `"useX must be used within a XProvider"`.
**Fix**: Ensure the provider appears above the consuming component in the React tree. For page-scoped providers (like `ScrollRootProvider`), add them to the page component that renders the consumer.

### Token exchange failures on first load
The app authenticates via token exchange with the AI Hub Server. If the external server is unreachable or the token is expired/invalid, `TokenGuard` blocks rendering and the user sees a blank page.

**Symptom**: Blank page after loading in an iframe; console shows token exchange errors.
**Fix**: Verify `AI_HUB_SERVER_HOST` is correct and reachable, and that the parent app passes a valid `?token=` param.

### Guest mode limitations
Guest users (`role: 'GUEST'`) exist only client-side — they are not in the database. Server actions that require a `userId > 0` will silently skip or return no data for guests.

**Symptom**: Quizzes, concept checks, discussions, and progress features are hidden or non-functional for guest users.
**Fix**: This is by design. Gate interactive features behind `userId > 0` checks and prompt guests to sign in.

### Drizzle migrations during dev startup
`npm run dev` runs migrations before seeding, and both steps are allowed to fail (the DB may not exist yet). If the DB is in an inconsistent state, migration failures are silently swallowed.

**Symptom**: Schema changes aren't reflected; queries fail with "relation does not exist" errors.
**Fix**: Run `npm run db:push` to force-sync the schema, or drop and recreate the database.

### ScrollRootProvider double-ref conflict
`ScrollRootProvider` attaches `scrollRootRef` to its own wrapper `<div>`. If a child component also sets `ref={scrollRootRef}` on a different element, the ref will point to the child's element instead of the provider's wrapper — breaking the IntersectionObserver in `LessonSideMenu`.

**Symptom**: Sidebar section highlighting doesn't work or observes the wrong scroll container.
**Fix**: Only attach `scrollRootRef` in the provider. Consumers should read the ref via `useScrollRoot()` but not set it on any element.

---

## 13. SSL Certificates
- `certificates/localhost-key.pem` and `certificates/localhost.pem` for local HTTPS development
- Used when the app runs as an iframe inside AI Hub Server (which requires HTTPS)
