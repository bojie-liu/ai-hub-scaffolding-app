# Composed Claude Code Configuration

This configuration combines: Next.js 16, shadcn/ui 2025, Drizzle ORM v0.44.6+, Tailwind CSS v4.0

---

## Project Context

*Combined from: Next.js 16, shadcn/ui 2025, Drizzle ORM v0.44.6+, Tailwind CSS v4.0*

This is a comprehensive project that combines multiple technologies:

This is a Next.js 16 application using:

- **App Router** (not Pages Router)
- **React 19.2** with Server Components by default
- **TypeScript 5.1+** for type safety
- **Tailwind CSS** for styling (if configured)
- **Server Actions** for mutations
- **Turbopack** (stable - now default bundler)
- **Cache Components** with "use cache" directive
- **React Compiler** (stable support)

This is a shadcn/ui project focused on:

- **Component-first development** with copy-paste architecture
- **Radix UI primitives** for behavior and accessibility
- **Tailwind CSS** for utility-first styling
- **TypeScript** for type-safe component APIs
- **React 19.2** with modern patterns (Server Components when applicable)
- **Accessibility-first** design with full keyboard and screen reader support

This project uses **Drizzle ORM v0.44.6+** for type-safe database operations with:

- **TypeScript-first** approach with full type inference
- **SQL-like syntax** that's familiar and powerful
- **Multiple database support** - PostgreSQL 17+, MySQL 8+, SQLite
- **Identity columns** preferred over serial types (PostgreSQL)
- **Enhanced migrations** with DDL improvements
- **Gel dialect support** for PostgreSQL-compatible databases
- **Performance optimized** with prepared statements
- **Edge runtime compatible** - Works with serverless

This project uses **Tailwind CSS v4.0** for styling with:

- **Zero configuration** - no tailwind.config.js needed by default
- **CSS-first configuration** with `@theme` and `@plugin` directives
- **High-performance engine** - 5x faster builds, 100x faster incremental builds
- **Utility-first approach** for rapid development
- **Responsive design** with mobile-first methodology
- **CSS variables and OKLCH** for enhanced design system control
- **Component patterns** for reusable UI elements
- **Dark mode support** with advanced theming
- **Modern plugin ecosystem** with v4-compatible plugins

## Security Best Practices

*Combined from: Next.js 16, shadcn/ui 2025*

1. **Always validate Server Actions input** with Zod or similar
2. **Authenticate and authorize** in Server Actions and middleware
3. **Sanitize user input** before rendering
4. **Use environment variables correctly**:
   - `NEXT_PUBLIC_*` for client-side
   - Others stay server-side only
5. **Implement rate limiting** for public actions
6. **Configure CSP headers** in next.config.js
7. **Sanitize user input** in dynamic content
8. **Validate form data** with Zod schemas
9. **Use TypeScript** for type safety
10. **Escape HTML** in user-generated content
11. **Implement CSP** headers when applicable

## Performance Optimization

*Combined from: Next.js 16, shadcn/ui 2025, Drizzle ORM v0.44.6+, Tailwind CSS v4.0*

1. **Use Server Components** to reduce bundle size
2. **Implement streaming** with Suspense boundaries
3. **Optimize images** with next/image component
4. **Use dynamic imports** for code splitting
5. **Configure proper caching** strategies
6. **Enable Partial Prerendering** (experimental) when stable
7. **Monitor Core Web Vitals**

## Common Commands

*Combined from: Next.js 16, shadcn/ui 2025, Drizzle ORM v0.44.6+*

```bash

## ⚠️ Breaking Changes from Next.js 15

1. **Node.js 20.9.0+ Required**: Node.js 18 no longer supported

   ```typescript
   // ❌ OLD (Next.js 14)
   export default function Page({ params, searchParams }) {
     const id = params.id;
   }
   
   // ✅ NEW (Next.js 15)
   export default async function Page({ params, searchParams }) {
     const { id } = await params;
     const { query } = await searchParams;
   }
   
   // Server Actions and API Routes
   import { cookies, headers } from 'next/headers';
   
   export async function GET() {
     const cookieStore = await cookies();
     const headersList = await headers();
     
     const token = cookieStore.get('auth');
     const userAgent = headersList.get('user-agent');
   }
   ```

2. **Proxy Middleware Rename**: `middleware.ts` → `proxy.ts`
   ```typescript
   // ❌ OLD
   // middleware.ts
   export function middleware(request) { ... }

   // ✅ NEW
   // proxy.ts
   export function proxy(request) { ... }
   ```

3. **React 19.2 Required**: Minimum React version is 19.2.0
   - Update package.json: `"react": "19.2.0"`
   - Update React types: `"@types/react": "^19.2.0"`

4. **TypeScript 5.1+ Required**: Enhanced strict checking
   - Update tsconfig.json for new TypeScript features
   - Better const type parameter inference

5. **Cache Components with "use cache"**: New caching directive
   ```typescript
   // ✅ NEW: Cache entire component
   'use cache';
   async function ExpensiveComponent() {
     const data = await heavyComputation();
     return <div>{data}</div>;
   }

   // ✅ NEW: Cache specific functions
   import { cache } from 'react';
   const getData = cache(async () => {
     'use cache';
     return await fetch('/api/data');
   });
   ```

6. **React Compiler Auto-optimization**: Automatic memoization
   ```typescript
   // ✅ Automatically optimized by React Compiler
   function Component({ items }) {
     const expensiveValue = items.map(item => process(item));
     return <List items={expensiveValue} />;
   }
   ```

## 2. File Conventions

Always use these file names in the `app/` directory:

- `page.tsx` - Route page component
- `layout.tsx` - Shared layout wrapper
- `loading.tsx` - Loading UI (Suspense fallback)
- `error.tsx` - Error boundary (must be Client Component)
- `not-found.tsx` - 404 page
- `route.ts` - API route handler
- `template.tsx` - Re-rendered layout
- `default.tsx` - Parallel route fallback

## 3. Data Fetching Patterns

```typescript
// ✅ GOOD: Fetch in Server Component
async function ProductList() {
  const products = await db.products.findMany();
  return <div>{/* render products */}</div>;
}

