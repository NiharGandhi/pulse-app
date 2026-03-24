import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import OpenAI from "openai";
import { createHash } from "crypto";
import { db } from "../db/index.js";
import { venues, checkIns, searchCache, placeCache } from "../db/schema.js";
import { eq, gt, inArray } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import type { ApiResponse } from "../lib/types.js";

const app = new Hono();
const vibeSearchSchema = z.object({ query: z.string().min(1).max(500) });

const openai = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });
const GOOGLE_KEY = process.env["GOOGLE_PLACES_API_KEY"] ?? "";

// Location bias — set via env so this works for any city deployment
const DEFAULT_LAT = parseFloat(process.env["DEFAULT_CITY_LAT"] ?? "25.2048");
const DEFAULT_LNG = parseFloat(process.env["DEFAULT_CITY_LNG"] ?? "55.2708");
const DEFAULT_CITY = process.env["DEFAULT_CITY_NAME"] ?? "Dubai";
const SEARCH_RADIUS_METERS = parseInt(process.env["SEARCH_RADIUS_METERS"] ?? "25000", 10);
const CACHE_TTL_MS = parseInt(process.env["SEARCH_CACHE_TTL_HOURS"] ?? "12", 10) * 60 * 60 * 1000;

// ── Types ──────────────────────────────────────────────────────────────────────
type GooglePlace = {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  photos?: { photo_reference: string }[];
  opening_hours?: { open_now: boolean };
  price_level?: number;
  reviews?: { text: string; rating: number; relative_time_description: string; author_name: string }[];
  weekday_text?: string[];
};

type SearchPlan = {
  searchQueries: string[];         // 2-4 distinct Google Places queries to run in parallel
  intent: string;                  // human-readable description of what the user wants
  mustHave: string[];              // hard requirements to filter by
  niceToHave: string[];            // soft preferences for scoring
};

type ScoredPlace = GooglePlace & {
  relevanceScore: number;          // 0-10, AI-assigned
  relevanceReason: string;         // short explanation
};

export type VibeSearchResult = {
  googlePlaceId: string;
  dbVenueId: string | null;
  name: string;
  area: string;
  address: string;
  category: string | null;
  googleRating: number | null;
  totalRatings: number | null;
  photoReference: string | null;
  openNow: boolean | null;
  priceLevel: number | null;
  relevanceScore: number;
  liveSummary: {
    checkInCount: number;
    dominantBusyLevel: string | undefined;
    topVibeTags: string[];
    dominantViewStatus: string | undefined;
  } | null;
  aiSummary: string | null;
};

