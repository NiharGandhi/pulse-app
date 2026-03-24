import { Hono } from "hono";
import { db } from "../db/index.js";
import { savedVenues, venues } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import type { ApiResponse } from "../lib/types.js";

type AuthEnv = {
  Variables: { authUser: { dbUserId: string; email: string } };
};

const app = new Hono<AuthEnv>();

// GET /api/user/saved — list saved venues for the authenticated user
app.get("/", requireAuth, async (c) => {
  const { dbUserId } = c.get("authUser");

  const rows = await db
    .select({ venue: venues })
    .from(savedVenues)
    .innerJoin(venues, eq(savedVenues.venueId, venues.id))
    .where(eq(savedVenues.userId, dbUserId));

  return c.json<ApiResponse<(typeof rows[0]["venue"])[]>>({
    success: true,
    data: rows.map((r) => r.venue),
  });
});

// POST /api/user/saved/:venueId — save a venue
app.post("/:venueId", requireAuth, async (c) => {
  const { dbUserId } = c.get("authUser");
  const venueId = c.req.param("venueId");

  // Idempotent — ignore conflict
  await db
    .insert(savedVenues)
    .values({ userId: dbUserId, venueId })
    .onConflictDoNothing();

  return c.json<ApiResponse<{ saved: true }>>({ success: true, data: { saved: true } });
});

// DELETE /api/user/saved/:venueId — unsave
app.delete("/:venueId", requireAuth, async (c) => {
  const { dbUserId } = c.get("authUser");
  const venueId = c.req.param("venueId");

  await db
    .delete(savedVenues)
    .where(and(eq(savedVenues.userId, dbUserId), eq(savedVenues.venueId, venueId)));

  return c.json<ApiResponse<{ saved: false }>>({ success: true, data: { saved: false } });
});

export default app;