// ❌ AVOID: Client-side fetching when not needed
'use client';
function BadPattern() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch('/api/data')... }, []);
}
```

## 3. Installation Patterns

```bash

## 3. Animation Performance

```tsx
// Use CSS transforms for animations
className="transition-transform hover:scale-105"

// Avoid layout shifts
className="transform-gpu"
```

## Tailwind v4 Performance Features

**Built-in Optimizations:**
- **High-performance engine**: Up to 5x faster full builds
- **Incremental builds**: Over 100x faster incremental rebuilds
- **Automatic optimization**: No manual purging configuration needed
- **Smart content detection**: Automatically finds and processes template files

**CLI Installation:**
```bash

## Query Testing

*Combined from: Next.js 16, shadcn/ui 2025, Drizzle ORM v0.44.6+*

- **Unit tests**: Jest/Vitest for logic and utilities
- **Component tests**: React Testing Library
- **E2E tests**: Playwright or Cypress
- **Server Components**: Test data fetching logic separately
- **Server Actions**: Mock and test validation/business logic
npm run test
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
test('button click', async () => {
  const user = userEvent.setup()
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  await user.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```
import { axe } from 'jest-axe'
test('no accessibility violations', async () => {
  const { container } = render(<Card>Content</Card>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```
```typescript
// tests/queries.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from './setup';
import { users } from '@/schema/users';
import { createUser, getUserByEmail } from '@/lib/queries/users';
describe('User Queries', () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => {
    db = createTestDb();
  });
  it('should create and retrieve user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
    };
    const user = await createUser(userData);
    expect(user.email).toBe(userData.email);
    const retrievedUser = await getUserByEmail(userData.email);
    expect(retrievedUser).toEqual(user);
  });
});
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Build succeeds locally
- [ ] Tests pass
- [ ] Security headers configured
- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured
- [ ] SEO metadata in place
- [ ] Performance monitoring active

## Debugging Tips

1. **Check Radix UI data attributes** for component state
2. **Use React DevTools** to inspect component props
3. **Verify Tailwind classes** are being applied
4. **Check CSS variable values** in browser DevTools
5. **Test keyboard navigation** manually
6. **Validate ARIA attributes** with accessibility tools

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)
- [Headless UI](https://headlessui.com)
- [Heroicons](https://heroicons.com)
- [Tailwind Play](https://play.tailwindcss.com)
- [Tailwind Community](https://github.com/tailwindlabs/tailwindcss/discussions)

Remember: **Utility-first, mobile-first, performance-first. Embrace constraints, compose with utilities, and maintain consistency!**

# shadcn/ui Development Assistant

*Combined from: Next.js 16, shadcn/ui 2025, Drizzle ORM v0.44.6+, Tailwind CSS v4.0*

You are an expert Next.js 16 developer with deep knowledge of the App Router, React Server Components, and modern web development best practices.
You are an expert shadcn/ui developer with deep knowledge of React component architecture, Tailwind CSS, Radix UI primitives, and modern web accessibility standards. You specialize in building beautiful, accessible, and performant UI components following shadcn/ui patterns and conventions.
You are an expert in Drizzle ORM with deep knowledge of schema management, migrations, type safety, and modern database development patterns.
You are an expert in Tailwind CSS v4.0 with deep knowledge of utility-first styling, responsive design, component patterns, the new CSS-first configuration system, and modern CSS architecture.

## 🚀 Major New Features in Next.js 16

1. **Turbopack is Stable**: Now the default bundler with 5-10x faster Fast Refresh and 2-5x faster builds
2. **Cache Components**: New caching system with "use cache" directive for pages, components, and functions
3. **React Compiler Support**: Built-in support for automatic memoization
4. **Proxy Middleware**: `middleware.ts` → `proxy.ts` with explicit network boundaries
5. **React 19.2 Features**: View Transitions, useEffectEvent, Activity Component

## 1. Server Components First

- **Default to Server Components** - Only use Client Components when you need interactivity
- **Data fetching on the server** - Direct database access, no API routes needed for SSR
- **Zero client-side JavaScript** for static content
- **Async components** are supported and encouraged

## 4. Caching Strategy

- Use `fetch()` with Next.js extensions for HTTP caching
- Configure with `{ next: { revalidate: 3600, tags: ['products'] } }`
- Use `revalidatePath()` and `revalidateTag()` for on-demand updates
- Consider `unstable_cache()` for expensive computations

## Development

*Combined from: Next.js 16, shadcn/ui 2025*

```bash
npm run dev          # Start dev server (Turbopack by default)
npm run dev:webpack  # Start with Webpack (legacy)
npm run build        # Production build with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

## Code Generation

```bash
npx create-next-app@latest  # Create new app (Next.js 16)
npx @next/codemod@latest upgrade  # Automated upgrade to Next.js 16
```

## Project Structure

```text
app/
├── (auth)/          # Route group (doesn't affect URL)
├── api/             # API routes
│   └── route.ts     # Handler for /api
├── products/
│   ├── [id]/        # Dynamic route
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   └── page.tsx
├── layout.tsx       # Root layout
├── page.tsx         # Home page
└── globals.css      # Global styles
```

## Server Action with Form

```typescript
// actions.ts
'use server';
export async function createItem(prevState: any, formData: FormData) {
  // Validate, mutate, revalidate
  const validated = schema.parse(Object.fromEntries(formData));
  await db.items.create({ data: validated });
  revalidatePath('/items');
}

// form.tsx
'use client';
import { useActionState } from 'react';
export function Form() {
  const [state, formAction] = useActionState(createItem, {});
  return <form action={formAction}>...</form>;
}
```

## Optimistic Updates

```typescript
'use client';
import { useOptimistic } from 'react';
export function OptimisticList({ items, addItem }) {
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (state, newItem) => [...state, newItem]
  );
  // Use optimisticItems for immediate UI update
}
```

## Memory Integration

This CLAUDE.md file follows official Claude Code memory management patterns:

- **Project memory** - Shared with team via source control
- **Hierarchical loading** - Builds upon user and enterprise memory
- **Import support** - Can reference additional files with @path/to/file
- **Auto-discovery** - Loaded when Claude reads files in this subtree

## Available Commands

*Combined from: shadcn/ui 2025, Drizzle ORM v0.44.6+, Tailwind CSS v4.0*

Project-specific slash commands for shadcn/ui development:
- `/shadcn-add [component]` - Add shadcn/ui component to project
- `/shadcn-theme [variant]` - Update theme configuration
- `/shadcn-custom [name]` - Create custom component following patterns
- `/shadcn-compose [components]` - Compose complex component from primitives
- `/shadcn-test [component]` - Generate accessibility and unit tests
Use these project-specific slash commands:
- `/drizzle-schema [table-name]` - Generate type-safe schema
- `/drizzle-migrate [action]` - Handle migrations  
- `/drizzle-query [type]` - Create optimized queries
- `/drizzle-seed [table]` - Generate seed data
Project-specific slash commands for Tailwind development:
- `/tw-component [name]` - Generate component with utility classes
- `/tw-responsive [breakpoints]` - Create responsive design patterns
- `/tw-theme [section]` - Update tailwind.config.js theme
- `/tw-plugin [name]` - Add and configure Tailwind plugin
- `/tw-optimize` - Analyze and optimize CSS bundle size

## Major Enhancements

- **Tailwind v4 compatibility** with CSS-first configuration
- **React 19 support** with updated forwardRef patterns
- **Enhanced CLI** with diff command and improved add functionality
- **Calendar upgrade** to latest React DayPicker with 30+ blocks
- **OKLCH color system** replacing HSL for better color consistency
- **New-york style as default** (replacing deprecated default style)
- **Sonner integration** (toast component deprecation in favor of sonner)

## Core Technologies

- **React 19.2** - Component framework with enhanced performance
- **TypeScript 5.1+** - Type-safe development
- **Tailwind CSS v4.0** - CSS-first configuration, OKLCH colors
- **Radix UI** - Unstyled, accessible primitives with data-slot attributes
- **Class Variance Authority (CVA)** - Component variants
- **tailwind-merge** - Intelligent class merging
- **clsx** - Conditional classes
- **Lucide React** - Icon system

## Framework Support

- **Next.js 16** (App Router with Turbopack)
- **Next.js 15.3** with Tailwind v4 upgraded components
- **Vite** with React
- **Remix** with React Router
- **Astro** with React integration
- **Laravel** with Inertia.js
- **TanStack Router/Start**
- **React Router**
- **Nuxt v4** (for shadcn-vue variant)

## 1. Copy-Paste Architecture

- **No npm package** - Components are copied into your project
- **Full ownership** - The code is yours to modify
- **Direct customization** - Edit components directly
- **No abstraction layers** - See exactly what's happening

## 2. Component Anatomy

Every component follows this structure:

```tsx
// React 19 updated component pattern with data-slot attributes
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        data-slot="component" // New in Tailwind v4 for styling
        {...props}
      />
    )
  }
)
Component.displayName = "Component"

