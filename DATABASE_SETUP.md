# Database Setup Instructions

This project uses **Drizzle ORM** for database management with SQL-based migrations.

## Quick Setup

### 1. Set Up Your Database

You can use either Vercel's Supabase integration or your own Supabase account:

#### Option A: Use Existing Supabase Account (Recommended)

1. Go to your [Supabase project dashboard](https://supabase.com/dashboard)
2. Navigate to **Project Settings** → **Database**
3. Copy your connection string (under "Connection string" → "URI")
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`
4. Update `.env.local`:
   ```
   POSTGRES_URL="your-supabase-connection-string"
   ```

#### Option B: Create Through Vercel

1. In Vercel dashboard, go to your project
2. Click **Storage** → **Create Database** → **Postgres**
3. The `POSTGRES_URL` will be automatically set in Vercel
4. For local development, copy it from Vercel dashboard to `.env.local`

### 2. Run Migrations

Once your connection string is set in `.env.local`:

```bash
npm run db:migrate
```

This will:
- Create the `site_settings` table
- Insert default banner settings

That's it! Your database is ready.

## Available Commands

### `npm run db:generate`
Generate new migration files after changing `src/db/schema.ts`

### `npm run db:migrate`
Run pending migrations against your database

### `npm run db:studio`
Open Drizzle Studio - a visual database browser at `https://local.drizzle.studio`

## How Migrations Work

### Schema Definition
Database tables are defined in TypeScript at `src/db/schema.ts`:

```typescript
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: text('value'),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Migration Files
When you run `npm run db:generate`, Drizzle creates SQL migration files in `drizzle/`:

```
drizzle/
├── 0000_robust_nemesis.sql    # Initial migration (creates tables + seeds data)
├── 0001_next_migration.sql    # Future migrations...
└── meta/                       # Metadata (git-ignored)
```

### Adding New Migrations

When you need to change the database schema:

1. **Update the schema** in `src/db/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Review the SQL** in `drizzle/XXXX_name.sql`
4. **Run migration**: `npm run db:migrate`
5. **Commit both** schema changes and migration files

## Example: Adding a New Table

Let's say you want to add a `filmmakers` table:

### Step 1: Update Schema
Edit `src/db/schema.ts`:

```typescript
export const filmmakers = pgTable('filmmakers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  approved: boolean('approved').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Step 2: Generate Migration
```bash
npm run db:generate
```

This creates `drizzle/0001_new_filmmakers.sql`

### Step 3: Review & Run
```bash
npm run db:migrate
```

### Step 4: Commit
```bash
git add src/db/schema.ts drizzle/0001_new_filmmakers.sql
git commit -m "Add filmmakers table"
```

## Using the Database in Code

Import and use the database client:

```typescript
import { db } from '../../db';
import { siteSettings } from '../../db/schema';
import { eq } from 'drizzle-orm';

// Query
const settings = await db.select().from(siteSettings);

// Insert
await db.insert(siteSettings).values({
  key: 'my_key',
  value: 'my_value'
});

// Update
await db
  .update(siteSettings)
  .set({ value: 'new_value' })
  .where(eq(siteSettings.key, 'my_key'));
```

## Deployment

### Vercel Deployment

Migrations don't run automatically on deployment. You have two options:

#### Option 1: Run Manually Before Deploy
```bash
npm run db:migrate  # Run locally before pushing
git push
```

#### Option 2: Add to Build Command (Advanced)
In `vercel.json` or Vercel dashboard, update build command:
```json
{
  "buildCommand": "npm run db:migrate && npm run build"
}
```

**Note**: Be cautious with automatic migrations in production. It's safer to run them manually.

### First Deployment

1. Push your code to GitHub
2. Import to Vercel
3. Add `POSTGRES_URL` environment variable in Vercel settings
4. Run `npm run db:migrate` locally (pointing to production DB)
5. Deploy

## Troubleshooting

### "POSTGRES_URL is not defined"
Make sure `.env.local` exists and contains your connection string.

### "relation does not exist"
You haven't run migrations yet. Run `npm run db:migrate`.

### "password authentication failed"
Check your connection string password is correct.

### Migration Conflicts
If you have multiple migration files and conflicts:
1. Ensure all migrations are run: `npm run db:migrate`
2. Check `drizzle/__drizzle_migrations` table to see which ran
3. You may need to manually fix conflicting migrations

## Best Practices

✅ **DO:**
- Commit migration files to git
- Review generated SQL before running migrations
- Test migrations on a development database first
- Run migrations manually for production

❌ **DON'T:**
- Edit old migration files (create new ones instead)
- Delete migration files
- Commit `drizzle/meta/` folder (it's git-ignored)
- Run untested migrations directly on production

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Drizzle Kit Docs](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
