-- Spotlight Events table
CREATE TABLE IF NOT EXISTS "spotlight_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL,
  "theme" varchar(255),
  "description" text,
  "event_date" timestamp NOT NULL,
  "submission_deadline" timestamp NOT NULL,
  "status" varchar(50) DEFAULT 'upcoming' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "spotlight_events_slug_unique" UNIQUE("slug")
);

-- Submissions table
CREATE TABLE IF NOT EXISTS "submissions" (
  "id" serial PRIMARY KEY NOT NULL,
  "event_id" integer NOT NULL,
  "filmmaker_id" integer,
  "submitter_name" varchar(255) NOT NULL,
  "submitter_email" varchar(255) NOT NULL,
  "film_title" varchar(255) NOT NULL,
  "film_genre" varchar(100) NOT NULL,
  "film_genre_other" varchar(100),
  "film_length" integer NOT NULL,
  "film_link" text NOT NULL,
  "film_link_password" varchar(255),
  "available_in_person" boolean DEFAULT false NOT NULL,
  "filmmaker_notes" text,
  "admin_notes" text,
  "status" varchar(50) DEFAULT 'pending' NOT NULL,
  "rejection_reason" text,
  "reviewed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Reviews table
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" serial PRIMARY KEY NOT NULL,
  "submission_id" integer NOT NULL,
  "admin_id" integer NOT NULL,
  "vote" varchar(20),
  "comment" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "reviews_submission_id_admin_id_unique" UNIQUE("submission_id", "admin_id")
);

-- Foreign keys
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_event_id_spotlight_events_id_fk"
  FOREIGN KEY ("event_id") REFERENCES "spotlight_events"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "submissions" ADD CONSTRAINT "submissions_filmmaker_id_filmmakers_id_fk"
  FOREIGN KEY ("filmmaker_id") REFERENCES "filmmakers"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_submission_id_submissions_id_fk"
  FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_admin_id_filmmakers_id_fk"
  FOREIGN KEY ("admin_id") REFERENCES "filmmakers"("id") ON DELETE cascade ON UPDATE no action;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_submissions_event_id" ON "submissions" ("event_id");
CREATE INDEX IF NOT EXISTS "idx_submissions_filmmaker_id" ON "submissions" ("filmmaker_id");
CREATE INDEX IF NOT EXISTS "idx_submissions_status" ON "submissions" ("status");
CREATE INDEX IF NOT EXISTS "idx_reviews_submission_id" ON "reviews" ("submission_id");
