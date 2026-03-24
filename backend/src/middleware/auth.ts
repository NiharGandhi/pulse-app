import { createMiddleware } from "hono/factory";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { verifyToken } from "../lib/jwt.js";
import type { AuthUser } from "../lib/types.js";

type AuthEnv = {
  Variables: { authUser: AuthUser };
};

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  try {
    const { userId } = await verifyToken(authHeader.slice(7));
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return c.json({ success: false, error: "User not found" }, 401);

    c.set("authUser", { dbUserId: user.id, email: user.email });
    await next();
  } catch {
    return c.json({ success: false, error: "Invalid token" }, 401);
  }
});
