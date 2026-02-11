# AVL Film - Quick Reference

> **Audience:** AI assistants (primarily Claude).
> **Purpose:** Critical patterns and gotchas only. Keep it under 100 lines.

---

# ⛔ STOP - READ THIS FIRST ⛔

**Before ANY file operation, complete this checklist:**

- [ ] Am I about to use Read, Grep, or Glob tools?
- [ ] Have I packed this directory with repomix yet?
  - **NO** → Use `pack_codebase` with `compress: true` FIRST
  - **YES** → Use `grep_repomix_output` or `read_repomix_output` ONLY

**❌ FORBIDDEN:** Read, Grep, Glob tools on source code files
**✅ REQUIRED:** pack_codebase → grep_repomix_output → read_repomix_output

**Exception:** Meta files only (CLAUDE.md, README.md, package.json, tsconfig.json)

---

## 🚨 Token Efficiency FIRST

**MANDATORY REPOMIX WORKFLOW:**
1. **ALWAYS use `pack_codebase` FIRST** before reading ANY files
2. **Use `compress: true`** (saves ~70% tokens)
3. **Use `grep_repomix_output` to search** - NEVER use Grep tool directly
4. **Use `read_repomix_output` for line ranges** - NEVER use Read tool on packed files
5. **❌ FORBIDDEN:** Using Read/Grep/Glob tools on files already in repomix output

**Other token rules:**
- Run `/compact` when context usage >50%
- Pre-flight check: If folder >2MB, estimate tokens first
- Threshold: Stop if >30K tokens, suggest narrower `includePattern`

---

## 🛑 Research BEFORE Implementation

**Trigger phrases requiring research:**
- "set up automated/scheduled X" → Platform capabilities
- "run/use [CLI tool]" → Check if exists in environment
- "implement [framework feature]" → Current best practices (2024+)

**Past mistakes:**
- Used `define:vars` → breaks TypeScript (use JSON script tags)
- Used `pg_dump` on Vercel → doesn't exist (use GitHub Actions)
- **Used Read tool after packing with repomix** → wasted thousands of tokens (use grep/read_repomix_output)

---

## Critical File Paths

- Schema: `src/db/schema.ts`
- Auth: `src/lib/auth.ts`
- API helpers: `src/lib/api.ts`
- Emails: `src/emails/`
- Roles: `src/config/roles.ts` (SINGLE SOURCE OF TRUTH)
- **DON'T duplicate helpers** - check `src/lib/` first

---

## Import Rules

**Path aliases (ALWAYS use these):**
- `@lib/*` → `src/lib`
- `@db/*` → `src/db`
- `@emails/*` → `src/emails`
- `@app-types/*` → `src/types`
- `@config/*` → `src/config`
- `@utils/*` → `src/utils`
- `@layouts/*` → `src/layouts`
- `@components/*` → `src/components`

**Rules:**
- ✅ Use path aliases for cross-directory imports
- ✅ Use `./` for same-directory imports
- ❌ **NEVER use `../` parent imports** - ESLint will error
- Run `npm run lint:fix` before commit (auto-sorts imports)

---

## Top 5 Anti-Patterns

1. **❌ `define:vars` in Astro → ✅ JSON script tags**
   ```astro
   <script is:inline id="data" type="application/json" set:html={JSON.stringify(data)}></script>
   ```

2. **❌ `process.env` in Astro → ✅ `import.meta.env`**

3. **❌ Creating new helpers → ✅ Check `src/lib/` first**
   - API: `errorResponse()`, `successResponse()` from `@lib/api`
   - Auth: `isAuthenticated()` from `@lib/auth`

4. **❌ Client-side `innerHTML` → ✅ Server-side Astro components**
   - Astro auto-escapes, more secure, better performance

5. **❌ Parent imports (`../`) → ✅ Path aliases**

---

## Common Helpers (Import, Don't Recreate)

```typescript
// API responses
import { errorResponse, successResponse } from '@lib/api';

// Auth
import { isAuthenticated, unauthorizedResponse } from '@lib/auth';

// Database
import { db } from '@db';
import { filmmakers, siteSettings, events } from '@db/schema';

// Roles
import { FILM_ROLES_BY_CATEGORY } from '@config/roles';

// Email
import * as approvalEmail from '@emails/approval';
import { BUTTON_STYLE, userEmailTemplate } from '@emails/templates';

// Utilities
import { generateSlug } from '@lib/slug';
import { toDatetimeLocal, subtractDays } from '@lib/datetime';
import { showFormMessage, hideFormMessage } from '@lib/form-utils';
```

---

## Database Migrations (Drizzle)

**⚠️ CRITICAL: Never manually create migration SQL files!**

**Correct workflow:**
1. Update `src/db/schema.ts` with your changes
2. Run `npm run db:generate` (creates migration + updates journal)
3. Run `npm run db:migrate` (applies migration to database)

**Why this matters:**
- Drizzle uses `drizzle/meta/_journal.json` to track migrations
- Manually created SQL files won't be in the journal → won't run
- Always use `db:generate` to ensure proper registration

**Past mistake:**
- Created `drizzle/0011_add_full_res_video_url.sql` manually → SQL error (column doesn't exist) → had to manually add to journal

---

## Email System

**When creating new email templates:**
1. Create email file in `src/emails/` (e.g., `request-file.ts`)
2. Use `userEmailTemplate()` wrapper from `@emails/templates`
3. Import constants: `BUTTON_STYLE`, `PARAGRAPH_STYLE`, `COLORS`
4. **CRITICAL:** Add export to `src/emails/index.ts`
5. Use Resend to send: `new Resend(import.meta.env.RESEND_API_KEY)`

**Example pattern:**
```typescript
import { BUTTON_STYLE, COLORS, PARAGRAPH_STYLE, userEmailTemplate } from './templates';

export const metadata = {
  name: 'Email Name',
  description: 'When it is sent',
  audience: 'external',
  subject: 'Email Subject',
};

export function generate(param1: string, param2: string): string {
  return userEmailTemplate(`<h2>...</h2><p>...</p>`);
}
```

**Past mistake:**
- Created new email template but forgot to add to `src/emails/index.ts` exports

---

## Utility Functions

**Slug generation:**
- ✅ Use `generateSlug()` from `@lib/slug`
- ❌ Don't manually implement `.toLowerCase().replace(/[^a-z0-9]+/g, '-')`

**DateTime handling:**
- ✅ Use `toDatetimeLocal(date)` from `@lib/datetime` for datetime-local inputs
- ✅ Use `subtractDays(date, days)` for deadline calculations
- ❌ Don't manually handle timezone offsets

**Form messages:**
- ✅ Use `showFormMessage(element, text, type)` from `@lib/form-utils`
- ✅ Use `hideFormMessage(element)` to clear messages
- ❌ Don't create local `showMessage()` functions in each form

---

## Commands

```bash
npm run dev          # Dev server (port 4321)
npm run build        # Production build
npm run lint:fix     # Auto-fix imports & formatting
npm run db:generate  # Generate migration from schema.ts
npm run db:migrate   # Run migrations
```

---

## Quick Notes

- **Admin auth:** HTTP Basic Auth (Vercel deployment protection)
- **Mobile breakpoint:** 768px
- **Tech stack:** Astro 5, TypeScript (strict), PostgreSQL (Supabase), Drizzle ORM, Redis, Vercel
- **Migrations:** Manual, not on deploy
- **Database backups:** Automated via GitHub Actions (nightly 2 AM UTC)
