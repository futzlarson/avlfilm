# AVL Film Website

> **Audience:** New developers/collaborators setting up the project.
>
> **Purpose:** Quick start guide, setup instructions, and basic project overview.

Website for avlfilm.com.

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
- PostgreSQL (Supabase) + Drizzle ORM
- Redis (API rate limiting)
- Resend (email notifications)
- Vercel (hosting)

## Commands
- `npm run dev` - Dev server
- `npm run build` - Production build
- `npm run db:migrate` - Run migrations
- `npm run db:generate` - Generate migration
- `npm run db:studio` - Visual DB browser

## Structure
```
src/
├── components/       # Reusable components
├── layouts/          # Page layouts
├── pages/            # File-based routing
│   ├── admin/        # Password-protected admin
│   └── api/          # API routes
└── db/
    ├── schema.ts     # Database schema
    └── migrate.ts    # Migration runner
```

## Features
- **Filmmaker directory** - Browse and search local filmmakers by role
  - **Submission system** - Public form for filmmakers to join the directory
- **Admin dashboard** - Review, approve, and manage filmmaker submissions (HTTP Basic Auth)
- **Event calendar** - Mobile/desktop views for film community events
- **Newsletter signup** - EmailOctopus integration
- **Rate limiting** - Redis-based protection for contact reveals (20/hour per IP)
- **Automated backups** - GitHub Actions nightly backups with change detection
  - Required GitHub secrets: `POSTGRES_URL`, `ADMIN_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- **Webhooks** - Email Octopus -> Slack
- **Event tracking** - For later analysis

## Tracking events
```
production_company_link_click
production_add_company_button_click

directory_add_yourself_button_click
directory_company_link_click
directory_reveal_contact_click
directory_submit
directory_table_row_click
```

## Database Workflow
1. Edit `src/db/schema.ts`
2. `npm run db:generate`
3. Review generated SQL
4. `npm run db:migrate`
5. Commit both files

## Environment Variables
Create `.env.local`:
```bash
# Required
POSTGRES_URL="postgresql://..."           # Supabase connection string
REDIS_URL="redis://..."                   # Redis for rate limiting
ADMIN_PASSWORD=""                         # Admin dashboard password

# Email notifications (filmmaker submissions, backup alerts)
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"

# Newsletter signup
EMAILOCTOPUS_API_KEY=""
EMAILOCTOPUS_LIST_ID=""

# GitHub Secrets (for automated backups) - add to repo Settings → Secrets → Actions
POSTGRES_URL=""
ADMIN_EMAIL=""
RESEND_API_KEY=""
```

## Restoring a Database Backup

1. Download backup from GitHub repo → Actions → Database Backup → [run] → Artifacts
2. Unzip to get `.dump` file
3. Restore:
   ```bash
   pg_restore -d "$POSTGRES_URL" backup-file.dump
   ```

## Documentation

- **README.md** (this file) - Quick start for new collaborators
- **CLAUDE.md** - AI assistant guidelines and code patterns
- **TECHNICAL.md** - Deep architecture documentation for developers
