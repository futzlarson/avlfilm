-- Recreate filmmakers table with bio column after gear
-- Step 1: Rename current table
ALTER TABLE "filmmakers" RENAME TO "filmmakers_old";

-- Step 2: Create new table with correct column order
CREATE TABLE "filmmakers" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "phone" varchar(20),
  "roles" text NOT NULL,
  "company" varchar(255),
  "website" varchar(500),
  "social_media" varchar(500),
  "gear" text,
  "bio" text,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Step 3: Copy data from old table to new table
INSERT INTO "filmmakers" (
  id, name, email, phone, roles, company, website, social_media,
  gear, bio, status, created_at, updated_at
)
SELECT
  id, name, email, phone, roles, company, website, social_media,
  gear, bio, status, created_at, updated_at
FROM "filmmakers_old";

-- Step 4: Update sequence to continue from max id
SELECT setval('filmmakers_id_seq', (SELECT MAX(id) FROM "filmmakers"));

-- Step 5: Drop old table
DROP TABLE "filmmakers_old";
