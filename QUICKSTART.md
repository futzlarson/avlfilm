# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Database

1. Create a Vercel Postgres database at https://vercel.com/dashboard
2. Copy your `POSTGRES_URL` from the database settings
3. Update `.env.local`:
   ```
   POSTGRES_URL="your-postgres-connection-string-here"
   ```

### Step 3: Initialize Database Tables

Run this SQL in your Vercel Postgres dashboard (Query tab):

```sql
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_settings (key, value)
VALUES ('banner_html', '<p>Welcome to AVL Film!</p>');

INSERT INTO site_settings (key, value)
VALUES ('banner_enabled', 'true');
```

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
3. Vercel will auto-detect Astro and configure everything
4. Enable password protection in Vercel project settings → Deployment Protection
5. Deploy!

## ✅ What's Included

- ✨ Homepage, Calendar, Directory, and FAQ pages
- 🎨 Responsive design with clean styling
- 🔐 Password-protected admin dashboard
- 📢 Dynamic banner system
- 🗄️ Vercel Postgres integration
- 🚀 Ready for deployment

## 🛠️ Common Commands

- `npm run dev` - Start dev server (localhost:4321)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📝 Next Steps

The stub API routes in `/src/pages/api/` are ready for you to implement:
- `get-crew.ts` - List all filmmakers
- `submit-crew.ts` - Submit new filmmaker
- `update-crew.ts` - Update filmmaker status

See `spec.md` for the complete specification.
