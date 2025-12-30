# Claude Context - AVL Film Website

> **Audience:** AI assistants (primarily Claude).
> **Purpose:** AVL Film-specific patterns, workflows, and lessons learned.

---

## Prerequisites

**Read `BEST_PRACTICES.md` first** for general Node.js, Astro, TypeScript, and Drizzle ORM patterns.

This file documents AVL Film-specific workflows, gotchas, and project conventions.

---

## 🛑 MANDATORY: Research BEFORE Implementation

**Before writing ANY code, research:**
1. **Runtime capabilities** - What binaries/commands exist? (pg_dump, ffmpeg, etc.)
2. **Platform constraints** - Execution limits, memory, filesystem access
3. **Current best practices** - Official docs, recent (2024+) examples

**Trigger phrases that REQUIRE research:**
- **"set up automated/scheduled X"** → Research platform capabilities & available runtimes
- **"run/use [CLI tool]"** → Research if tool exists in target environment
- **"implement [framework feature]"** → Research current patterns (not training data)

**If uncertain:** Tell user *"Let me research [X] first"* and DO IT with WebSearch/WebFetch.

**Past mistakes:**
- Used `define:vars` without researching → breaks TypeScript & bundling (use JSON script tags)
- Implemented Vercel Cron with `pg_dump` → Vercel doesn't have pg_dump (use GitHub Actions)

---

## Project Orientation

**Tech Stack:** Astro 5, TypeScript (strict), PostgreSQL (Supabase), Drizzle ORM, Redis, Vercel

**Key Locations:**
- Schema: `src/db/schema.ts`
- Types: `src/types/*.ts` (single source of truth)
- Utils: `src/lib/*.ts` (auth, api helpers)
- Roles config: `src/config/roles.ts` (SINGLE SOURCE OF TRUTH)
- Backups: `.github/workflows/backup-database.yml`

**Commands:**
```bash
npm run dev              # Dev server
npm run build            # Production build
npm run db:generate      # Generate migration
npm run db:migrate       # Run migration
```

---

## AVL Film-Specific Anti-Patterns

### Environment Variables
- ❌ Using `process.env` in Astro API routes
- ✅ Use `import.meta.env` in Astro server-side code (API routes, pages)
- ❌ Adding `dotenv.config()` to every script
- ✅ Check if shared modules already load env vars (e.g., `src/db/index.ts` loads dotenv)

### API Helpers
- ❌ Manual `new Response(JSON.stringify(...))` in every endpoint
- ✅ Use `errorResponse()`, `successResponse()` from `src/lib/api.ts`

### Astro Scoped CSS
- **If HTML is generated via `innerHTML`**, ALL classes need `:global()`
- Before completing work: audit for orphaned/unused CSS classes

### CSS Code Duplication
- ❌ Identical button styles in multiple places
- ✅ CSS selector grouping: `:global(.btn-approve), :global(.btn-save) { ... }`

### CI/CD Best Practices
- ❌ Creating inline files in workflows (`cat > script.ts << 'EOF'`)
- ✅ Create version-controlled script files in `src/scripts/` that can be tested locally
- **Benefits:** Git tracking, local testing, type checking, easier debugging

### Dev Server Management
- ❌ Starting `npm run dev` when a dev server is already running
- ✅ Check for existing dev server first: `lsof -i:4321`
- Only start new server if none exists
- Reuse existing server for testing

---

## Database Workflow

**Schema changes:**
1. Edit `src/db/schema.ts`
2. `npm run db:generate` - creates migration
3. Review SQL in `drizzle/XXXX_name.sql`
4. `npm run db:migrate` - runs migration
5. Commit schema + migration

**Quick queries (for Claude):**
```bash
# Load env and query database
source .env.local && /opt/homebrew/opt/postgresql@17/bin/psql "$POSTGRES_URL" -c "SELECT * FROM filmmakers LIMIT 5;"
```

---

## Self-Improvement Pattern

When user points out oversight:
1. **Acknowledge** - Don't defend, recognize the gap
2. **Apply fix** - Correct the specific issue
3. **Generalize** - Update CLAUDE.md with the lesson
4. **Audit** - Check if same problem exists elsewhere

---

## Important Notes

### Project Conventions
- Admin: HTTP Basic Auth (Vercel deployment protection)
- Migrations: Manual, not on deploy
- Mobile breakpoint: 768px
- Filmmaker submissions: default to 'pending'
- Keep solutions simple, avoid over-engineering
- Check `git diff package.json` before committing (npm can silently downgrade packages)

### Database Backups
- Automated via GitHub Actions (nightly 2 AM UTC)
- Only backs up on changes (checks `filmmakers` table timestamps)
- Keeps 30 most recent backups (not 30 consecutive days)
- Only backs up `public` + `drizzle` schemas (~160 KB, not Supabase system tables)
- Email alerts on failure via Resend
- See `BACKUP_SETUP.md` for setup
