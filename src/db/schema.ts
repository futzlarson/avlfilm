import type { InferSelectModel } from 'drizzle-orm';
import { boolean,pgTable, serial, text, timestamp,varchar } from 'drizzle-orm/pg-core';

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

// Type definitions - single source of truth derived from schema
export type Filmmaker = InferSelectModel<typeof filmmakers>;
export type FilmmakerStatus = Filmmaker['status'];
export type PublicFilmmaker = Omit<
  Filmmaker,
  'email' | 'phone' | 'passwordHash' | 'resetToken' | 'resetTokenExpiresAt'
>;
export type Event = InferSelectModel<typeof events>;
