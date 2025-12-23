# Quick Start Guide

## 🚀 Get Up and Running in 3 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Database

1. Use your existing Supabase account or create a new Postgres database
2. Copy your `POSTGRES_URL` connection string
3. Update `.env.local`:
   ```
   POSTGRES_URL="your-postgres-connection-string-here"
   ```

### Step 3: Run Database Migrations
```bash
npm run db:migrate
```

This automatically creates tables and seeds default data.

### Step 4: Start Development Server
```bash
npm run dev
```

Visit http://localhost:4321

### Step 5: Access Admin Panel

Go to http://localhost:4321/admin to edit the banner.

## 📦 Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add `POSTGRES_URL` environment variable in Vercel settings
4. Run `npm run db:migrate` to set up production database
5. Deploy!

## ✅ What's Included

- ✨ Homepage, Calendar, Directory, and FAQ pages
- 🎨 Responsive design with clean styling
- 🔐 Password-protected admin dashboard (configure in Vercel)
- 📢 Dynamic banner system
- 🗄️ Drizzle ORM with SQL migrations
- 🚀 Ready for deployment

## 🛠️ Common Commands

### Development
- `npm run dev` - Start dev server (localhost:4321)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate new migration after schema changes
- `npm run db:studio` - Open visual database browser

## 📝 Next Steps

The stub API routes in `/src/pages/api/` are ready for you to implement:
- `get-crew.ts` - List all filmmakers
- `submit-crew.ts` - Submit new filmmaker
- `update-crew.ts` - Update filmmaker status

See `DATABASE_SETUP.md` for detailed migration workflow and `README.md` for full documentation.
