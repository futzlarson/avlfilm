# Database Setup Instructions

## Setting Up Vercel Postgres

### 1. Create a Vercel Postgres Database

1. Go to your Vercel dashboard
2. Navigate to your project
3. Click on the "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose your database name and region
7. Click "Create"

### 2. Get Your Connection String

1. After creating the database, click on it
2. Go to the ".env.local" tab
3. Copy the `POSTGRES_URL` value
4. Update your local `.env.local` file with this value

### 3. Run the Database Schema

Connect to your Vercel Postgres database and run the following SQL commands:

```sql
-- Create the site_settings table
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default banner settings
INSERT INTO site_settings (key, value)
VALUES ('banner_html', '<p>Welcome to AVL Film!</p>');

INSERT INTO site_settings (key, value)
VALUES ('banner_enabled', 'true');
```

### 4. Running SQL Commands

You can run these SQL commands in several ways:

#### Option A: Vercel Dashboard
1. Go to your database in the Vercel dashboard
2. Click on the "Query" tab
3. Paste and execute the SQL commands

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link your project
vercel link

# Run SQL commands (you'll need to paste the SQL)
vercel env pull .env.local
```

#### Option C: Using a PostgreSQL Client
Use the connection string from your `.env.local` file with any PostgreSQL client like:
- pgAdmin
- DBeaver
- psql command line tool

### 5. Verify the Setup

After running the SQL commands, you can verify by running:

```sql
SELECT * FROM site_settings;
```

You should see two rows:
- `banner_html` with value `<p>Welcome to AVL Film!</p>`
- `banner_enabled` with value `true`

## Local Development

For local development, you have two options:

### Option 1: Use Vercel Postgres (Recommended)
Simply use the `POSTGRES_URL` from Vercel in your `.env.local` file. This connects your local development to the production database.

**Warning**: Be careful when developing locally as changes will affect the production database.

### Option 2: Local PostgreSQL Database
1. Install PostgreSQL locally
2. Create a local database
3. Update `.env.local` with your local connection string
4. Run the schema SQL commands on your local database

## Environment Variables

Make sure your `.env.local` file contains:

```
POSTGRES_URL="your-vercel-postgres-connection-string"
```

**Never commit `.env.local` to git!** It's already in `.gitignore`.

## Deployment

When deploying to Vercel:

1. The `POSTGRES_URL` environment variable should already be set automatically if you created the database through Vercel
2. If not, go to your project settings → Environment Variables
3. Add `POSTGRES_URL` with your connection string
4. Redeploy your application

## Troubleshooting

### Connection Errors
- Verify your `POSTGRES_URL` is correct
- Check that your database is active in the Vercel dashboard
- Ensure you're using the correct connection string for your environment

### Table Doesn't Exist
- Make sure you ran the CREATE TABLE command
- Verify you're connected to the correct database

### Default Values Not Showing
- Ensure you ran both INSERT statements
- Check the data using `SELECT * FROM site_settings`
