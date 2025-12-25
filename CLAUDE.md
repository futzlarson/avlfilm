# Claude Context - AVL Film Website

## Project Overview
AVL Film Festival website (avlfilm.com) - Astro + TypeScript + PostgreSQL.

See `README.md` for full documentation.

## Tech Stack
- Astro 5 + TypeScript (strict)
- PostgreSQL (Vercel Postgres) + Drizzle ORM
- Vanilla CSS (scoped styles in .astro files)
- Vercel hosting

## Key File Locations
- Database schema: `src/db/schema.ts`
- Base layout: `src/layouts/BaseLayout.astro`
- Migrations: `drizzle/*.sql`
- Admin: `src/pages/admin/index.astro`, `src/pages/admin/filmmakers.astro`
- API routes: `src/pages/api/*.ts`
- Config: `src/config/roles.ts` (standardized film roles)
- Scripts: `src/scripts/import-csv.ts` (CSV import for filmmakers)

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
- Public directory at `/directory` with sortable table
- Submission form at `/submit` with role autocomplete
- Admin management at `/admin/filmmakers` (approve/edit/archive)
- Email notifications via Resend for new submissions
- CSV import script with role normalization and duplicate detection

## Important Notes
- Admin uses HTTP Basic Auth via Vercel deployment protection
- Migrations run manually, not on deploy
- Keep solutions simple, avoid over-engineering
- Mobile breakpoint: 768px
- Filmmaker submissions default to 'pending' status until approved
