import type { InferSelectModel } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp, unique, varchar } from 'drizzle-orm/pg-core';

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: text('value'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const filmmakers = pgTable('filmmakers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  roles: text('roles').notNull(),
  company: varchar('company', { length: 255 }),
  website: varchar('website', { length: 500 }),
  youtube: varchar('youtube', { length: 500 }),
  facebook: varchar('facebook', { length: 500 }),
  instagram: varchar('instagram', { length: 500 }),
  gear: text('gear'),
  bio: text('bio'),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending' | 'approved' | 'archived'
  // Auth fields
  passwordHash: text('password_hash'),
  isAdmin: boolean('is_admin').default(false).notNull(),
  resetToken: varchar('reset_token', { length: 255 }),
  resetTokenExpiresAt: timestamp('reset_token_expires_at'),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  visitorId: varchar('visitor_id', { length: 12 }), // Persistent visitor tracking
  eventName: varchar('event_name', { length: 255 }).notNull(),
  properties: text('properties'), // JSON string
  location: varchar('location', { length: 255 }), // "City, State" or timezone fallback
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Spotlight Events ─────────────────────────────────────────────────────────

export const spotlightEvents = pgTable('spotlight_events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  theme: varchar('theme', { length: 255 }),
  eventDate: timestamp('event_date').notNull(),
  submissionDeadline: timestamp('submission_deadline').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('upcoming'), // 'upcoming' | 'reviewing' | 'scheduled' | 'past'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id')
    .notNull()
    .references(() => spotlightEvents.id, { onDelete: 'cascade' }),
  filmmakerId: integer('filmmaker_id')
    .references(() => filmmakers.id, { onDelete: 'set null' }),
  submitterName: varchar('submitter_name', { length: 255 }).notNull(),
  submitterEmail: varchar('submitter_email', { length: 255 }).notNull(),
  filmTitle: varchar('film_title', { length: 255 }).notNull(),
  filmGenre: varchar('film_genre', { length: 100 }).notNull(),
  filmGenreOther: varchar('film_genre_other', { length: 100 }),
  filmLength: integer('film_length').notNull(), // Duration in seconds
  filmLink: text('film_link').notNull(),
  filmLinkPassword: varchar('film_link_password', { length: 255 }),
  fullResVideoUrl: text('full_res_video_url'), // External link to full-resolution video (for approved submissions)
  availableInPerson: boolean('available_in_person').notNull().default(false),
  filmmakerNotes: text('filmmaker_notes'),
  adminNotes: text('admin_notes'),
  sortOrder: integer('sort_order').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'approved' | 'rejected' | 'future'
  rejectionReason: text('rejection_reason'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  submissionId: integer('submission_id')
    .notNull()
    .references(() => submissions.id, { onDelete: 'cascade' }),
  adminId: integer('admin_id')
    .notNull()
    .references(() => filmmakers.id, { onDelete: 'cascade' }),
  vote: varchar('vote', { length: 20 }), // 'up' | 'down' | null
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  unique().on(table.submissionId, table.adminId),
]);

// ── Type Definitions ─────────────────────────────────────────────────────────

export type Filmmaker = InferSelectModel<typeof filmmakers>;
export type FilmmakerStatus = Filmmaker['status'];
export type PublicFilmmaker = Omit<
  Filmmaker,
  'email' | 'phone' | 'passwordHash' | 'resetToken' | 'resetTokenExpiresAt'
> & {
  hasPassword: boolean;
};
export type AnalyticsEvent = InferSelectModel<typeof events>;
export type SpotlightEvent = InferSelectModel<typeof spotlightEvents>;
export type NewSpotlightEvent = typeof spotlightEvents.$inferInsert;
export type Submission = InferSelectModel<typeof submissions>;
export type NewSubmission = typeof submissions.$inferInsert;
export type Review = InferSelectModel<typeof reviews>;
export type NewReview = typeof reviews.$inferInsert;