// Sub-components with data-slot attributes for Tailwind v4
const ComponentTrigger = React.forwardRef<...>(
  ({ className, ...props }, ref) => (
    <Trigger
      ref={ref}
      className={cn("...", className)}
      data-slot="trigger"
      {...props}
    />
  )
)

const ComponentContent = React.forwardRef<...>(
  ({ className, ...props }, ref) => (
    <Content
      ref={ref}
      className={cn("...", className)}
      data-slot="content"
      {...props}
    />
  )
)

// Export all parts
export { Component, ComponentTrigger, ComponentContent, ComponentItem }
```

# CLI installation (recommended) - 2025 enhanced CLI

npx shadcn@latest init

# Initialize with Tailwind v4 support

npx shadcn@latest init --tailwind-v4

# Add components (enhanced add command)

npx shadcn@latest add [component]

# Add multiple components with dependencies auto-resolved

npx shadcn@latest add button card form dialog

# New diff command to track upstream changes

npx shadcn@latest diff

# Check what has changed upstream

npx shadcn@latest diff button

# 3. Update imports

```

## 4. File Structure

```text
components/
└── ui/
    ├── accordion.tsx
    ├── alert-dialog.tsx
    ├── alert.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── form.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    └── ...
lib/
└── utils.ts        # cn() helper function
```

## 1. Variant System with CVA

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## 2. Polymorphic Components with asChild

```tsx
import { Slot } from "@radix-ui/react-slot"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp ref={ref} className={cn(...)} {...props} />
  }
)
```

## 3. Controlled/Uncontrolled Pattern

```tsx
// Controlled
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>...</SelectTrigger>
  <SelectContent>...</SelectContent>
</Select>

// Uncontrolled
<Select defaultValue="apple">
  <SelectTrigger>...</SelectTrigger>
  <SelectContent>...</SelectContent>
</Select>
```

## 4. Form Integration with React Hook Form

```tsx
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="email@example.com" {...field} />
        </FormControl>
        <FormDescription>
          Enter your email address
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

## OKLCH CSS Variables Structure (2025 Update)

```css
/* Tailwind v4 compatible theme with OKLCH colors */
@import "tailwindcss";

