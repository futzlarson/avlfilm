import type { InferSelectModel } from 'drizzle-orm';
import { pgTable, serial, text, timestamp,varchar } from 'drizzle-orm/pg-core';

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
  socialMedia: varchar('social_media', { length: 500 }),
  gear: text('gear'),
  bio: text('bio'),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending' | 'approved' | 'archived'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
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
export type PublicFilmmaker = Omit<Filmmaker, 'email' | 'phone'>;
export type Event = InferSelectModel<typeof events>;
