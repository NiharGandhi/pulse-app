import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db/index.js";
import { checkIns, users, venues } from "../db/schema.js";
import { eq, gt, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";
import type { ApiResponse } from "../lib/types.js";

type AuthEnv = {
  Variables: {
    authUser: { dbUserId: string; email: string };
  };
};

const app = new Hono<AuthEnv>();

const createCheckInSchema = z.object({
  venueId: z.string().uuid(),
  busyLevel: z.enum(["dead", "moderate", "packed"]),
  vibeTags: z
    .array(z.enum(["chill", "lively", "loud", "romantic"]))
    .min(0)
    .max(4),
  viewStatus: z.enum(["clear", "blocked", "na"]).default("na"),
  photoUrl: z.string().url().optional(),
  isAnonymous: z.boolean().default(false),
});

// POST /api/checkins — create a check-in
app.post("/", requireAuth, zValidator("json", createCheckInSchema), async (c) => {
  const authUser = c.get("authUser");
  const body = c.req.valid("json");

  // Verify venue exists
  const [venue] = await db
    .select({ id: venues.id })
    .from(venues)
    .where(eq(venues.id, body.venueId))
    .limit(1);

  if (!venue) {
    return c.json<ApiResponse<never>>(
      { success: false, error: "Venue not found" },
      404
    );
  }

  // Rate limit: one check-in per user per venue per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [recentCheckIn] = await db
    .select({ id: checkIns.id })
    .from(checkIns)
    .where(
      and(
        eq(checkIns.userId, authUser.dbUserId),
        eq(checkIns.venueId, body.venueId),
        gt(checkIns.createdAt, oneHourAgo)
      )
    )
    .limit(1);

  if (recentCheckIn) {
    return c.json<ApiResponse<never>>(
      { success: false, error: "You already checked in here within the last hour" },
      429
    );
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const [created] = await db
    .insert(checkIns)
    .values({
      venueId: body.venueId,
      userId: authUser.dbUserId,
      busyLevel: body.busyLevel,
      vibeTags: body.vibeTags,
      viewStatus: body.viewStatus,
      photoUrl: body.photoUrl ?? null,
      isAnonymous: body.isAnonymous,
      createdAt: now,
      expiresAt,
    })
    .returning();

  if (!created) {
    logger.error("Failed to create check-in");
    return c.json<ApiResponse<never>>(
      { success: false, error: "Failed to create check-in" },
      500
    );
  }

  const sanitized = {
    ...created,
    userId: created.isAnonymous ? null : created.userId,
  };

  return c.json<ApiResponse<typeof sanitized>>(
    { success: true, data: sanitized },
    201
  );
});

// GET /api/checkins/venue/:venueId — active check-ins for a venue
app.get("/venue/:venueId", async (c) => {
  const venueId = c.req.param("venueId");
  const now = new Date();

  const activeCheckIns = await db
    .select({
      id: checkIns.id,
      venueId: checkIns.venueId,
      userId: checkIns.userId,
      busyLevel: checkIns.busyLevel,
      vibeTags: checkIns.vibeTags,
      viewStatus: checkIns.viewStatus,
      photoUrl: checkIns.photoUrl,
      isAnonymous: checkIns.isAnonymous,
      createdAt: checkIns.createdAt,
      expiresAt: checkIns.expiresAt,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(checkIns)
    .leftJoin(users, eq(checkIns.userId, users.id))
    .where(and(eq(checkIns.venueId, venueId), gt(checkIns.expiresAt, now)))
    .orderBy(desc(checkIns.createdAt));

  const sanitized = activeCheckIns.map((ci) => ({
    ...ci,
    userId: ci.isAnonymous ? null : ci.userId,
    username: ci.isAnonymous ? null : ci.username,
    avatarUrl: ci.isAnonymous ? null : ci.avatarUrl,
  }));

  // Compute aggregate vibe summary
  const summary = computeVibeSummary(activeCheckIns);

  return c.json<ApiResponse<{ checkIns: typeof sanitized; summary: typeof summary }>>({
    success: true,
    data: { checkIns: sanitized, summary },
  });
});

// GET /api/checkins/feed?lat=&lng=&radius= — live feed near a location
app.get("/feed", async (c) => {
  const lat = parseFloat(c.req.query("lat") ?? "");
  const lng = parseFloat(c.req.query("lng") ?? "");
  const radius = parseFloat(c.req.query("radius") ?? "5"); // km, default 5

  if (isNaN(lat) || isNaN(lng)) {
    return c.json<ApiResponse<never>>(
      { success: false, error: "lat and lng query params are required" },
      400
    );
  }

  const now = new Date();

  // Get venues within radius, including those with no active check-ins
  const feedVenues = await db.execute(sql`
    SELECT
      v.id,
      v.google_place_id,
      v.name,
      v.area,
      v.category,
      v.latitude,
      v.longitude,
      v.google_rating,
      v.photo_reference,
      v.created_at,
      COALESCE(COUNT(ci.id), 0) AS checkin_count,
      MAX(ci.created_at) AS last_checkin_at,
      COALESCE(ARRAY_AGG(DISTINCT tag) FILTER (WHERE tag IS NOT NULL), '{}') AS all_vibe_tags,
      MODE() WITHIN GROUP (ORDER BY ci.busy_level) AS dominant_busy_level,
      (
        6371 * acos(
          LEAST(1.0, cos(radians(${lat})) * cos(radians(v.latitude::float)) *
          cos(radians(v.longitude::float) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(v.latitude::float)))
        )
      ) AS distance_km
    FROM venues v
    LEFT JOIN check_ins ci ON ci.venue_id = v.id AND ci.expires_at > ${now}
    LEFT JOIN LATERAL unnest(ci.vibe_tags) AS tag ON true
    WHERE v.latitude IS NOT NULL AND v.longitude IS NOT NULL
    GROUP BY v.id
    HAVING (
      6371 * acos(
        LEAST(1.0, cos(radians(${lat})) * cos(radians(v.latitude::float)) *
        cos(radians(v.longitude::float) - radians(${lng})) +
        sin(radians(${lat})) * sin(radians(v.latitude::float)))
      )
    ) <= ${radius}
    ORDER BY checkin_count DESC, last_checkin_at DESC NULLS LAST
    LIMIT 50
  `);

  return c.json<ApiResponse<typeof feedVenues.rows>>({
    success: true,
    data: feedVenues.rows,
  });
});

function computeVibeSummary(
  activeCheckIns: Array<{
    busyLevel: string;
    vibeTags: string[];
    viewStatus: string;
  }>
) {
  if (activeCheckIns.length === 0) {
    return null;
  }

  const busyCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  const viewCounts: Record<string, number> = {};

  for (const ci of activeCheckIns) {
    busyCounts[ci.busyLevel] = (busyCounts[ci.busyLevel] ?? 0) + 1;
    viewCounts[ci.viewStatus] = (viewCounts[ci.viewStatus] ?? 0) + 1;
    for (const tag of ci.vibeTags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  const dominantBusyLevel = Object.entries(busyCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];

  const topVibeTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => tag);

  const dominantViewStatus = Object.entries(viewCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];

  return {
    checkInCount: activeCheckIns.length,
    dominantBusyLevel,
    topVibeTags,
    dominantViewStatus,
  };
}

export default app;
