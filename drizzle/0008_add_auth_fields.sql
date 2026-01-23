-- Recreate filmmakers table with auth fields and social media columns
-- Step 1: Rename current table
ALTER TABLE "filmmakers" RENAME TO "filmmakers_old";

-- Step 2: Create new table with desired column order
CREATE TABLE "filmmakers" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "phone" varchar(20),
  "roles" text NOT NULL,
  "company" varchar(255),
  "website" varchar(500),
  "youtube" varchar(500),
  "facebook" varchar(500),
  "instagram" varchar(500),
  "gear" text,
  "bio" text,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  -- Auth fields
  "password_hash" text,
  "is_admin" boolean DEFAULT false NOT NULL,
  "reset_token" varchar(255),
  "reset_token_expires_at" timestamp,
  -- Timestamps
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "last_login_at" timestamp
);

-- Step 3: Copy data from old table to new table
-- Map social_media to instagram (per review decision)
INSERT INTO "filmmakers" (
  id, name, email, phone, roles, company, website,
  youtube, facebook, instagram,
  gear, bio, status, created_at, updated_at
)
SELECT
  id, name, email, phone, roles, company, website,
  NULL, NULL, social_media,
  gear, bio, status, created_at, updated_at
FROM "filmmakers_old";

-- Step 4: Update sequence to continue from max id
SELECT setval('filmmakers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM "filmmakers"));

-- Step 5: Create index for reset token lookups
CREATE INDEX idx_filmmakers_reset_token ON "filmmakers"(reset_token) WHERE reset_token IS NOT NULL;

-- Step 6: Drop old table
DROP TABLE "filmmakers_old";
