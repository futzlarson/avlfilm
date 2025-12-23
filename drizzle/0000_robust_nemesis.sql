CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);

-- Seed default banner settings
INSERT INTO site_settings (key, value) VALUES ('banner_html', '<p>Welcome to AVL Film!</p>');
INSERT INTO site_settings (key, value) VALUES ('banner_enabled', 'true');