// ── POST /api/search/vibe (SSE streaming) ─────────────────────────────────────
app.post("/vibe", zValidator("json", vibeSearchSchema), async (c) => {
  const { query } = c.req.valid("json");
  const normalizedQuery = query.trim().toLowerCase();
  const queryHash = createHash("sha256").update(normalizedQuery).digest("hex").slice(0, 16);

  const stream = new ReadableStream({
    async start(controller) {
      function emit(event: string, data: unknown) {
        const chunk = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(chunk));
      }

      try {
        // ── Check cache ──
        const now = new Date();
        try {
          const [cached] = await db
            .select()
            .from(searchCache)
            .where(eq(searchCache.queryHash, queryHash))
            .limit(1);

          if (cached && cached.expiresAt > now) {
            logger.info({ query, queryHash }, "Search cache hit");
            emit("done", { success: true, data: cached.results });
            controller.close();
            return;
          }
        } catch (err) {
          logger.warn({ err }, "Cache read failed, proceeding without cache");
        }

        // ── Step 1: AI query decomposition ──
        emit("step", { step: "Analyzing your query..." });
        let plan: SearchPlan;
        try {
          plan = await decomposeQuery(query);
          logger.info({ query, plan }, "Search plan generated");
        } catch (err) {
          logger.error({ err }, "Query decomposition failed");
          emit("done", { success: false, error: "Search unavailable" });
          controller.close();
          return;
        }

        // ── Step 2: Parallel Google Places searches ──
        emit("step", { step: `Searching Google Places...` });
        const searchResults = await Promise.all(
          plan.searchQueries.map((q) => googleTextSearch(q))
        );

        const placeMap = new Map<string, GooglePlace & { _foundByQueries: string[]; _bestRank: number }>();
        for (let qi = 0; qi < searchResults.length; qi++) {
          const results = searchResults[qi]!;
          for (let rank = 0; rank < results.length; rank++) {
            const place = results[rank]!;
            const existing = placeMap.get(place.place_id);
            if (existing) {
              existing._foundByQueries.push(plan.searchQueries[qi]!);
              existing._bestRank = Math.min(existing._bestRank, rank + 1);
            } else {
              placeMap.set(place.place_id, {
                ...place,
                _foundByQueries: [plan.searchQueries[qi]!],
                _bestRank: rank + 1,
              });
            }
          }
        }
        const candidates = Array.from(placeMap.values());

        if (candidates.length === 0) {
          emit("done", { success: true, data: [] });
          controller.close();
          return;
        }

        // ── Step 3: Fetch place details ──
        emit("step", { step: `Reading reviews for ${candidates.length} places...` });
        const detailed = await Promise.all(
          candidates.map((p) => getPlaceDetailsWithCache(p))
        );

        // ── Step 4: AI re-ranking ──
        emit("step", { step: "Ranking results with AI..." });
        let ranked: ScoredPlace[];
        try {
          ranked = await rerankResults(query, plan, detailed);
        } catch (err) {
          logger.warn({ err }, "Re-ranking failed, using original order");
          ranked = detailed.map((p, i) => ({ ...p, relevanceScore: 10 - i, relevanceReason: "" }));
        }

        logger.info({ ranked: ranked.map(p => ({ name: p.name, score: p.relevanceScore })) }, "Re-ranked results");
        const filtered = ranked.filter((p) => p.relevanceScore >= 3);

        // ── Step 5: Layer DB vibe data ──
        const googlePlaceIds = filtered.map((p) => p.place_id);
        const dbVenues = googlePlaceIds.length > 0
          ? await db.select().from(venues).where(inArray(venues.googlePlaceId, googlePlaceIds))
          : [];
        const dbVenueMap = new Map(dbVenues.map((v) => [v.googlePlaceId, v]));

        const dbVenueIds = dbVenues.map((v) => v.id);
        const activeCheckIns = dbVenueIds.length > 0
          ? await db.select({
              venueId: checkIns.venueId,
              busyLevel: checkIns.busyLevel,
              vibeTags: checkIns.vibeTags,
              viewStatus: checkIns.viewStatus,
            })
            .from(checkIns)
            .where(
              dbVenueIds.length === 1
                ? eq(checkIns.venueId, dbVenueIds[0]!)
                : inArray(checkIns.venueId, dbVenueIds)
            )
            .then((rows) => rows.filter((r) => r.venueId !== null))
          : [];

        const vibeMap = new Map<string, { busyLevels: string[]; vibeTags: string[]; viewStatuses: string[] }>();
        for (const ci of activeCheckIns) {
          const e = vibeMap.get(ci.venueId) ?? { busyLevels: [], vibeTags: [], viewStatuses: [] };
          e.busyLevels.push(ci.busyLevel);
          e.vibeTags.push(...ci.vibeTags);
          e.viewStatuses.push(ci.viewStatus);
          vibeMap.set(ci.venueId, e);
        }

        // ── Step 6: Generate AI summaries ──
        emit("step", { step: "Generating vibe summaries..." });
        const summaries = await Promise.all(
          filtered.map((p) =>
            p.reviews && p.reviews.length > 0
              ? generateVibeSummary(p.name, p.reviews, query)
              : Promise.resolve(null)
          )
        );

        // ── Step 7: Build final response ──
        const results: VibeSearchResult[] = filtered.map((place, i) => {
          const dbVenue = dbVenueMap.get(place.place_id);
          const vibe = dbVenue ? vibeMap.get(dbVenue.id) : undefined;

          return {
            googlePlaceId: place.place_id,
            dbVenueId: dbVenue?.id ?? null,
            name: place.name,
            area: extractArea(place.formatted_address ?? place.vicinity ?? ""),
            address: place.formatted_address ?? place.vicinity ?? "",
            category: place.types?.[0]?.replace(/_/g, " ") ?? null,
            googleRating: place.rating ?? null,
            totalRatings: place.user_ratings_total ?? null,
            photoReference: place.photos?.[0]?.photo_reference ?? null,
            openNow: place.opening_hours?.open_now ?? null,
            priceLevel: place.price_level ?? null,
            relevanceScore: place.relevanceScore,
            liveSummary: vibe ? {
              checkInCount: vibe.busyLevels.length,
              dominantBusyLevel: mode(vibe.busyLevels),
              topVibeTags: topN(vibe.vibeTags, 3),
              dominantViewStatus: mode(vibe.viewStatuses),
            } : null,
            aiSummary: summaries[i] ?? null,
          };
        });

        // ── Write to cache ──
        const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
        try {
          await db.insert(searchCache).values({
            queryHash,
            query: normalizedQuery,
            results: results as unknown as Record<string, unknown>[],
            expiresAt,
          }).onConflictDoUpdate({
            target: searchCache.queryHash,
            set: { results: results as unknown as Record<string, unknown>[], expiresAt, createdAt: now },
          });
        } catch (err) {
          logger.warn({ err }, "Cache write failed");
        }

        emit("done", { success: true, data: results });
        controller.close();
      } catch (err) {
        logger.error({ err }, "Vibe search stream failed");
        try {
          const chunk = `event: done\ndata: ${JSON.stringify({ success: false, error: "Search failed" })}\n\n`;
          controller.enqueue(new TextEncoder().encode(chunk));
        } catch {}
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
});

// ── Step 1: Decompose query into multi-strategy search plan ───────────────────
async function decomposeQuery(query: string): Promise<SearchPlan> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a search strategist for a venue discovery app based in ${DEFAULT_CITY}.

Given a user's natural language query, generate a multi-angle search strategy.

Return JSON:
{
  "searchQueries": ["query1", "query2", "query3"],
  "intent": "one sentence describing exactly what the user wants",
  "mustHave": ["requirement1", "requirement2"],
  "niceToHave": ["pref1", "pref2"]
}

Rules for searchQueries:
- 2-4 distinct Google Places search strings, each from a different angle
- Include "${DEFAULT_CITY}" in each query
- Focus on the most distinctive requirements (cuisine, neighbourhood, unique features like views/live music/rooftop)
- Don't repeat the same search with minor wording changes
- If a neighbourhood/area is mentioned, include it in at least one query
- If cuisine is mentioned, include it in at least one query
- If ambiance features are mentioned (rooftop, views, live music, outdoor), dedicate one query to those`,
      },
      { role: "user", content: query },
    ],
  });

  const raw = completion.choices[0]?.message.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<SearchPlan>;

  return {
    searchQueries: (parsed.searchQueries ?? [query]).slice(0, 4),
    intent: parsed.intent ?? query,
    mustHave: parsed.mustHave ?? [],
    niceToHave: parsed.niceToHave ?? [],
  };
}

// ── Step 4: AI re-ranking ──────────────────────────────────────────────────────
async function rerankResults(
  originalQuery: string,
  plan: SearchPlan,
  places: (GooglePlace & { _foundByQueries?: string[]; _bestRank?: number })[]
): Promise<ScoredPlace[]> {
  if (places.length === 0) return [];

  const placeList = places.map((p, i) => ({
    index: i,
    name: p.name,
    address: p.formatted_address ?? p.vicinity ?? "",
    rating: p.rating,
    totalRatings: p.user_ratings_total,
    types: p.types?.slice(0, 5),
    // Google ranking signals — strong evidence of relevance
    googleBestRank: p._bestRank ?? 99,
    googleQueriesFound: p._foundByQueries ?? [],
    reviewSnippets: p.reviews?.slice(0, 5).map((r) => `[${r.rating}★] ${r.text.slice(0, 180)}`) ?? [],
  }));

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a Dubai venue expert and local insider. Score each venue for how well it matches the user's search intent.

User query: "${originalQuery}"
Intent: "${plan.intent}"
Must have: ${JSON.stringify(plan.mustHave)}
Nice to have: ${JSON.stringify(plan.niceToHave)}

Scoring guide (0–10):
- 9–10: Clearly matches all or nearly all requirements
- 7–8: Matches most requirements, minor gaps
- 4–6: Partial match — covers the main intent but missing some criteria
- 0–3: Clearly wrong category, wrong area, or fundamentally mismatched

IMPORTANT rules:
1. Use your knowledge of Dubai venues — don't rely only on reviews.
2. Infer cuisine from venue name and types array when reviews are silent.
3. Infer location from the address string — "Bay Square", "Marasi Dr", "Bay Avenue" = Business Bay.
4. googleBestRank and googleQueriesFound are STRONG signals. If a venue ranks #1 or #2 on Google for a query like "Indian cuisine with live music Business Bay", it almost certainly has those features — trust this even if reviews don't explicitly confirm it.
5. A venue found by multiple of your search queries is especially likely to be relevant.
6. Do NOT penalise a venue just because its review snippets don't mention a specific feature — reviews capture only a fraction of the experience.

Return JSON: { "scores": [{ "index": 0, "score": 8, "reason": "one sentence" }, ...] }`,
      },
      { role: "user", content: JSON.stringify(placeList) },
    ],
  });

  const raw = completion.choices[0]?.message.content ?? "{}";
  const parsed = JSON.parse(raw) as { scores?: { index: number; score: number; reason: string }[] };
  const scores = parsed.scores ?? [];

  const scoreMap = new Map(scores.map((s) => [s.index, s]));

  return places
    .map((p, i) => ({
      ...p,
      relevanceScore: scoreMap.get(i)?.score ?? 5,
      relevanceReason: scoreMap.get(i)?.reason ?? "",
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 15);
}

// ── Google Places Text Search ──────────────────────────────────────────────────
async function googleTextSearch(searchTerm: string): Promise<GooglePlace[]> {
  const params = new URLSearchParams({
    query: searchTerm,
    location: `${DEFAULT_LAT},${DEFAULT_LNG}`,
    radius: String(SEARCH_RADIUS_METERS),
    key: GOOGLE_KEY,
  });

  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
    if (!res.ok) return [];
    const data = await res.json() as { results?: GooglePlace[]; status?: string };
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      logger.warn({ status: data.status, searchTerm }, "Google Places non-OK status");
      return [];
    }
    return (data.results ?? []).slice(0, 10);
  } catch (err) {
    logger.error({ err, searchTerm }, "Google Text Search failed");
    return [];
  }
}

