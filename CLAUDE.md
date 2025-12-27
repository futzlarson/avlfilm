# Claude Context - AVL Film Website

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
- Base layout: `src/layouts/BaseLayout.astro`
- Migrations: `drizzle/*.sql`
- Admin: `src/pages/admin/index.astro`, `src/pages/admin/filmmakers.astro`
- API routes: `src/pages/api/*.ts`
  - `/api/get-filmmakers` - Public directory listing (email/phone excluded)
  - `/api/reveal-contact` - Rate-limited contact reveal endpoint
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
  - Contact info excluded from initial HTML response (`/api/get-filmmakers`)
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
