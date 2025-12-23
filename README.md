# AVL Film Website

A static website built with Astro and TypeScript for avlfilm.com, featuring dynamic banner management and filmmaker directory capabilities.

## Tech Stack

- **Framework**: Astro with TypeScript
- **Database**: Vercel Postgres
- **Hosting**: Vercel
- **Styling**: CSS (responsive, mobile-friendly)

## Project Structure

```
avlfilm/
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro          # Main layout with header/footer
│   ├── pages/
│   │   ├── index.astro               # Homepage
│   │   ├── calendar.astro            # Event calendar page
│   │   ├── directory.astro           # Filmmaker directory page
│   │   ├── faq.astro                 # FAQ page
│   │   ├── admin/
│   │   │   └── index.astro          # Admin dashboard (password protected)
│   │   └── api/
│   │       ├── banner.ts            # Banner settings API (GET/POST)
│   │       ├── get-crew.ts          # Get filmmakers (stub)
│   │       ├── submit-crew.ts       # Submit filmmaker (stub)
│   │       └── update-crew.ts       # Update filmmaker (stub)
│   └── components/
│       └── Banner.astro             # Dynamic banner component
├── .env.local                        # Environment variables (not committed)
├── vercel.json                       # Vercel configuration
└── DATABASE_SETUP.md                 # Database setup instructions
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Vercel account
- A Vercel Postgres database (see DATABASE_SETUP.md)

### Installation

1. Clone the repository:
   ```bash
   cd avlfilm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy the Vercel Postgres connection string
   - Update `.env.local` with your `POSTGRES_URL`

4. Set up the database:
   - Follow instructions in `DATABASE_SETUP.md`
   - Run the SQL schema to create tables and default data

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to `http://localhost:4321`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Features

### Dynamic Banner System
- Admin can edit banner HTML content
- Enable/disable banner display
- Changes reflected immediately across all pages

### Pages
- **Home** (`/`) - Welcome page
- **Calendar** (`/calendar`) - Event calendar
- **Directory** (`/directory`) - Filmmaker directory
- **FAQ** (`/faq`) - Frequently asked questions
- **Admin** (`/admin`) - Password-protected admin dashboard

### Admin Dashboard
- Edit banner HTML content
- Toggle banner visibility
- Protected by Vercel password protection

### API Routes
- `GET /api/banner` - Fetch current banner settings
- `POST /api/banner` - Update banner settings
- `GET /api/get-crew` - Get filmmakers (stub, to be implemented)
- `POST /api/submit-crew` - Submit filmmaker (stub, to be implemented)
- `POST /api/update-crew` - Update filmmaker (stub, to be implemented)

## Deployment to Vercel

1. Push your code to GitHub

2. Import the project in Vercel:
   - Go to https://vercel.com/new
   - Import your GitHub repository

3. Configure environment variables:
   - Add `POSTGRES_URL` in Vercel project settings
   - (This should be automatically set if you created the database in Vercel)

4. Enable password protection for /admin:
   - The `vercel.json` file already configures this
   - Set a password in Vercel project settings → Deployment Protection

5. Deploy:
   - Vercel will automatically deploy on every push to main branch

## Database Schema

See `DATABASE_SETUP.md` for detailed setup instructions.

### site_settings Table
```sql
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security

- Admin routes are protected by Vercel password protection
- Environment variables are not committed to the repository
- Input validation on all API endpoints
- XSS protection through proper HTML escaping

## Development Notes

- The project uses TypeScript with strict mode enabled
- All pages are responsive and mobile-friendly
- Banner component gracefully handles API errors
- Stub API routes are ready for future implementation

## Next Steps

To complete the filmmaker directory feature:
1. Design the filmmaker database schema
2. Implement the crew API endpoints (get-crew, submit-crew, update-crew)
3. Create the directory listing page UI
4. Add filmmaker submission form
5. Build admin approval interface

## Support

For issues or questions, please refer to the spec.md file or contact the development team.
