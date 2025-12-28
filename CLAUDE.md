# Claude Context - AVL Film Website

> **Audience:** AI assistants (primarily Claude).
> **Purpose:** Critical patterns and workflows. Not a tutorial.

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

## Critical Anti-Patterns

### 1. TypeScript
- ❌ Using `any` types → ✅ Create interfaces in `src/types/`
- ❌ Duplicating type definitions → ✅ Import from shared types
- ❌ Duplicating functions → ✅ Extract to `src/lib/` or `src/utils/`

### 2. Astro Data Passing
- ❌ `define:vars` → Disables TypeScript & bundling
- ✅ JSON script tag: `<script type="application/json" id="data">{...}</script>` + bundled script to read it

### 3. API Helpers
- ❌ Manual `new Response(JSON.stringify(...))` in every endpoint
- ✅ Use `errorResponse()`, `successResponse()` from `src/lib/api.ts`

### 4. Drizzle ORM
- ❌ Multiple queries with union
- ✅ Single query with `inArray()`
- ❌ Transactions for independent operations
- ✅ Transactions only when operations must succeed/fail together

### 5. Astro Scoped CSS
- **If HTML is generated via `innerHTML`**, ALL classes need `:global()`
- Before completing work: audit for orphaned/unused CSS classes

### 6. Performance
- ❌ Client-side API calls in .astro files
- ✅ Direct DB queries on server (data in initial HTML)
- API endpoints only for: client mutations, user-initiated fetches, external access

### 7. Code Duplication
- ❌ Identical button styles in multiple places
- ✅ CSS selector grouping: `:global(.btn-approve), :global(.btn-save) { ... }`
- ❌ Two functions with same implementation
- ✅ One shared utility function

### 8. CI/CD Best Practices
- ❌ Creating inline files in workflows (`cat > script.ts << 'EOF'`)
- ✅ Create version-controlled script files in `src/scripts/` that can be tested locally
- **Benefits:** Git tracking, local testing, type checking, easier debugging

### 9. Environment Variables
- ❌ Adding `dotenv.config()` to every script
- ✅ Check if shared modules already load env vars (e.g., `src/db/index.ts` loads dotenv)
- Only add dotenv where actually needed (e.g., scripts that use env vars directly, not through shared modules)

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
- Admin: HTTP Basic Auth (Vercel deployment protection)
- Migrations: Manual, not on deploy
- Mobile breakpoint: 768px
- Filmmaker submissions: default to 'pending'
- Keep solutions simple, avoid over-engineering
- Check `git diff package.json` before committing (npm can silently downgrade packages)

## Database Backups
- Automated via GitHub Actions (nightly 2 AM UTC)
- Only backs up on changes (checks `filmmakers` table timestamps)
- Keeps 30 most recent backups (not 30 consecutive days)
- Only backs up `public` + `drizzle` schemas (~160 KB, not Supabase system tables)
- Email alerts on failure via Resend
- See `BACKUP_SETUP.md` for setup