@theme {
  /* OKLCH Color System - Better color consistency */
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(9% 0 0);
  --color-card: oklch(100% 0 0);
  --color-card-foreground: oklch(9% 0 0);
  --color-popover: oklch(100% 0 0);
  --color-popover-foreground: oklch(9% 0 0);
  --color-primary: oklch(9% 0 0);
  --color-primary-foreground: oklch(98% 0 0);
  --color-secondary: oklch(96% 0 0);
  --color-secondary-foreground: oklch(9% 0 0);
  --color-muted: oklch(96% 0 0);
  --color-muted-foreground: oklch(46% 0 0);
  --color-accent: oklch(96% 0 0);
  --color-accent-foreground: oklch(9% 0 0);
  --color-destructive: oklch(62% 0.25 29);
  --color-destructive-foreground: oklch(98% 0 0);
  --color-border: oklch(91% 0 0);
  --color-input: oklch(91% 0 0);
  --color-ring: oklch(9% 0 0);
  --radius: 0.5rem;

  /* Dark mode with OKLCH */
  @media (prefers-color-scheme: dark) {
    :root {
      --color-background: oklch(9% 0 0);
      --color-foreground: oklch(98% 0 0);
      --color-card: oklch(9% 0 0);
      --color-card-foreground: oklch(98% 0 0);
      --color-popover: oklch(9% 0 0);
      --color-popover-foreground: oklch(98% 0 0);
      --color-primary: oklch(98% 0 0);
      --color-primary-foreground: oklch(9% 0 0);
      --color-secondary: oklch(15% 0 0);
      --color-secondary-foreground: oklch(98% 0 0);
      --color-muted: oklch(15% 0 0);
      --color-muted-foreground: oklch(64% 0 0);
      --color-accent: oklch(15% 0 0);
      --color-accent-foreground: oklch(98% 0 0);
      --color-destructive: oklch(69% 0.22 29);
      --color-destructive-foreground: oklch(98% 0 0);
      --color-border: oklch(15% 0 0);
      --color-input: oklch(15% 0 0);
      --color-ring: oklch(98% 0 0);
    }
  }
}

/* Legacy HSL support for gradual migration */
@layer base {
  :root {
    --background: oklch(var(--color-background));
    --foreground: oklch(var(--color-foreground));
    /* Map OKLCH to HSL variables for backwards compatibility */
  }
}
```

## Color Convention

- Each color has a **base** and **foreground** variant
- Base: Background color
- Foreground: Text color on that background
- Ensures proper contrast automatically

## 1. ARIA Attributes

```tsx
// Proper ARIA labeling
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>
        Description for screen readers
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

## 2. Keyboard Navigation

All components support:
- **Tab/Shift+Tab** - Focus navigation
- **Enter/Space** - Activation
- **Escape** - Close/cancel
- **Arrow keys** - List navigation
- **Home/End** - Boundary navigation

## 3. Focus Management

```tsx
// Visible focus indicators
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

// Focus trap in modals
<FocusTrap>
  <DialogContent>...</DialogContent>
</FocusTrap>
```

## 1. Tables with TanStack Table

```tsx
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})

<Table>
  <TableHeader>
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <TableHead key={header.id}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>
  <TableBody>
    {table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## 2. Charts with Recharts

```tsx
<ChartContainer config={chartConfig}>
  <AreaChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <ChartTooltip />
    <Area
      type="monotone"
      dataKey="value"
      stroke="hsl(var(--chart-1))"
      fill="hsl(var(--chart-1))"
    />
  </AreaChart>
</ChartContainer>
```

# Initialize shadcn/ui (2025 enhanced)

npx shadcn@latest init

# Add components with auto-dependency resolution

npx shadcn@latest add button card dialog form

# Add all components

npx shadcn@latest add --all

# Update components (enhanced in 2025)

npx shadcn@latest add button --overwrite

# New: Track upstream changes

npx shadcn@latest diff

# New: Compare specific component

npx shadcn@latest diff button

# New: View what changed in registry

npx shadcn@latest diff --component=card

# Build custom registry

npx shadcn@latest build
```

## Component Development

```bash

# Development server

npm run dev

# Type checking

npm run type-check

# Linting

npm run lint

# Build

npm run build
```

## 1. Bundle Size

- Only import what you use
- Components are tree-shakeable
- No runtime overhead from library

## 2. Code Splitting

```tsx
// Lazy load heavy components
const HeavyChart = lazy(() => import('@/components/ui/chart'))

<Suspense fallback={<Skeleton />}>
  <HeavyChart />
</Suspense>
```

## Form Controls

- Input, Textarea, Select, Checkbox, RadioGroup, Switch
- Slider, DatePicker, Form, Label

## Overlays

- Dialog, AlertDialog, Sheet, Popover
- DropdownMenu, ContextMenu, Tooltip, HoverCard

## Navigation

- NavigationMenu, Tabs, Breadcrumb
- Pagination, Sidebar

## Data Display

- Table, DataTable, Card, Badge
- Avatar, Chart, Progress

## Layout

- Accordion, Collapsible, ResizablePanels
- ScrollArea, Separator, AspectRatio

## Feedback

- Alert, Toast (Sonner), Skeleton
- Progress, Loading states

## Major Changes

- **Identity columns over serial** for PostgreSQL (recommended pattern)
- **Enhanced DDL generation** with stricter validation
- **New Gel dialect** for PostgreSQL-compatible databases
- **Improved kit behavior** - no more IF NOT EXISTS in DDL
- **Better version compatibility** between ORM and Kit
- **PostgreSQL 17+ support** with latest features

## 1. Schema Definition

- **Define schemas declaratively** using Drizzle's schema builders
- **Use proper types** for each column with validation
- **Establish relationships** with foreign keys and references
- **Index strategically** for query performance
- **Version schemas** with proper migration patterns

## 2. Type Safety

- **Full TypeScript inference** from schema to queries
- **Compile-time validation** of SQL operations
- **IntelliSense support** for table columns and relations
- **Runtime validation** with Drizzle's built-in validators
- **Type-safe joins** and complex queries

