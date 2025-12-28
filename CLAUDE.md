# Claude Context - AVL Film Website

> **Audience:** AI assistants (primarily Claude). Developer may reference occasionally.
>
> **Purpose:** Code patterns, workflows, and development guidelines for AI-assisted development.

## Project Overview
AVL Film Festival website (avlfilm.com) - Astro + TypeScript + PostgreSQL.

See `README.md` for full documentation.

## Tech Stack
- Astro 5 + TypeScript (strict)
- PostgreSQL (Vercel Postgres) + Drizzle ORM
- Redis (Redis Labs) - Rate limiting for contact reveals
- Vanilla CSS (scoped styles in .astro files)
- Vercel hosting

## Key File Locations
- Database schema: `src/db/schema.ts`
- Shared types: `src/types/` (TypeScript interfaces - single source of truth)
  - `src/types/filmmaker.ts` - Filmmaker interface matching database schema
- Shared utilities: `src/lib/`
  - `src/lib/auth.ts` - Authentication utilities for admin API endpoints
  - `src/lib/api.ts` - Shared API response helpers (errorResponse, successResponse, jsonResponse)
- Base layout: `src/layouts/BaseLayout.astro`
- Migrations: `drizzle/*.sql`
- Admin: `src/pages/admin/index.astro`, `src/pages/admin/filmmakers.astro`
- API routes: `src/pages/api/*.ts`
  - `/api/reveal-contact` - Rate-limited contact reveal endpoint
  - `/api/submit-filmmaker` - New filmmaker submissions
  - `/api/approve-filmmaker` - Update filmmaker records (admin)
  - `/api/banner` - Update site banner (admin, POST only)
- Config: `src/config/roles.ts` (standardized film roles organized by category - SINGLE SOURCE OF TRUTH)
- Components:
  - `src/components/FilmmakerTable.astro` (directory table with filtering)
  - `src/components/FilmmakerModal.astro` (filmmaker details modal with contact reveal)
- Scripts: `src/scripts/import-csv.ts` (CSV import for filmmakers)
- Environment: `.env.local` requires `REDIS_URL` for rate limiting

## Database Workflow
1. Edit `src/db/schema.ts`
2. `npm run db:generate` - create migration
3. Review SQL in `drizzle/XXXX_name.sql`
4. `npm run db:migrate` - run migration
5. Commit schema + migration files

## Common Commands
```bash
npm run dev          # Dev server (localhost:4321)
npm run dev -- --host # Dev server accessible on network
npm run build        # Production build
npm run db:migrate   # Run migrations
npm run db:generate  # Generate migration
npm run db:studio    # Visual DB browser
npm run import:csv   # Import filmmakers from CSV
```

## Code Patterns

### ⚠️ CRITICAL: Research-First Development Protocol

**MANDATORY WORKFLOW - READ THIS FIRST:**

When implementing ANY framework-specific feature, API, or pattern:

1. **🛑 STOP before writing code**
   - Do NOT rely on training data or assumptions
   - Training data may be outdated or reflect old best practices

2. **🔍 Research the current best practice:**
   - Use `WebSearch` to find recent (2024-2025) articles, documentation
   - Use `WebFetch` to read official docs (e.g., docs.astro.build)
   - Look for framework maintainer blog posts
   - Check GitHub issues for community consensus

3. **🚩 Red flags that require research:**
   - TypeScript errors in framework code
   - Needing workarounds (hidden divs, global variables)
   - Something "feels wrong" or overly complex
   - User questions your approach

4. **✅ Validate before implementing:**
   - Does the official documentation recommend this?
   - Is this the pattern used in recent (2024+) examples?
   - Does it support TypeScript without workarounds?
   - Does it preserve bundling/optimization?

**Astro-Specific Checklist:**
- [ ] Is this using the latest Astro pattern? (Check docs.astro.build)
- [ ] Does it support TypeScript without workarounds?
- [ ] Does it preserve bundling/optimization?
- [ ] Is this the pattern shown in recent (2024+) examples?

**Example from this project:**
- ❌ Initial: Used `define:vars` based on training data
- 🚩 Red flag: TypeScript errors, user questioned approach
- 🔍 Research: Found `define:vars` disables TypeScript & bundling (2025 knowledge)
- ✅ Correct: JSON script tag pattern (official best practice)

**When uncertain:** Tell the user: "I should research the current best practice for [X] before implementing. One moment..."