// ── Place Details with cache ───────────────────────────────────────────────────
async function getPlaceDetailsWithCache(place: GooglePlace): Promise<GooglePlace> {
  const now = new Date();

  try {
    const [cached] = await db
      .select()
      .from(placeCache)
      .where(eq(placeCache.googlePlaceId, place.place_id))
      .limit(1);

    if (cached && cached.expiresAt > now) {
      return { ...place, ...(cached.details as object) };
    }
  } catch { /* ignore cache miss */ }

  // Fetch from Google
  const params = new URLSearchParams({
    place_id: place.place_id,
    fields: "reviews,opening_hours,price_level,formatted_address,formatted_phone_number,website",
    key: GOOGLE_KEY,
  });

  let details: Partial<GooglePlace> = {};
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
    if (res.ok) {
      const data = await res.json() as { result?: Partial<GooglePlace> };
      details = data.result ?? {};
    }
  } catch { /* ignore */ }

  // Write to cache
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days for place details
  try {
    await db.insert(placeCache).values({
      googlePlaceId: place.place_id,
      details: details as unknown as Record<string, unknown>,
      expiresAt,
    }).onConflictDoUpdate({
      target: placeCache.googlePlaceId,
      set: { details: details as unknown as Record<string, unknown>, expiresAt },
    });
  } catch { /* ignore */ }

  return { ...place, ...details };
}

