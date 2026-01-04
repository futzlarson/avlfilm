ALTER TABLE "events" ADD COLUMN "session_id" varchar(12);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "location" varchar(255);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "timezone" varchar(50);