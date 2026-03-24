import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db/index.js";
import { venues, checkIns } from "../db/schema.js";
import { eq, gt, and } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import type { ApiResponse } from "../lib/types.js";

const app = new Hono();

const upsertVenueSchema = z.object({
  googlePlaceId: z.string().min(1),
  name: z.string().min(1),
  area: z.string().optional(),
  category: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  googleRating: z.string().optional(),
  photoReference: z.string().optional(),
});

// GET /api/venues/nearby?lat=&lng=&radius=&keyword= — Google Places Nearby Search
app.get("/nearby", async (c) => {
  const lat = c.req.query("lat") ?? "25.2048";
  const lng = c.req.query("lng") ?? "55.2708";
  const radius = c.req.query("radius") ?? "5000";
  const keyword = c.req.query("keyword") ?? "";

  const apiKey = process.env["GOOGLE_PLACES_API_KEY"];
  if (!apiKey) {
    return c.json<ApiResponse<never>>(
      { success: false, error: "Places unavailable" },
      503
    );
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
  );
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", radius);
  url.searchParams.set("type", "restaurant");
  if (keyword) url.searchParams.set("keyword", keyword);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = (await response.json()) as {
    results: GooglePlaceResult[];
    status: string;
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    logger.error({ status: data.status }, "Google Places nearby search failed");
    return c.json<ApiResponse<never>>(
      { success: false, error: "Places search failed" },
      502
    );
  }

  const results = (data.results ?? []).slice(0, 12).map(mapGooglePlace);
  return c.json<ApiResponse<typeof results>>({ success: true, data: results });
});

// GET /api/venues/details/:placeId — Google Place Details API
app.get("/details/:placeId", async (c) => {
  const placeId = c.req.param("placeId");
  const apiKey = process.env["GOOGLE_PLACES_API_KEY"];
  if (!apiKey) {
    return c.json<ApiResponse<never>>({ success: false, error: "Places unavailable" }, 503);
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "name,formatted_address,rating,user_ratings_total,price_level,formatted_phone_number,website,opening_hours,photos,reviews,geometry,types"
  );
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = (await response.json()) as { result: GooglePlaceDetails; status: string };

  if (data.status !== "OK") {
    return c.json<ApiResponse<never>>({ success: false, error: "Place not found" }, 404);
  }

  return c.json<ApiResponse<GooglePlaceDetails>>({ success: true, data: data.result });
});

// GET /api/venues/search?q= — proxy to Google Places
app.get("/search", async (c) => {
  const q = c.req.query("q");
  if (!q) {
    return c.json<ApiResponse<never>>(
      { success: false, error: "q query param is required" },
      400
    );
  }

  const apiKey = process.env["GOOGLE_PLACES_API_KEY"];
  if (!apiKey) {
    logger.error("GOOGLE_PLACES_API_KEY not set");
    return c.json<ApiResponse<never>>(
      { success: false, error: "Venue search unavailable" },
      503
    );
  }

  // Bias results toward Dubai
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/textsearch/json"
  );
  url.searchParams.set("query", `${q} Dubai`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("location", "25.2048,55.2708"); // Dubai center
  url.searchParams.set("radius", "50000");

  const response = await fetch(url.toString());
  if (!response.ok) {
    logger.error({ status: response.status }, "Google Places API error");
    return c.json<ApiResponse<never>>(
      { success: false, error: "Venue search failed" },
      502
    );
  }

  const googleData = (await response.json()) as {
    results: GooglePlaceResult[];
    status: string;
  };

  const results = (googleData.results ?? []).map(mapGooglePlace);

  return c.json<ApiResponse<typeof results>>({ success: true, data: results });
});

// GET /api/venues/:id — venue detail + live check-in summary
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const now = new Date();

  const [venue] = await db
    .select()
    .from(venues)
    .where(eq(venues.id, id))
    .limit(1);

  if (!venue) {
    return c.json<ApiResponse<never>>(
      { success: false, error: "Venue not found" },
      404
    );
  }

  const activeCheckIns = await db
    .select({
      busyLevel: checkIns.busyLevel,
      vibeTags: checkIns.vibeTags,
      viewStatus: checkIns.viewStatus,
    })
    .from(checkIns)
    .where(and(eq(checkIns.venueId, id), gt(checkIns.expiresAt, now)));

  const summary = computeVibeSummary(activeCheckIns);

  return c.json<ApiResponse<{ venue: typeof venue; summary: typeof summary }>>({
    success: true,
    data: { venue, summary },
  });
});

// POST /api/venues — create or upsert venue from Google Places data
app.post("/", zValidator("json", upsertVenueSchema), async (c) => {
  const body = c.req.valid("json");

  const [upserted] = await db
    .insert(venues)
    .values({
      googlePlaceId: body.googlePlaceId,
      name: body.name,
      area: body.area ?? null,
      category: body.category ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      googleRating: body.googleRating ?? null,
      photoReference: body.photoReference ?? null,
    })
    .onConflictDoUpdate({
      target: venues.googlePlaceId,
      set: {
        name: body.name,
        area: body.area ?? null,
        category: body.category ?? null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        googleRating: body.googleRating ?? null,
        photoReference: body.photoReference ?? null,
      },
    })
    .returning();

  if (!upserted) {
    return c.json<ApiResponse<never>>(
      { success: false, error: "Failed to upsert venue" },
      500
    );
  }

  return c.json<ApiResponse<typeof upserted>>(
    { success: true, data: upserted },
    201
  );
});

// Types for Google Places API response
type GooglePlaceDetails = {
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: { weekday_text: string[]; open_now: boolean };
  photos?: Array<{ photo_reference: string; width: number; height: number }>;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    relative_time_description: string;
    profile_photo_url: string;
  }>;
  geometry?: { location: { lat: number; lng: number } };
  types?: string[];
};

type GooglePlaceResult = {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: { location: { lat: number; lng: number } };
  rating?: number;
  types?: string[];
  photos?: Array<{ photo_reference: string }>;
};

function mapGooglePlace(place: GooglePlaceResult) {
  return {
    googlePlaceId: place.place_id,
    name: place.name,
    area: extractArea(place.formatted_address),
    category: extractCategory(place.types),
    latitude: place.geometry?.location.lat.toString(),
    longitude: place.geometry?.location.lng.toString(),
    googleRating: place.rating?.toString(),
    photoReference: place.photos?.[0]?.photo_reference,
  };
}

function extractArea(address?: string): string | undefined {
  if (!address) return undefined;
  // Dubai areas are typically the 2nd-to-last component before UAE
  const parts = address.split(",").map((p) => p.trim());
  const dubaiIndex = parts.findIndex((p) =>
    p.toLowerCase().includes("dubai")
  );
  if (dubaiIndex > 0) return parts[dubaiIndex - 1];
  return undefined;
}

function extractCategory(types?: string[]): string | undefined {
  if (!types) return undefined;
  const categoryMap: Record<string, string> = {
    restaurant: "restaurant",
    cafe: "cafe",
    bar: "bar",
    night_club: "nightclub",
    food: "restaurant",
    establishment: "venue",
  };
  for (const type of types) {
    if (type in categoryMap) return categoryMap[type];
  }
  return "venue";
}

function computeVibeSummary(
  activeCheckIns: Array<{
    busyLevel: string;
    vibeTags: string[];
    viewStatus: string;
  }>
) {
  if (activeCheckIns.length === 0) return null;

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

  return {
    checkInCount: activeCheckIns.length,
    dominantBusyLevel: Object.entries(busyCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0],
    topVibeTags: Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag),
    dominantViewStatus: Object.entries(viewCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0],
  };
}

export default app;
