CREATE TABLE "filmmakers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"roles" text NOT NULL,
	"company" varchar(255),
	"website" varchar(500),
	"social_media" varchar(500),
	"gear" text,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
