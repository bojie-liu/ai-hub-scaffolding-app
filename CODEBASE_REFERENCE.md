# Codebase Reference (Committed Code)

## Tech Stack
- Next.js 16.1.6, React 19.2.3, TypeScript 5, Tailwind CSS v4
- Drizzle ORM v0.44.6 + PostgreSQL (pg driver)
- shadcn/ui 4.2.0 (base-nova theme, 14 components installed)
- bcryptjs for password hashing, sonner for toasts, lucide-react for icons

## Project Structure
```
src/
  app/          # App Router - only layout.tsx, page.tsx, globals.css committed
  components/
    auth/       # LoginForm, AuthGuard
    common/     # Navbar
    dashboard/  # TeacherDashboard
    interactive/ # Discussion, DiscussionPageClient, Quiz, QuizPageClient, EditableText, VennDiagram
    learning/   # Flashcard, Quiz, ScenarioQuiz
    lesson/     # LessonSideMenu, content/, interactive/, presentation/
    ui/         # 14 shadcn components (avatar,badge,button,card,dialog,dropdown-menu,input,label,progress,scroll-area,separator,skeleton,sonner,tabs,textarea)
  contexts/     # UserContext, CourseContext, ScrollRootContext, AppProvider
  db/           # index.ts (drizzle connection), schema/ (14 tables + relations)
  lib/
    actions/    # auth, concept-check, discussion, editable-content, progress, quiz, slides
    api/        # token-exchange.ts
    types/      # User, Course, TokenExchangeResponse
    utils.ts    # cn() helper
```

## Database Schema (all in src/db/schema/)

| Table | Key Columns | Notes |
|---|---|---|
| users | id (identity PK), username, email, passwordHash, role, displayName | role defaults to 'STUDENT' |
| quizzes | id, storageKey (unique), title, description, quizType | quizType: 'multiple_choice' |
| questions | id, quizId (FK), storageKey (unique), questionText, questionOrder, questionType, explanation | questionType: 'multiple_choice','true_false','short_answer' |
| answers | id, questionId (FK), answerText, isCorrect, answerOrder | |
| quizAttempts | id, userId (FK), quizId (FK), score, totalQuestions, completedAt | |
| questionResponses | id, attemptId (FK), questionId (FK), answerId (FK), textResponse, isCorrect | |
| discussions | id, storageKey (unique), title, description, createdBy (FK→users), isPinned | |
| discussionPosts | id, discussionId (FK), parentPostId (self-ref), authorId (FK), content | Threaded via parentPostId |
| conceptChecks | id, storageKey (unique), title, prompt, checkType, sectionKey | checkType: 'thumbs','scale','text' |
| conceptCheckResponses | id, checkId (FK), userId (FK), responseValue | |
| studentProgress | id, userId (FK), sectionKey, completed, completedAt | Unique index on (userId, sectionKey) |
| slides | id, storageKey (unique), slideOrder, title, content, slideType, backgroundColor | slideType: 'title','content','activity','assessment' |
| editableContent | id, storageKey (unique), content, updatedAt | Key-value store for teacher edits |
| relations.ts | Drizzle relations connecting all tables | quizzes→questions→answers, users→attempts/posts/responses/progress |

## Server Actions (src/lib/actions/)

### auth.ts
- `loginUser(username, password)` → validates bcrypt, returns `{success, user:{userId,username,email,role}}`
- `registerUser(username, email, password, role='STUDENT')` → checks uniqueness, hashes password, returns same shape

### quiz.ts
- `getQuiz(id)` → returns quiz with questions and answers joined
- `getAllQuizzes()` → all quizzes ordered by createdAt desc
- `submitQuizAttempt(userId, quizId, responses[])` → creates attempt + responses, calculates score
- `getQuizResults(quizId)` → attempts with user info for dashboard

### discussion.ts
- `getDiscussions()` → all discussions with creator info and post counts
- `getDiscussion(id)` → single discussion with creator and all posts (flat, with author info)
- `createDiscussion(title, description, createdBy, storageKey?)` → insert + revalidate
- `createPost(discussionId, authorId, content, parentPostId?)` → insert + revalidate