// ── AI Vibe Summary (query-aware) ──────────────────────────────────────────────
async function generateVibeSummary(
  placeName: string,
  reviews: { text: string; rating: number; relative_time_description: string; author_name: string }[],
  originalQuery: string,
): Promise<string | null> {
  try {
    const reviewText = reviews.slice(0, 5)
      .map((r) => `[${r.rating}★] ${r.text.slice(0, 200)}`)
      .join("\n");

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 60,
      messages: [
        {
          role: "system",
          content: `Write a 1-sentence vibe description for a Dubai venue. Max 18 words. Sound like a knowledgeable local friend. Highlight what's relevant to the user's search: "${originalQuery}". Be specific and honest.`,
        },
        {
          role: "user",
          content: `Venue: ${placeName}\n\nReviews:\n${reviewText}`,
        },
      ],
    });

    return res.choices[0]?.message.content?.trim() ?? null;
  } catch {
    return null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Extracts a human-readable neighbourhood/district from a Google-formatted address.
 * Works for any city — no hardcoded list. Google addresses follow the pattern:
 *   "Street, District, City - State, Country"
 * We take the first component that isn't a street number, street name, or country,
 * falling back to the city name itself.
 */
function extractArea(address: string): string {
  if (!address) return "";
  // Remove country suffix
  const withoutCountry = address.split(" - ").slice(0, -1).join(" - ").trim() || address;
  // Split on commas
  const parts = withoutCountry.split(",").map((p) => p.trim()).filter(Boolean);
  // Skip the first part if it looks like a street (contains digits = street number/PO box)
  const streetPattern = /^\d|^p\.?o\.?\s*box/i;
  const meaningful = parts.filter((p) => !streetPattern.test(p));
  // Return the second meaningful component (district) or first
  return meaningful[1] ?? meaningful[0] ?? parts[0] ?? "Dubai";
}

function mode(arr: string[]): string | undefined {
  const counts: Record<string, number> = {};
  for (const item of arr) counts[item] = (counts[item] ?? 0) + 1;
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0];
}

function topN(arr: string[], n: number): string[] {
  const counts: Record<string, number> = {};
  for (const item of arr) counts[item] = (counts[item] ?? 0) + 1;
  return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, n).map(([tag]) => tag);
}

export default app;
