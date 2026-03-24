import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  decimal,
  integer,
  check,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  username: text("username").unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const venues = pgTable("venues", {
  id: uuid("id").primaryKey().defaultRandom(),
  googlePlaceId: text("google_place_id").unique().notNull(),
  name: text("name").notNull(),
  area: text("area"),
  category: text("category"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  googleRating: decimal("google_rating", { precision: 2, scale: 1 }),
  photoReference: text("photo_reference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const checkIns = pgTable(
  "check_ins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    busyLevel: text("busy_level").notNull(),
    vibeTags: text("vibe_tags").array().notNull().default(sql`'{}'::text[]`),
    viewStatus: text("view_status").notNull().default("na"),
    photoUrl: text("photo_url"),
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => ({
    busyLevelCheck: check(
      "check_ins_busy_level_check",
      sql`${table.busyLevel} IN ('dead', 'moderate', 'packed')`
    ),
    viewStatusCheck: check(
      "check_ins_view_status_check",
      sql`${table.viewStatus} IN ('clear', 'blocked', 'na')`
    ),
  })
);

export const savedVenues = pgTable("saved_venues", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  position: integer("position"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const searchCache = pgTable("search_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  queryHash: text("query_hash").notNull().unique(),
  query: text("query").notNull(),
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const placeCache = pgTable("place_cache", {
  googlePlaceId: text("google_place_id").primaryKey(),
  details: jsonb("details").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// Inferred types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;
export type CheckIn = typeof checkIns.$inferSelect;
export type NewCheckIn = typeof checkIns.$inferInsert;
export type WaitlistEntry = typeof waitlist.$inferSelect;
export type NewWaitlistEntry = typeof waitlist.$inferInsert;
export type SavedVenue = typeof savedVenues.$inferSelect;
export type NewSavedVenue = typeof savedVenues.$inferInsert;
