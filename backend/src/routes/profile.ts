import { Hono } from "hono";
import { db } from "../db/index.js";
import { checkIns, savedVenues, users } from "../db/schema.js";
import { eq, sql, and, gte } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import type { ApiResponse } from "../lib/types.js";

type AuthEnv = {
  Variables: { authUser: { dbUserId: string; email: string } };
};

const app = new Hono<AuthEnv>();

// ── Badge definitions ──────────────────────────────────────────────────────────
export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  earned: boolean;
};

type StatsInput = {
  checkInCount: number;
  photoCount: number;
  uniqueVenues: number;
  currentStreak: number;
  isTopTen: boolean;
  lateNightCount: number;
  earlyBirdCount: number;
};

function computeBadges(stats: StatsInput): Badge[] {
  const { checkInCount, photoCount, uniqueVenues, currentStreak, isTopTen, lateNightCount, earlyBirdCount } = stats;
  return [
    {
      id: "first_timer",
      name: "First Timer",
      description: "Made your first check-in",
      icon: "MapPin",
      earned: checkInCount >= 1,
    },
    {
      id: "regular",
      name: "Regular",
      description: "10 check-ins and counting",
      icon: "Repeat",
      earned: checkInCount >= 10,
    },
    {
      id: "explorer",
      name: "Explorer",
      description: "Checked in at 5 different venues",
      icon: "Compass",
      earned: uniqueVenues >= 5,
    },
    {
      id: "photographer",
      name: "Photographer",
      description: "Shared 3 photos with the community",
      icon: "Camera",
      earned: photoCount >= 3,
    },
    {
      id: "night_owl",
      name: "Night Owl",
      description: "Checked in after midnight",
      icon: "Moon",
      earned: lateNightCount >= 1,
    },
    {
      id: "early_bird",
      name: "Early Bird",
      description: "Checked in before 9am",
      icon: "Sunrise",
      earned: earlyBirdCount >= 1,
    },
    {
      id: "streak_3",
      name: "On a Roll",
      description: "3-day check-in streak",
      icon: "Flame",
      earned: currentStreak >= 3,
    },
    {
      id: "top_ten",
      name: "Top Contributor",
      description: "Ranked in the top 10 leaderboard",
      icon: "Trophy",
      earned: isTopTen,
    },
    {
      id: "centurion",
      name: "Centurion",
      description: "100 check-ins — legendary",
      icon: "Star",
      earned: checkInCount >= 100,
    },
  ];
}

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const uniqueDays = [...new Set(dates.map((d) => d.toISOString().slice(0, 10)))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  if (uniqueDays[0] !== today && uniqueDays[0] !== getPrevDay(today)) return 0;
  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i] === getPrevDay(uniqueDays[i - 1]!)) streak++;
    else break;
  }
  return streak;
}

function getPrevDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ── GET /api/user/profile ──────────────────────────────────────────────────────
app.get("/profile", requireAuth, async (c) => {
  const { dbUserId } = c.get("authUser");

  const [userRow, allCheckIns, savedCount, leaderboardRows] = await Promise.all([
    db.select().from(users).where(eq(users.id, dbUserId)).limit(1),
    db.select({
      id: checkIns.id,
      createdAt: checkIns.createdAt,
      photoUrl: checkIns.photoUrl,
      venueId: checkIns.venueId,
    }).from(checkIns).where(eq(checkIns.userId, dbUserId)),
    db.select({ count: sql<number>`count(*)::int` })
      .from(savedVenues)
      .where(eq(savedVenues.userId, dbUserId)),
    db.execute(sql`
      SELECT u.id, (COUNT(ci.id) * 10 + COUNT(ci.photo_url) * 25) AS points
      FROM users u
      INNER JOIN check_ins ci ON ci.user_id = u.id
      GROUP BY u.id
      ORDER BY points DESC
      LIMIT 10
    `),
  ]);

  const user = userRow[0];
  if (!user) return c.json<ApiResponse<never>>({ success: false, error: "User not found" }, 404);

  const checkInCount = allCheckIns.length;
  const photoCount = allCheckIns.filter((ci) => ci.photoUrl).length;
  const uniqueVenues = new Set(allCheckIns.map((ci) => ci.venueId)).size;
  const points = checkInCount * 10 + photoCount * 25;
  const savedCountVal = savedCount[0]?.count ?? 0;

  const checkInDates = allCheckIns.map((ci) => new Date(ci.createdAt));
  const currentStreak = computeStreak(checkInDates);

  // Night owl (after midnight = hour >= 22 or hour < 4) / early bird (hour < 9)
  const lateNightCount = checkInDates.filter((d) => d.getHours() >= 22 || d.getHours() < 4).length;
  const earlyBirdCount = checkInDates.filter((d) => d.getHours() < 9).length;

  const topTenIds = new Set((leaderboardRows.rows as { id: string }[]).map((r) => r.id));
  const isTopTen = topTenIds.has(dbUserId);

  const badges = computeBadges({ checkInCount, photoCount, uniqueVenues, currentStreak, isTopTen, lateNightCount, earlyBirdCount });

  return c.json<ApiResponse<{
    user: { id: string; email: string; name: string; username: string | null; avatarUrl: string | null; createdAt: string };
    stats: { checkInCount: number; points: number; photoCount: number; savedCount: number; uniqueVenues: number; currentStreak: number };
    badges: Badge[];
  }>>({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
      stats: { checkInCount, points, photoCount, savedCount: savedCountVal, uniqueVenues, currentStreak },
      badges,
    },
  });
});

// ── GET /api/user/contributions ────────────────────────────────────────────────
// Returns check-in counts grouped by day for the last 52 weeks
app.get("/contributions", requireAuth, async (c) => {
  const { dbUserId } = c.get("authUser");

  const since = new Date();
  since.setDate(since.getDate() - 364);

  const rows = await db
    .select({
      date: sql<string>`to_char(${checkIns.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(checkIns)
    .where(and(eq(checkIns.userId, dbUserId), gte(checkIns.createdAt, since)))
    .groupBy(sql`to_char(${checkIns.createdAt}, 'YYYY-MM-DD')`);

  return c.json<ApiResponse<Array<{ date: string; count: number }>>>({
    success: true,
    data: rows.map((r) => ({ date: r.date, count: r.count })),
  });
});

export default app;
