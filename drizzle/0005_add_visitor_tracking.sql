-- Add visitor tracking to events table
-- Rebuilds table with correct column order: id, visitor_id, event_name, properties, location, user_agent, created_at

ALTER TABLE "events" ADD COLUMN "visitor_id" varchar(12);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "location" varchar(255);--> statement-breakpoint

-- Rebuild table to reorder columns
CREATE TABLE events_new (
  id SERIAL PRIMARY KEY,
  visitor_id VARCHAR(12),
  event_name VARCHAR(255) NOT NULL,
  properties TEXT,
  location VARCHAR(255),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);--> statement-breakpoint

INSERT INTO events_new (id, visitor_id, event_name, properties, location, user_agent, created_at)
SELECT id, visitor_id, event_name, properties, location, user_agent, created_at FROM events;--> statement-breakpoint

SELECT setval('events_new_id_seq', COALESCE((SELECT MAX(id) FROM events_new), 1));--> statement-breakpoint

DROP TABLE events;--> statement-breakpoint
ALTER TABLE events_new RENAME TO events;--> statement-breakpoint
ALTER SEQUENCE events_new_id_seq RENAME TO events_id_seq;
