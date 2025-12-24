# Claude Context - AVL Film Website

## Project Overview
AVL Film Festival website (avlfilm.com) - Astro + TypeScript + PostgreSQL.

See `README.md` for full documentation.

## Tech Stack
- Astro 5 + TypeScript (strict)
- PostgreSQL (Vercel Postgres) + Drizzle ORM
- Tailwind CSS 4
- Vercel hosting

## Key File Locations
- Database schema: `src/db/schema.ts`
- Base layout: `src/layouts/BaseLayout.astro`
- Migrations: `drizzle/*.sql`
- Admin: `src/pages/admin/index.astro`
- API routes: `src/pages/api/*.ts`

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
```

## Code Patterns
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

## Important Notes
- Admin uses HTTP Basic Auth via Vercel deployment protection
- Migrations run manually, not on deploy
- Keep solutions simple, avoid over-engineering
- Mobile breakpoint: 768px