## 3. Migration Management

- **Generate migrations** automatically from schema changes
- **Version control migrations** with proper naming
- **Run migrations safely** in development and production
- **Rollback support** for schema changes
- **Seed data management** for consistent environments

## PostgreSQL with Neon

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

## SQLite for Local Development

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const sqlite = new Database('./dev.db');
export const db = drizzle(sqlite);
```

## MySQL with PlanetScale

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

export const db = drizzle(connection);
```

## User Management Schema (2025 Pattern)

```typescript
// schema/users.ts - Using identity columns (recommended)
import { pgTable, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  // ✅ RECOMMENDED: Use identity() instead of serial()
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Legacy pattern (deprecated but still supported)
// import { pgTable, serial } from 'drizzle-orm/pg-core';
// export const usersLegacy = pgTable('users_legacy', {
//   id: serial('id').primaryKey(), // ⚠️ Use identity() instead
// });
```

## Content with Relations (2025 Pattern)

```typescript
// schema/posts.ts - Using identity columns and enhanced relations
import { pgTable, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const posts = pgTable('posts', {
  // ✅ Use identity column for primary key
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  slug: text('slug').notNull().unique(),
  published: boolean('published').default(false),
  // Foreign key with proper cascading
  authorId: integer('author_id').references(() => users.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

## E-commerce Schema

```typescript
// schema/ecommerce.ts
import { pgTable, serial, text, integer, decimal, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').default(0),
  sku: text('sku').notNull().unique(),
  categoryId: integer('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  status: text('status', { enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  productId: integer('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});
```

## Basic CRUD Operations

```typescript
// lib/queries/users.ts
import { db } from '@/lib/db';
import { users } from '@/schema/users';
import { eq, desc, count } from 'drizzle-orm';

// Create user
export async function createUser(userData: NewUser) {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

// Get user by ID
export async function getUserById(id: number) {
  const user = await db.select().from(users).where(eq(users.id, id));
  return user[0];
}

// Get user by email
export async function getUserByEmail(email: string) {
  const user = await db.select().from(users).where(eq(users.email, email));
  return user[0];
}

// Update user
export async function updateUser(id: number, userData: Partial<NewUser>) {
  const [user] = await db
    .update(users)
    .set(userData)
    .where(eq(users.id, id))
    .returning();
  return user;
}

// Delete user
export async function deleteUser(id: number) {
  await db.delete(users).where(eq(users.id, id));
}

// Get paginated users
export async function getPaginatedUsers(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  
  const [userList, totalCount] = await Promise.all([
    db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt)),
    db.select({ count: count() }).from(users),
  ]);
  
  return {
    users: userList,
    total: totalCount[0].count,
    page,
    totalPages: Math.ceil(totalCount[0].count / limit),
  };
}
```

## Complex Relations

```typescript
// lib/queries/posts.ts
import { db } from '@/lib/db';
import { posts, users } from '@/schema';
import { eq, desc, and, ilike } from 'drizzle-orm';

// Get posts with authors
export async function getPostsWithAuthors() {
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      published: posts.published,
      createdAt: posts.createdAt,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));
}

// Search posts
export async function searchPosts(query: string) {
  return await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.published, true),
        ilike(posts.title, `%${query}%`)
      )
    )
    .orderBy(desc(posts.createdAt));
}

// Get user's posts
export async function getUserPosts(userId: number) {
  return await db
    .select()
    .from(posts)
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt));
}
```

## Advanced Queries

```typescript
// lib/queries/analytics.ts
import { db } from '@/lib/db';
import { orders, orderItems, products, users } from '@/schema';
import { sum, count, avg, desc, gte } from 'drizzle-orm';

// Sales analytics
export async function getSalesAnalytics(startDate: Date, endDate: Date) {
  return await db
    .select({
      totalRevenue: sum(orders.total),
      totalOrders: count(orders.id),
      averageOrderValue: avg(orders.total),
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      )
    );
}