---

### TypeScript Best Practices

**CRITICAL PRINCIPLE: Always fix root causes, not symptoms.**

When TypeScript errors appear, they're often signals of architectural issues. Don't just silence them—investigate and fix the underlying design problem.

**Common Anti-Patterns to Avoid:**

1. **Using `any` types**
   - ❌ Bad: `let filmmakers: any[] = []`
   - ✅ Good: Create proper interfaces in `src/types/` and import them
   - **Why:** `any` disables type checking and requires explicit annotations in callbacks

2. **Global namespace pollution**
   - ❌ Bad: `window.__CUSTOM_DATA__ = { ... }` with manual type augmentation
   - ✅ Good: Use JSON script tags to pass server data to client scripts (see below)
   - **Why:** Globals are hard to track, JSON script tags are semantic and preserve bundling

3. **Duplicating type definitions**
   - ❌ Bad: Defining the same interface in multiple files
   - ✅ Good: Create shared types in `src/types/` directory
   - **Example:** `src/types/filmmaker.ts` defines `Filmmaker` interface once, imported everywhere

**Passing Server Data to Client Scripts (Astro):**

**CRITICAL: Use JSON script tags for passing data to bundled scripts**

Using `define:vars` makes scripts inline (equivalent to `is:inline`), which **disables TypeScript** and **prevents bundling**. The best practice is to use a separate `<script type="application/json">` tag.

```astro
---
// Server-side: Load data
const filmmakers = await db.select().from(filmmakersTable);
---

<!-- ❌ BAD - define:vars disables TypeScript and bundling -->
<script define:vars={{ filmmakers }}>
  // TypeScript features don't work here!
  // Script won't be bundled or optimized
</script>

<!-- ✅ CORRECT WAY - JSON script tag + bundled script -->
<script is:inline id="filmmaker-data" type="application/json" set:html={JSON.stringify(filmmakers)}></script>

<script>
  import type { Filmmaker } from '../types/filmmaker';

  // Full TypeScript support with imports, type checking, etc.
  const filmmakers: Filmmaker[] = JSON.parse(document.getElementById('filmmaker-data')!.textContent || '[]');

  // Script is bundled and optimized by Vite
  filmmakers.filter(f => f.name.includes('search'));
</script>
```

**Benefits of JSON script tag approach:**
- **Full TypeScript support** - type imports, annotations, assertions all work
- **Script bundling** - Vite bundles and optimizes your code
- **Type safety** - Share TypeScript interfaces between server and client
- **Client Router compatible** - Data stays fresh during view transitions
- **Semantic** - Uses standard `application/json` MIME type

