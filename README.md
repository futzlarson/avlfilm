# AVL Film Website

> **Audience:** New developers/collaborators setting up the project.
>
> **Purpose:** Quick start guide, setup instructions, and basic project overview.

Website for avlfilm.com - built with Astro, TypeScript, and PostgreSQL.

## Quick Start

```bash
npm install
echo 'POSTGRES_URL="postgresql://..."' > .env.local
npm run db:migrate
npm run dev
```

Visit http://localhost:4321

## Tech Stack
- Astro 5 + TypeScript
- PostgreSQL + Drizzle ORM
- Vercel hosting

## Commands
- `npm run dev` - Dev server
- `npm run build` - Production build
- `npm run db:migrate` - Run migrations
- `npm run db:generate` - Generate migration
- `npm run db:studio` - Visual DB browser

## Structure
```
src/
├── components/      # Reusable components
├── layouts/        # Page layouts
├── pages/          # File-based routing
│   ├── admin/     # Password-protected admin
│   └── api/       # API routes
└── db/
    ├── schema.ts  # Database schema
    └── migrate.ts # Migration runner
```

## Features
- Dynamic banner system (admin editable)
- Event calendar with mobile/desktop views
- Admin dashboard (HTTP Basic Auth)
- Responsive design

## Database Workflow
1. Edit `src/db/schema.ts`
2. `npm run db:generate`
3. Review generated SQL
4. `npm run db:migrate`
5. Commit both files

## Deployment (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Add `POSTGRES_URL` env var
4. Run migrations manually
5. Deploy

## Environment Variables
Create `.env.local`:
```
POSTGRES_URL="postgresql://..."
```

## Documentation

- **README.md** (this file) - Quick start for new collaborators
- **CLAUDE.md** - AI assistant guidelines and code patterns
- **TECHNICAL.md** - Deep architecture documentation for developers
