import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestLogger } from "./middleware/requestLogger.js";
import { logger } from "./lib/logger.js";
import checkinsRouter from "./routes/checkins.js";
import venuesRouter from "./routes/venues.js";
import searchRouter from "./routes/search.js";
import waitlistRouter from "./routes/waitlist.js";
import uploadRouter from "./routes/upload.js";
import webhooksRouter from "./routes/webhooks.js";
import leaderboardRouter from "./routes/leaderboard.js";
import savedRouter from "./routes/saved.js";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";

const app = new Hono();

// CORS — allow frontend dev origin
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      process.env["FRONTEND_URL"] ?? "http://localhost:3000",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("*", requestLogger);

// Health check
app.get("/health", (c) => c.json({ status: "ok", ts: new Date().toISOString() }));

// API routes
app.route("/api/checkins", checkinsRouter);
app.route("/api/venues", venuesRouter);
app.route("/api/search", searchRouter);
app.route("/api/waitlist", waitlistRouter);
app.route("/api/upload", uploadRouter);
app.route("/api/webhooks", webhooksRouter);
app.route("/api/leaderboard", leaderboardRouter);
app.route("/api/user/saved", savedRouter);
app.route("/api/user", profileRouter);
app.route("/api/auth", authRouter);

// 404 fallback
app.notFound((c) =>
  c.json({ success: false, error: `Route ${c.req.method} ${c.req.path} not found` }, 404)
);

// Global error handler
app.onError((err, c) => {
  logger.error({ err }, "Unhandled error");
  return c.json({ success: false, error: "Internal server error" }, 500);
});

const port = parseInt(process.env["PORT"] ?? "3001", 10);

serve({ fetch: app.fetch, port }, () => {
  logger.info(`Pulse backend running on http://localhost:${port}`);
});