// Top selling products
export async function getTopSellingProducts(limit = 10) {
  return await db
    .select({
      productId: products.id,
      productName: products.name,
      totalSold: sum(orderItems.quantity),
      revenue: sum(orderItems.price),
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .groupBy(products.id, products.name)
    .orderBy(desc(sum(orderItems.quantity)))
    .limit(limit);
}
```

## Drizzle Config (2025 Version)

```typescript
// drizzle.config.ts - Compatible with Kit v0.31.5+
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema/*',
  out: './drizzle',
  dialect: 'postgresql', // Updated from 'driver: pg'
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Updated from connectionString
  },
  verbose: true,
  strict: true,
  // New options in 2025
  migrations: {
    table: '_drizzle_migrations',
    schema: 'public',
  },
  // Enhanced introspection options
  introspect: {
    casing: 'camelCase',
  },
} satisfies Config;

// Alternative: For Gel dialect (PostgreSQL-compatible)
export const gelConfig = {
  schema: './src/schema/*',
  out: './drizzle',
  dialect: 'gel', // New Gel dialect
  dbCredentials: {
    url: process.env.GEL_DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

# Generate migration (new syntax)

npx drizzle-kit generate

# Push schema changes to database

npx drizzle-kit push

# Introspect existing database

npx drizzle-kit introspect

# Check migration status

npx drizzle-kit check

# Studio (database browser) - Enhanced UI

npx drizzle-kit studio

# New in 2025: Migration checking and validation

npx drizzle-kit validate

# npx drizzle-kit push:pg      # ⚠️ Deprecated

```

## Migration Scripts

```typescript
// scripts/migrate.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function runMigrations() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Migrations completed!');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});
```

## Seed Data

```typescript
// scripts/seed.ts
import { db } from '@/lib/db';
import { users, posts, categories } from '@/schema';

async function seedDatabase() {
  console.log('Seeding database...');
  
  // Create users
  const userIds = await db.insert(users).values([
    { email: 'admin@example.com', name: 'Admin User' },
    { email: 'user@example.com', name: 'Regular User' },
  ]).returning({ id: users.id });
  
  // Create categories
  const categoryIds = await db.insert(categories).values([
    { name: 'Technology', slug: 'technology' },
    { name: 'Design', slug: 'design' },
  ]).returning({ id: categories.id });
  
  // Create posts
  await db.insert(posts).values([
    {
      title: 'Getting Started with Drizzle',
      content: 'Learn how to use Drizzle ORM...',
      slug: 'getting-started-drizzle',
      authorId: userIds[0].id,
      published: true,
    },
    {
      title: 'Database Design Best Practices',
      content: 'Tips for designing scalable databases...',
      slug: 'database-design-best-practices',
      authorId: userIds[1].id,
      published: true,
    },
  ]);
  
  console.log('Seeding completed!');
}

seedDatabase().catch(console.error);
```

## Prepared Statements

```typescript
// lib/prepared-statements.ts
import { db } from '@/lib/db';
import { users } from '@/schema/users';
import { eq } from 'drizzle-orm';

// Prepare frequently used queries
export const getUserByIdPrepared = db
  .select()
  .from(users)
  .where(eq(users.id, placeholder('id')))
  .prepare();

export const getUserByEmailPrepared = db
  .select()
  .from(users)
  .where(eq(users.email, placeholder('email')))
  .prepare();

// Usage
const user = await getUserByIdPrepared.execute({ id: 123 });
```

## Indexes and Constraints

```typescript
// schema/optimized.ts
import { pgTable, serial, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').notNull(),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Create indexes for better query performance
  slugIdx: uniqueIndex('posts_slug_idx').on(table.slug),
  authorIdx: index('posts_author_idx').on(table.authorId),
  publishedIdx: index('posts_published_idx').on(table.published),
  createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
}));
```

## Connection Pooling

```typescript
// lib/db-pool.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(poolConnection);
```

## Test Database Setup

```typescript
// tests/setup.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export function createTestDb() {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite);
  
  // Run migrations
  migrate(db, { migrationsFolder: 'drizzle' });
  
  return db;
}
```

## Environment Configuration

```env

# Database URLs for different environments

DATABASE_URL=postgresql://username:password@localhost:5432/myapp_development
DATABASE_URL_TEST=postgresql://username:password@localhost:5432/myapp_test
DATABASE_URL_PRODUCTION=postgresql://username:password@host:5432/myapp_production

# For Neon (serverless PostgreSQL)

DATABASE_URL=postgresql://username:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb?sslmode=require

# For PlanetScale (serverless MySQL)

DATABASE_URL=mysql://username:password@host.connect.psdb.cloud/database?sslmode=require

# For local SQLite

DATABASE_URL=file:./dev.db
```

## Repository Pattern

```typescript
// lib/repositories/user-repository.ts
import { db } from '@/lib/db';
import { users, User, NewUser } from '@/schema/users';
import { eq } from 'drizzle-orm';

export class UserRepository {
  async create(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async findById(id: number): Promise<User | undefined> {
    const user = await db.select().from(users).where(eq(users.id, id));
    return user[0];
  }
  
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await db.select().from(users).where(eq(users.email, email));
    return user[0];
  }
  
  async update(id: number, userData: Partial<NewUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async delete(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

export const userRepository = new UserRepository();
```

## Transaction Handling

```typescript
// lib/services/order-service.ts
import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/schema';
import { eq, sql } from 'drizzle-orm';

export async function createOrderWithItems(
  orderData: NewOrder,
  items: Array<{ productId: number; quantity: number }>
) {
  return await db.transaction(async (tx) => {
    // Create order
    const [order] = await tx.insert(orders).values(orderData).returning();
    
    // Create order items and update product stock
    for (const item of items) {
      // Get product price
      const product = await tx
        .select({ price: products.price, stock: products.stock })
        .from(products)
        .where(eq(products.id, item.productId));
      
      if (product[0].stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
      
      // Create order item
      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product[0].price,
      });
      
      // Update product stock
      await tx
        .update(products)
        .set({
          stock: sql`${products.stock} - ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));
    }
    
    return order;
  });
}
```

## CSS-First Configuration (Recommended)

- **No tailwind.config.js by default** - configure directly in CSS
- **@theme directive** for custom design tokens
- **@plugin directive** for importing plugins
- **@config directive** for optional JavaScript config files
- **Automatic installation** with one line of CSS

## 1. Utility-First Methodology

- **Use utility classes** for styling instead of custom CSS
- **Compose complex components** from simple utilities
- **Maintain consistency** with predefined design tokens
- **Optimize for performance** with automatic CSS purging
- **Embrace constraints** of the design system

## 2. Responsive Design

- **Mobile-first approach** with `sm:`, `md:`, `lg:`, `xl:`, `2xl:` breakpoints
- **Consistent breakpoint usage** across the application
- **Responsive typography** and spacing
- **Flexible grid systems** with CSS Grid and Flexbox
- **Responsive images** and media handling

## 3. Design System Integration

- **Custom color palettes** defined in configuration
- **Consistent spacing scale** using rem units
- **Typography hierarchy** with font sizes and line heights
- **Shadow and border radius** system for depth
- **Animation and transition** utilities for micro-interactions

## Tailwind v4 Installation & Setup

```css
/* styles.css - Zero configuration approach */
@import "tailwindcss";
```

```css
/* styles.css - With custom theme */
@import "tailwindcss";

@theme {
  --color-brand-50: oklch(97% 0.01 250);
  --color-brand-100: oklch(93% 0.05 250);
  --color-brand-500: oklch(50% 0.15 250);
  --color-brand-900: oklch(20% 0.1 250);

  --font-family-display: "Inter", system-ui, sans-serif;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
}
```

## Legacy JavaScript Config (Optional)

```javascript
/* tailwind.config.js - Only if needed for complex configuration */
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'oklch(97% 0.01 250)',
          500: 'oklch(50% 0.15 250)',
          900: 'oklch(20% 0.1 250)',
        }
      }
    },
  },
  plugins: [],
}
```

```css
/* Reference JavaScript config in CSS */
@import "tailwindcss";
@config "tailwind.config.js";
```

## Tailwind v4 CSS-First Design System

```css
/* styles.css - Modern v4 approach */
@import "tailwindcss";

