import { Hono } from "hono";

const app = new Hono();

// Clerk webhooks removed — custom auth is used instead
app.post("/clerk", (c) => c.json({ received: true }));

export default app;