**References:**
- [Passing data to a bundled script in Astro](https://florian-lefebvre.dev/blog/passing-data-to-a-bundled-script-in-astro/) - Recommended approach
- [Astro GitHub Issue #6642](https://github.com/withastro/astro/issues/6642) - Why `define:vars` prevents bundling

### API Response Helpers

**AVOID REPETITION**: Don't manually create Response objects with JSON.stringify in every endpoint.

```typescript
// ❌ Bad - Repeated boilerplate
return new Response(
  JSON.stringify({ error: 'Not found' }),
  {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  }
);

// ✅ Good - Use shared helpers
import { errorResponse, successResponse } from '../../lib/api';

return errorResponse('Not found', 404);
return successResponse({ data });
```

**Available helpers in `src/lib/api.ts`:**
- `errorResponse(message, status = 400)` - Error responses
- `successResponse(data)` - Success responses
- `jsonResponse(data, status)` - Generic JSON response

### Drizzle ORM Query Patterns

**Use the right operator:**

```typescript
// ❌ Bad - Multiple queries with union
await db.select().from(table)
  .where(eq(table.key, 'a'))
  .union(db.select().from(table).where(eq(table.key, 'b')));

// ✅ Good - Single query with inArray
import { inArray } from 'drizzle-orm';
await db.select().from(table)
  .where(inArray(table.key, ['a', 'b']));
```

**Benefits:**
- Single database query instead of multiple
- Uses SQL `IN` clause (optimized, uses indexes)
- More readable and maintainable

**Use transactions only when you need atomicity across multiple operations:**

```typescript
// ✅ Good - Independent operations, no transaction needed
await db.insert(settings).values({ key: 'a', value: '1' }).onConflictDoUpdate(...);
await db.insert(settings).values({ key: 'b', value: '2' }).onConflictDoUpdate(...);
// Each upsert is already atomic; transaction adds no value here

// ✅ Good - Related operations that must succeed/fail together
await db.transaction(async (tx) => {
  await tx.insert(orders).values({ userId: 1, total: 100 }).returning();
  await tx.update(users).set({ balance: balance - 100 }).where(eq(users.id, 1));
});
// Transaction ensures both happen or neither happens (e.g., payment + balance update)
```

**When to use transactions:**
- Operations that must all succeed or all fail (e.g., transferring money between accounts)
- Creating related records that would leave the DB in an inconsistent state if one fails

**When NOT to use transactions:**
- Independent operations that don't affect each other
- Single operations (already atomic)

### Astro Script Best Practices

**AVOID `is:inline` unless absolutely necessary:**

```astro
<!-- ❌ Bad - Loses TypeScript type checking and imports -->
<script is:inline define:vars={{ data }}>
  // No TypeScript checking here
  // No imports available
  const myData = data;
</script>

<!-- ✅ Good - Full TypeScript support -->
<script define:vars={{ data }}>
  import type { MyType } from '../types/mytype';

  // Full type checking
  // Can import utilities, types, etc.
  const myData: MyType = data;
</script>
```

**Benefits of avoiding `is:inline`:**
- Full TypeScript type checking
- Can import types and utilities
- Better IDE support
- Catches errors at build time

**When `is:inline` IS needed:**
- Script must run before page hydration (very rare)
- Script must run multiple times (usually indicates architectural issue)

**Type all function parameters and returns:**

```typescript
// ❌ Bad - Implicit any types
function handleClick(e) {
  const form = e.target;
}

// ✅ Good - Explicit types
function handleClick(e: Event) {
  const form = e.target as HTMLFormElement;
}

// ✅ Good - Return type for clarity
async function fetchData(id: number): Promise<MyData | null> {
  const response = await fetch(`/api/data/${id}`);
  return response.ok ? await response.json() : null;
}
```

### Performance Best Practices

**Prefer server-side data loading over API calls in .astro files:**

```astro
<!-- ❌ Bad - Unnecessary client-side API call -->
---
const apiUrl = '/api/filmmakers';
---
<script>
  const response = await fetch('/api/filmmakers');
  const data = await response.json();
</script>

<!-- ✅ Good - Direct DB query on server -->
---
import { db } from '../db';
import { filmmakers } from '../db/schema';

const data = await db.select().from(filmmakers);
---
<script define:vars={{ data }}>
  // Data is already here, no fetch needed
</script>
```

**Benefits:**
- Eliminates HTTP overhead (no request/response cycle)
- No JSON serialization over network
- Faster page loads (data in initial HTML)
- Reduces server load (fewer API calls)

**API endpoints should only be used for:**
- Client-side mutations (POST/PUT/DELETE)
- Client-initiated data fetches (user actions, infinite scroll, etc.)
- External/public API access

**Optimize data structures for client-side operations:**

```typescript
// ❌ Bad - O(n) lookups, repeated JSON.parse
<tr data-item={JSON.stringify(item)}>
// Later: const item = JSON.parse(row.getAttribute('data-item'));

// ✅ Good - O(1) lookups with Map
const itemsMap = new Map(items.map(i => [i.id, i]));
<tr data-item-id={item.id}>
// Later: const item = itemsMap.get(id); // O(1) lookup
```

**Benefits:**
- 100x faster operations (JSON.parse is expensive)
- Smaller HTML output (ID vs full object)
- Better memory usage

### Global CSS Utilities
BaseLayout.astro provides global reusable styles in `<style is:global>`:

**Typography & Layout:**
- `h1` - Consistent heading style (color: #1a1a1a, margin-bottom: 1rem)
- `.intro` - Intro paragraph style (gray text, larger font, bottom margin)

**Components:**
- `.btn-primary` - Purple gradient button with hover effect (brand color)

**Usage:** Just use these classes directly in any .astro file - no need to redefine styles.

**Note:** box-sizing: border-box is applied globally to all elements.

### Database
```typescript
// Import DB
import { db } from '../../db'
import { siteSettings } from '../../db/schema'
import { eq } from 'drizzle-orm'

// Query
await db.select().from(siteSettings)

// Update
await db.update(siteSettings).set({ value: 'x' }).where(eq(siteSettings.key, 'y'))
```

### Astro Scoped CSS
**CRITICAL**: Astro scopes CSS by default. Dynamically created elements (via JavaScript) won't receive scoped styles.

**THE RULE**: If HTML is generated via `innerHTML`, template strings, or `document.createElement()`, ALL classes used in that HTML MUST be wrapped in `:global()`.

**Common mistake**: Forgetting that `containerEl.innerHTML = ...` creates dynamic content that needs `:global()` for ALL classes, even basic layout classes like `.filmmaker-actions`, `.view-actions`, etc.

```astro
<style>
  /* This works for static HTML in the .astro file */
  .my-class { color: red; }

  /* This is required for ANY class used in JavaScript-generated HTML */
  :global(.dynamic-class) { color: blue; }
  :global(.dynamic-class:hover) { color: green; }

  /* Even layout/structural classes need :global() if used in innerHTML */
  :global(.button-container) {
    display: flex;
    gap: 0.5rem;
  }
</style>

<script>
  // Any of these patterns require :global() for the classes:

  // Pattern 1: createElement
  const el = document.createElement('div');
  el.className = 'dynamic-class';

  // Pattern 2: innerHTML (COMMON IN THIS CODEBASE)
  containerEl.innerHTML = `
    <div class="dynamic-class">
      <div class="button-container">
        <button class="btn">Click me</button>
      </div>
    </div>
  `;
  // ALL classes above (.dynamic-class, .button-container, .btn) need :global()
</script>
```

**Quick check**: If you see `containerEl.innerHTML =` in the code, scan the template string for ALL class names and verify each has a `:global()` CSS rule.

**Examples in this codebase**:
- `/submit` - Role tags (`.role-tag`) and autocomplete items (`.autocomplete-item`) use `:global()`
- `/admin/filmmakers` - Buttons (`.btn`, `.btn-approve`, etc.), cards (`.filmmaker-card`), and action containers (`.filmmaker-actions`, `.view-actions`) all use `:global()` because they're created via `innerHTML`

## Features

### Filmmaker Directory
- Public directory at `/directory` with sortable table and role filtering
  - Default sort: alphabetical by name (A-Z)
  - Click column headers to sort by name, roles, company, or gear (email removed from table)
  - Filter by role: collapsible multi-select checkboxes organized by category
  - Live count showing filtered/total filmmakers
  - Selected filters shown as removable tags
- **Anti-Scraping Protection**: Email/phone hidden by default, revealed via server-side API
  - Contact info excluded from initial server-rendered HTML (filtered in `directory.astro`)
  - Click-to-reveal button fetches contact from `/api/reveal-contact`
  - Redis rate limiting: 20 reveals per IP per hour
  - Client-side caching for revealed contacts (session-only, resets on page reload)
  - Uses `redis` package with Redis Labs
- Submission form at `/submit` with role autocomplete
- Admin management at `/admin/filmmakers` (approve/edit/archive)
- Email notifications via Resend for new submissions
- CSV import script with role normalization and duplicate detection

### Film Roles System
All roles are defined in `src/config/roles.ts` using `FILM_ROLES_BY_CATEGORY`:
- Roles organized by category (Camera & Photography, Direction & Production, Sound, etc.)
- Each role has aliases for normalization (e.g., "DP" → "Director of Photography (DP)")
- `FILM_ROLES_BY_CATEGORY` is the single source of truth - all other exports derive from it
- Auto-generates flattened lists for autocomplete and filtering
- Role normalization ensures consistent data storage

## Important Notes
- Admin uses HTTP Basic Auth via Vercel deployment protection
- Migrations run manually, not on deploy
- Keep solutions simple, avoid over-engineering
- Mobile breakpoint: 768px
- Filmmaker submissions default to 'pending' status until approved

## Dependency Management
**IMPORTANT:** When updating dependencies, always check `git diff package.json` before committing.

npm's resolver can accidentally downgrade packages when running `npm install` or `npm update` due to:
- Lock file inconsistencies
- Peer dependency conflicts
- Using `npm update` without targeting specific packages

**Example:** Running `npm install` after removing Tailwind once downgraded `drizzle-kit` from `0.31.8` to `0.18.1` (19 months old!).

**Best practice:** Review package.json changes and verify critical packages like `@astrojs/vercel`, `drizzle-kit`, and `drizzle-orm` are on expected versions.
