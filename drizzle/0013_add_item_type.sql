-- Add item type discriminator to distinguish films from schedule breaks
ALTER TABLE "submissions" ADD COLUMN "item_type" varchar(20) DEFAULT 'film' NOT NULL;