@theme {
  /* OKLCH Color System (better than HSL) */
  --color-brand-50: oklch(97% 0.01 250);
  --color-brand-100: oklch(93% 0.05 250);
  --color-brand-200: oklch(87% 0.08 250);
  --color-brand-300: oklch(78% 0.12 250);
  --color-brand-400: oklch(68% 0.15 250);
  --color-brand-500: oklch(50% 0.18 250);
  --color-brand-600: oklch(42% 0.15 250);
  --color-brand-700: oklch(35% 0.12 250);
  --color-brand-800: oklch(28% 0.08 250);
  --color-brand-900: oklch(20% 0.05 250);
  --color-brand-950: oklch(13% 0.02 250);

  /* Enhanced Gray Scale */
  --color-gray-50: oklch(99% 0 0);
  --color-gray-100: oklch(97% 0 0);
  --color-gray-200: oklch(93% 0 0);
  --color-gray-300: oklch(85% 0 0);
  --color-gray-400: oklch(70% 0 0);
  --color-gray-500: oklch(55% 0 0);
  --color-gray-600: oklch(45% 0 0);
  --color-gray-700: oklch(35% 0 0);
  --color-gray-800: oklch(25% 0 0);
  --color-gray-900: oklch(15% 0 0);
  --color-gray-950: oklch(8% 0 0);

  /* Typography System */
  --font-family-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --font-family-mono: "JetBrains Mono Variable", ui-monospace, monospace;
  --font-family-display: "Cal Sans", ui-sans-serif, system-ui, sans-serif;

  /* Enhanced Spacing */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;

  /* Animation System */
  --animate-fade-in: fade-in 0.5s ease-in-out;
  --animate-slide-up: slide-up 0.3s ease-out;
  --animate-bounce-gentle: bounce-gentle 2s infinite;

  /* Animation Keyframes */
  --keyframes-fade-in: {
    from { opacity: 0; }
    to { opacity: 1; }
  };

  --keyframes-slide-up: {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  };

  --keyframes-bounce-gentle: {
    0%, 100% { transform: translateY(-5%); }
    50% { transform: translateY(0); }
  };
}

/* Import v4-compatible plugins */
@plugin "tailwindcss/typography";
@plugin "@tailwindcss/forms";
@plugin "@tailwindcss/container-queries";
```

## Advanced Configuration with CSS Variables

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}
```

## Layout Components

```jsx
// Responsive Container
function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

// Responsive Grid
function Grid({ children, cols = 1, className = "" }) {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={`grid gap-6 ${colsMap[cols]} ${className}`}>
      {children}
    </div>
  );
}

// Responsive Stack
function Stack({ children, spacing = 'md', className = "" }) {
  const spacingMap = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  };
  
  return (
    <div className={`flex flex-col ${spacingMap[spacing]} ${className}`}>
      {children}
    </div>
  );
}
```

## Interactive Components

```jsx
// Animated Button
function Button({ children, variant = 'primary', size = 'md', className = "", ...props }) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-500',
    ghost: 'hover:bg-gray-100 focus-visible:ring-gray-500',
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-11 px-6 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Card Component
function Card({ children, className = "", hover = false }) {
  return (
    <div className={`
      rounded-lg border border-gray-200 bg-white p-6 shadow-sm
      ${hover ? 'transition-shadow hover:shadow-md' : ''}
      dark:border-gray-800 dark:bg-gray-900
      ${className}
    `}>
      {children}
    </div>
  );
}
```

## Form Components

```jsx
// Input Field
function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`
          block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          placeholder-gray-400 shadow-sm transition-colors
          focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
          dark:border-gray-600 dark:bg-gray-800 dark:text-white
          dark:placeholder-gray-500 dark:focus:border-brand-400
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

// Select Field
function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        className={`
          block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          shadow-sm transition-colors focus:border-brand-500 focus:outline-none
          focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed
          disabled:bg-gray-50 disabled:text-gray-500
          dark:border-gray-600 dark:bg-gray-800 dark:text-white
          dark:focus:border-brand-400
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
```

## Mobile-First Approach

```jsx
// Responsive Navigation
function Navigation() {
  return (
    <nav className="
      flex flex-col space-y-4
      md:flex-row md:items-center md:space-x-6 md:space-y-0
    ">
      <a href="/" className="
        text-gray-700 hover:text-brand-600
        md:text-sm
        lg:text-base
      ">
        Home
      </a>
      <a href="/about" className="
        text-gray-700 hover:text-brand-600
        md:text-sm
        lg:text-base
      ">
        About
      </a>
    </nav>
  );
}

// Responsive Hero Section
function Hero() {
  return (
    <section className="
      px-4 py-12 text-center
      sm:px-6 sm:py-16
      md:py-20
      lg:px-8 lg:py-24
      xl:py-32
    ">
      <h1 className="
        text-3xl font-bold tracking-tight text-gray-900
        sm:text-4xl
        md:text-5xl
        lg:text-6xl
        xl:text-7xl
      ">
        Welcome to Our Site
      </h1>
      <p className="
        mt-4 text-lg text-gray-600
        sm:mt-6 sm:text-xl
        lg:mt-8 lg:text-2xl
      ">
        Building amazing experiences with Tailwind CSS
      </p>
    </section>
  );
}
```

## Container Queries

```jsx
// Using container queries for component-level responsiveness
function ProductCard() {
  return (
    <div className="@container">
      <div className="
        flex flex-col space-y-4
        @md:flex-row @md:space-x-4 @md:space-y-0
        @lg:space-x-6
      ">
        <img className="
          h-48 w-full object-cover
          @md:h-32 @md:w-32
          @lg:h-40 @lg:w-40
        " />
        <div className="flex-1">
          <h3 className="
            text-lg font-semibold
            @lg:text-xl
          ">
            Product Name
          </h3>
        </div>
      </div>
    </div>
  );
}
```

## CSS Variables Approach

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
  }
}
```

## Theme Toggle Component

```jsx
// Theme toggle with smooth transitions
function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  
  return (
    <button
      onClick={toggleTheme}
      className="
        rounded-lg p-2 transition-colors duration-200
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:outline-none focus:ring-2 focus:ring-brand-500
      "
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <MoonIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <SunIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
}
```

# Install the new CLI package

npm install -g @tailwindcss/cli@next

# Initialize project (creates minimal setup)

tailwindcss init

# Build with watch mode

tailwindcss --input src/styles.css --output dist/styles.css --watch
```

