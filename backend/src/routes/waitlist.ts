import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db/index.js";
import { waitlist } from "../db/schema.js";
import { count, eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import type { ApiResponse } from "../lib/types.js";

const app = new Hono();

const joinWaitlistSchema = z.object({
  email: z.string().email(),
});

// POST /api/waitlist — join the waitlist, returns position number
app.post("/", zValidator("json", joinWaitlistSchema), async (c) => {
  const { email } = c.req.valid("json");

  // Check if already on the waitlist
  const [existing] = await db
    .select({ id: waitlist.id, position: waitlist.position })
    .from(waitlist)
    .where(eq(waitlist.email, email))
    .limit(1);

  if (existing) {
    return c.json<ApiResponse<{ position: number; alreadyJoined: boolean }>>({
      success: true,
      data: { position: existing.position ?? 0, alreadyJoined: true },
    });
  }

  // Count current waitlist entries to determine position
  const countResult = await db.select({ value: count() }).from(waitlist);
  const currentCount = countResult[0]?.value ?? 0;
  const position = currentCount + 1;

  const [entry] = await db
    .insert(waitlist)
    .values({ email, position })
    .returning();

  if (!entry) {
    logger.error({ email }, "Failed to insert waitlist entry");
    return c.json<ApiResponse<never>>(
      { success: false, error: "Failed to join waitlist" },
      500
    );
  }

  return c.json<ApiResponse<{ position: number; alreadyJoined: boolean }>>(
    { success: true, data: { position, alreadyJoined: false } },
    201
  );
});

export default app;
