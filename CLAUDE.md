# AVL Film - Quick Reference

> **Audience:** AI assistants (primarily Claude).
> **Purpose:** Critical patterns and gotchas only. Keep it under 100 lines.

---

## 🚨 Token Efficiency FIRST

- **Use Repomix for exploration:** `pack_codebase` with `compress: true` (saves ~70% tokens)
- **Run `/compact`** when context usage >50%
- **Pre-flight check:** If folder >2MB, estimate tokens first
- **Threshold:** Stop if >30K tokens, suggest narrower `includePattern`

---

## 🛑 Research BEFORE Implementation

**Trigger phrases requiring research:**
- "set up automated/scheduled X" → Platform capabilities
- "run/use [CLI tool]" → Check if exists in environment
- "implement [framework feature]" → Current best practices (2024+)

**Past mistakes:**
- Used `define:vars` → breaks TypeScript (use JSON script tags)
- Used `pg_dump` on Vercel → doesn't exist (use GitHub Actions)

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
import { generateApprovalEmailHtml } from '@emails/approval';
```

---

## Commands

```bash
npm run dev          # Dev server (port 4321)
npm run build        # Production build
npm run lint:fix     # Auto-fix imports & formatting
npm run db:generate  # Generate migration
npm run db:migrate   # Run migration
```

---

## Quick Notes

- **Admin auth:** HTTP Basic Auth (Vercel deployment protection)
- **Mobile breakpoint:** 768px
- **Tech stack:** Astro 5, TypeScript (strict), PostgreSQL (Supabase), Drizzle ORM, Redis, Vercel
- **Migrations:** Manual, not on deploy
- **Database backups:** Automated via GitHub Actions (nightly 2 AM UTC)