**Content Detection (Auto-configured):**
```css
/* styles.css - Content detection is automatic */
@import "tailwindcss";

/* Manual content specification (optional) */
@source "src/**/*.{js,ts,jsx,tsx}";
@source "components/**/*.{js,ts,jsx,tsx}";
```

## Custom Utilities

```css
/* Custom utilities for common patterns */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .animation-delay-200 {
    animation-delay: 200ms;
  }
  
  .animation-delay-400 {
    animation-delay: 400ms;
  }
  
  .mask-gradient-to-r {
    mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
  }
}
```

## Component Layer

```css
@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50;
  }
  
  .btn-primary {
    @apply bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500;
  }
  
  .card {
    @apply rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900;
  }
  
  .input {
    @apply block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white;
  }
}
```

## Custom Animations

```javascript
// Advanced animations in Tailwind config
module.exports = {
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-x': 'bounceX 1s infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        bounceX: {
          '0%, 100%': { transform: 'translateX(-25%)' },
          '50%': { transform: 'translateX(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
}
```

## Staggered Animations

```jsx
// Staggered animation component
function StaggeredList({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`
            animate-fade-in-up opacity-0
            animation-delay-${index * 100}
          `}
          style={{ animationFillMode: 'forwards' }}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

## Truncated Text

```jsx
// Text truncation with tooltips
function TruncatedText({ text, maxLength = 100 }) {
  const truncated = text.length > maxLength;
  const displayText = truncated ? `${text.slice(0, maxLength)}...` : text;
  
  return (
    <span 
      className={`${truncated ? 'cursor-help' : ''}`}
      title={truncated ? text : undefined}
    >
      {displayText}
    </span>
  );
}

// CSS-only truncation
function CSSLimTruncate() {
  return (
    <p className="truncate">This text will be truncated if it's too long</p>
    // Or for multiple lines:
    <p className="line-clamp-3">
      This text will be clamped to 3 lines and show ellipsis
    </p>
  );
}
```

## Aspect Ratio Containers

```jsx
// Responsive aspect ratio containers
function AspectRatioImage({ src, alt, ratio = 'aspect-video' }) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${ratio}`}>
      <img 
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

// Custom aspect ratios
function CustomAspectRatio() {
  return (
    <div className="aspect-[4/3]">
      {/* Content with 4:3 aspect ratio */}
    </div>
  );
}
```

## Focus Management

```jsx
// Accessible focus styles
function FocusExample() {
  return (
    <div className="space-y-4">
      <button className="
        rounded-md bg-brand-600 px-4 py-2 text-white
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
        focus-visible:ring-2 focus-visible:ring-brand-500
      ">
        Accessible Button
      </button>
      
      <input className="
        rounded-md border border-gray-300 px-3 py-2
        focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500
        invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500
      " />
    </div>
  );
}
```

## Typography Plugin

```javascript
// @tailwindcss/typography configuration
module.exports = {
  plugins: [
    require('@tailwindcss/typography')({
      className: 'prose',
    }),
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: '500',
            },
            'a:hover': {
              color: '#0ea5e9',
            },
          },
        },
      },
    },
  },
}
```

## Forms Plugin

```javascript
// @tailwindcss/forms configuration
module.exports = {
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // or 'base'
    }),
  ],
}
```


---

## Configuration Metadata

### Included Configurations

- **Next.js 16** v16.0.0: Next.js 16 with Turbopack, Cache Components, React 19.2, and React Compiler
- **shadcn/ui 2025** v2.0.0: Beautiful, accessible components with Radix UI, Tailwind v4, React 19, and enhanced CLI
- **Drizzle ORM v0.44.6+** v0.44.6: Type-safe database operations with identity columns, PostgreSQL 17, and enhanced DDL
- **Tailwind CSS v4.0** v4.0.0: Utility-first CSS framework with CSS-first configuration, OKLCH colors, and high-performance engine

### Dependencies

#### Required Engines

- **node**: >=20.9.0, >=18.0.0

#### Peer Dependencies

These packages should be installed in your project:

- **next**: >=16.0.0
- **react**: >=19.2.0 or >=19.0.0
- **react-dom**: >=19.2.0 or >=19.0.0
- **typescript**: >=5.1.0 or >=5.0.0
- **tailwindcss**: >=4.0.0
- **drizzle-orm**: >=0.44.6
- **drizzle-kit**: >=0.31.5
- **@tailwindcss/cli**: >=4.0.0
- **postcss**: >=8.0.0
- **autoprefixer**: >=10.0.0


### Generation Details

- Generated: 2026-01-28T08:18:08.899Z
- Generator: Claude Config Composer v1.0.0

### Compatibility Notes

This is a composed configuration. Some features may require additional setup or conflict resolution.
Review the combined configuration carefully and adjust as needed for your specific project.