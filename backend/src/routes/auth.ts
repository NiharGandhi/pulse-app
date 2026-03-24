import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { signToken, verifyToken } from "../lib/jwt.js";
import type { ApiResponse } from "../lib/types.js";

const app = new Hono();

type UserOut = { id: string; email: string; name: string; username: string | null; avatarUrl: string | null };

// POST /api/auth/register
app.post("/register", async (c) => {
  const body = await c.req.json<{ email: string; password: string; name: string }>();
  const { email, password, name } = body ?? {};

  if (!email || !password || !name) {
    return c.json<ApiResponse<never>>({ success: false, error: "email, password, and name are required" }, 400);
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    return c.json<ApiResponse<never>>({ success: false, error: "Email already registered" }, 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(users)
    .values({ email: email.toLowerCase(), passwordHash, name })
    .returning({ id: users.id, email: users.email, name: users.name, username: users.username, avatarUrl: users.avatarUrl });

  if (!user) return c.json<ApiResponse<never>>({ success: false, error: "Failed to create user" }, 500);

  const token = await signToken(user.id);
  return c.json<ApiResponse<{ token: string; user: UserOut }>>({ success: true, data: { token, user } }, 201);
});

// POST /api/auth/login
app.post("/login", async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();
  const { email, password } = body ?? {};

  if (!email || !password) {
    return c.json<ApiResponse<never>>({ success: false, error: "email and password are required" }, 400);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return c.json<ApiResponse<never>>({ success: false, error: "Invalid email or password" }, 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return c.json<ApiResponse<never>>({ success: false, error: "Invalid email or password" }, 401);
  }

  const token = await signToken(user.id);
  const userOut: UserOut = { id: user.id, email: user.email, name: user.name, username: user.username, avatarUrl: user.avatarUrl };
  return c.json<ApiResponse<{ token: string; user: UserOut }>>({ success: true, data: { token, user: userOut } });
});

// GET /api/auth/me
app.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json<ApiResponse<never>>({ success: false, error: "Unauthorized" }, 401);
  }

  try {
    const { userId } = await verifyToken(authHeader.slice(7));
    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return c.json<ApiResponse<never>>({ success: false, error: "User not found" }, 404);

    return c.json<ApiResponse<UserOut>>({ success: true, data: user });
  } catch {
    return c.json<ApiResponse<never>>({ success: false, error: "Invalid token" }, 401);
  }
});

export default app;
