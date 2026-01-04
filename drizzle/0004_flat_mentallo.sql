CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_name" varchar(255) NOT NULL,
	"properties" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
