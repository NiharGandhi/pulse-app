/**
 * Seed script: creates test venues + check-ins so the feed has data.
 * Run with: npm run seed
 */
import { db } from "../db/index.js";
import { venues, users, checkIns } from "../db/schema.js";

const TEST_VENUES = [
  {
    googlePlaceId: "test_coya_difc",
    name: "COYA Dubai",
    area: "DIFC",
    category: "restaurant",
    latitude: "25.2122",
    longitude: "55.2796",
    googleRating: "4.6",
    photoReference: null,
  },
  {
    googlePlaceId: "test_nobu_atlantis",
    name: "Nobu Atlantis",
    area: "Palm Jumeirah",
    category: "restaurant",
    latitude: "25.1301",
    longitude: "55.1172",
    googleRating: "4.5",
    photoReference: null,
  },
  {
    googlePlaceId: "test_white_dubai",
    name: "WHITE Dubai",
    area: "Business Bay",
    category: "nightclub",
    latitude: "25.1876",
    longitude: "55.2764",
    googleRating: "4.3",
    photoReference: null,
  },
  {
    googlePlaceId: "test_iris_difc",
    name: "Iris Dubai",
    area: "DIFC",
    category: "bar",
    latitude: "25.2131",
    longitude: "55.2809",
    googleRating: "4.2",
    photoReference: null,
  },
  {
    googlePlaceId: "test_tom_and_serg",
    name: "Tom & Serg",
    area: "Al Quoz",
    category: "cafe",
    latitude: "25.1453",
    longitude: "55.2190",
    googleRating: "4.7",
    photoReference: null,
  },
  {
    googlePlaceId: "test_nammos_dubai",
    name: "Nammos Dubai",
    area: "Palm Jumeirah",
    category: "restaurant",
    latitude: "25.1289",
    longitude: "55.1164",
    googleRating: "4.4",
    photoReference: null,
  },
];

const TEST_CHECK_INS: Array<{
  venueIndex: number;
  busyLevel: "dead" | "moderate" | "packed";
  vibeTags: string[];
  viewStatus: "clear" | "blocked" | "na";
  minutesAgo: number;
}> = [
  { venueIndex: 0, busyLevel: "packed", vibeTags: ["lively", "loud"], viewStatus: "na", minutesAgo: 10 },
  { venueIndex: 0, busyLevel: "packed", vibeTags: ["lively"], viewStatus: "na", minutesAgo: 35 },
  { venueIndex: 1, busyLevel: "moderate", vibeTags: ["romantic", "chill"], viewStatus: "clear", minutesAgo: 20 },
  { venueIndex: 2, busyLevel: "packed", vibeTags: ["loud", "lively"], viewStatus: "na", minutesAgo: 5 },
  { venueIndex: 2, busyLevel: "packed", vibeTags: ["lively"], viewStatus: "na", minutesAgo: 45 },
  { venueIndex: 3, busyLevel: "moderate", vibeTags: ["chill", "lively"], viewStatus: "clear", minutesAgo: 15 },
  { venueIndex: 4, busyLevel: "dead", vibeTags: ["chill"], viewStatus: "na", minutesAgo: 30 },
  { venueIndex: 5, busyLevel: "moderate", vibeTags: ["romantic"], viewStatus: "clear", minutesAgo: 25 },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // Upsert venues
  const insertedVenues = await db
    .insert(venues)
    .values(TEST_VENUES)
    .onConflictDoNothing()
    .returning();

  console.log(`✓ ${insertedVenues.length} venues upserted`);

  // Create a seed test user
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash("seed_password_123", 12);
  const [testUser] = await db
    .insert(users)
    .values({
      email: "seed@pulse.dev",
      passwordHash,
      name: "Pulse Seed",
      username: "pulse_seed",
      avatarUrl: null,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { username: "pulse_seed" },
    })
    .returning();

  if (!testUser) throw new Error("Failed to create seed user");
  console.log(`✓ Seed user created`);

  // Create check-ins
  const now = new Date();
  const checkInValues = TEST_CHECK_INS.map((ci) => {
    const venue = insertedVenues[ci.venueIndex];
    if (!venue) throw new Error(`Venue at index ${ci.venueIndex} not found`);
    const createdAt = new Date(now.getTime() - ci.minutesAgo * 60 * 1000);
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h TTL for seed data
    return {
      venueId: venue.id,
      userId: testUser.id,
      busyLevel: ci.busyLevel,
      vibeTags: ci.vibeTags,
      viewStatus: ci.viewStatus,
      isAnonymous: true,
      createdAt,
      expiresAt,
    };
  });

  await db.insert(checkIns).values(checkInValues);
  console.log(`✓ ${checkInValues.length} check-ins created`);

  console.log("\n✅ Seed complete! Open http://localhost:3000/home to see the feed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