### concept-check.ts
- `getConceptChecks()` → all checks
- `getConceptCheckResults()` → checks with aggregated response counts and individual responses
- `submitConceptCheckResponse(checkId, userId, responseValue)` → insert response

### editable-content.ts
- `saveEditableContent(storageKey, content)` → upsert by storageKey
- `getEditableContent(storageKey)` → returns content string or null

### progress.ts
- `markSectionComplete(userId, sectionKey)` → upsert progress record
- `getStudentProgress(userId)` → progress records for one student
- `getAllStudentProgress()` → all students with their progress (for dashboard)

### slides.ts
- `getSlides()` → all slides ordered by slideOrder
- `getSlide(id)` → single slide

## Key Components

### Auth
- **LoginForm**: username/password + guest login, calls loginUser, sets UserContext, redirects by role
- **AuthGuard**: checks UserContext, shows login prompt or access denied; `requiredRole` prop

### Layout & Navigation
- **Navbar**: sticky top nav with role-filtered links, user dropdown menu with avatar
- **LessonSideMenu**: IntersectionObserver-driven section nav, uses ScrollRootContext

### Interactive (standalone pages)
- **Discussion** (`interactive/Discussion.tsx`): Full discussion thread with post tree, reply functionality, create new post
- **Quiz** (`interactive/Quiz.tsx`): Multi-question quiz with multiple choice, true/false, short answer, instant feedback
- **DiscussionPageClient/QuizPageClient**: Client wrappers for standalone pages

### Lesson (embedded in sections)
- **Quiz** (`lesson/interactive/Quiz.tsx`): Simpler embedded quiz, all questions on one page, submit all at once
- **Discussion** (`lesson/interactive/Discussion.tsx`): Embedded discussion with PostItem tree builder
- **ConceptCheck** (`lesson/interactive/ConceptCheck.tsx`): Thumbs/scale/text response with toast feedback

### Content
- **LessonSection**: Section wrapper with id, title, badge, scroll margin
- **CardSection**: Simple card wrapper
- **EditableContent**: Teacher-can-edit (shows EditableText), student-sees-saved (fetches from DB)

### Presentation
- **Slides**: Fullscreen-capable slide viewer with keyboard nav (arrows, space, F, Home/End)
- **SlideCard**: Renders title/content/activity/assessment slide types
- **SlideNavigation**: Progress bar + prev/next/fullscreen controls

### Dashboard
- **TeacherDashboard**: Tabs for Student Progress (table with checkmarks), Quiz Results (score table), Concept Checks (bar charts). Fetches data on mount.

### Other
- **EditableText**: Click-to-edit text input, saves to localStorage + DB via saveEditableContent
- **VennDiagram**: SVG Venn diagram comparing Cognitive vs Social Constructivism
- **Flashcard** (`learning/Flashcard.tsx`): Flip animation card, needs CSS classes in globals.css
- **ScenarioQuiz** (`learning/ScenarioQuiz.tsx`): Scenario-based quiz component
- **VideoPlayer** (`media/VideoPlayer.tsx`): Video embed component
- **TokenInitializer**: Reads `?token=` from URL, exchanges with external API, sets UserContext

## Contexts
- **UserContext**: user state + isGuest + loginAsGuest + logout + setUser + setTokenProcessed
- **CourseContext**: course state + setCourse
- **ScrollRootContext**: scrollRootRef for IntersectionObserver
- **AppProvider**: UserProvider > CourseProvider (wraps children)

## Types (src/lib/types/index.ts)
```typescript
interface User { userId: number; username: string; email: string; role: string; }
interface Course { id: number; name: string; description: string; }
interface TokenExchangeResponse { userId: number; username: string; email: string; role: string; course: Course | null; }
```

## Key Patterns
- Server Components fetch data → pass to Client Components as props
- All interactive components use `'use client'` directive
- EditableContent pattern: teacher sees EditableText, student sees saved DB value
- storageKey pattern: unique string keys for DB lookups (e.g., "quiz:pre-test", "disc:general")
- Auth: no session cookies — state lives in React context (now persisted to localStorage)
- External token exchange via AI_HUB_SERVER_HOST for iframe embedding
