import { Hono } from "hono";
import { db } from "../db/index.js";
import { checkIns, users } from "../db/schema.js";
import { sql, desc } from "drizzle-orm";
import type { ApiResponse } from "../lib/types.js";

const app = new Hono();

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  points: number;
  checkInCount: number;
  photoCount: number;
};

// GET /api/leaderboard — top users by points (derived from check-ins)
// Points: +10 per check-in, +25 if photo included, +50 if first check-in at that venue ever
app.get("/", async (c) => {
  const rows = await db.execute(sql`
    SELECT
      u.id AS user_id,
      u.username,
      u.avatar_url,
      COUNT(ci.id) AS checkin_count,
      COUNT(ci.photo_url) AS photo_count,
      (
        COUNT(ci.id) * 10 +
        COUNT(ci.photo_url) * 25
      ) AS points
    FROM users u
    INNER JOIN check_ins ci ON ci.user_id = u.id
    WHERE u.id IS NOT NULL
    GROUP BY u.id
    ORDER BY points DESC
    LIMIT 50
  `);

  const entries: LeaderboardEntry[] = rows.rows.map((row, i) => ({
    rank: i + 1,
    userId: row["user_id"] as string,
    username: (row["username"] as string | null) ?? null,
    avatarUrl: (row["avatar_url"] as string | null) ?? null,
    points: Number(row["points"]),
    checkInCount: Number(row["checkin_count"]),
    photoCount: Number(row["photo_count"]),
  }));

  return c.json<ApiResponse<LeaderboardEntry[]>>({
    success: true,
    data: entries,
  });
});

export default app;
