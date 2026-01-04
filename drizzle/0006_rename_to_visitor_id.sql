ALTER TABLE "events" RENAME COLUMN "session_id" TO "visitor_id";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "timezone";
