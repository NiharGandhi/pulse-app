const BASE_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

// ---- Shared types ----

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type VibeSummary = {
  checkInCount: number;
  dominantBusyLevel?: string;
  topVibeTags: string[];
  dominantViewStatus?: string;
} | null;

export type Venue = {
  id: string;
  googlePlaceId: string;
  name: string;
  area: string | null;
  category: string | null;
  latitude: string | null;
  longitude: string | null;
  googleRating: string | null;
  photoReference: string | null;
  createdAt: string;
};

export type CheckIn = {
  id: string;
  venueId: string;
  userId: string | null;
  busyLevel: string;
  vibeTags: string[];
  viewStatus: string;
  photoUrl: string | null;
  isAnonymous: boolean;
  createdAt: string;
  expiresAt: string;
  username?: string | null;
  avatarUrl?: string | null;
};

// ---- Fetch helper ----

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<ApiResponse<T>> {
  const { token, ...fetchOptions } = options ?? {};
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });
  const text = await res.text();
  if (!text) return { success: false, error: "Empty response from server" };
  const json = JSON.parse(text) as ApiResponse<T>;
  return json;
}

// ---- Place Details ----

export type PlaceDetails = {
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
};

export async function getPlaceDetails(googlePlaceId: string): Promise<ApiResponse<PlaceDetails>> {
  return apiFetch(`/api/venues/details/${encodeURIComponent(googlePlaceId)}`);
}

// ---- Nearby Places (Google Places proxy) ----

export type PlaceResult = {
  googlePlaceId: string;
  name: string;
  area: string | undefined;
  category: string | undefined;
  latitude: string | undefined;
  longitude: string | undefined;
  googleRating: string | undefined;
  photoReference: string | undefined;
};

export async function getNearbyPlaces(
  lat: number,
  lng: number,
  keyword?: string
): Promise<ApiResponse<PlaceResult[]>> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
  });
  if (keyword) params.set("keyword", keyword);
  return apiFetch(`/api/venues/nearby?${params.toString()}`);
}

// ---- Waitlist ----

export async function joinWaitlist(
  email: string
): Promise<ApiResponse<{ position: number; alreadyJoined: boolean }>> {
  return apiFetch("/api/waitlist", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ---- Venues ----

export async function searchVenues(
  q: string
): Promise<ApiResponse<Venue[]>> {
  return apiFetch(`/api/venues/search?q=${encodeURIComponent(q)}`);
}

export async function getVenue(
  id: string
): Promise<ApiResponse<{ venue: Venue; summary: VibeSummary }>> {
  return apiFetch(`/api/venues/${id}`);
}

export async function upsertVenue(
  data: Omit<Venue, "id" | "createdAt">
): Promise<ApiResponse<Venue>> {
  // Backend Zod schema uses z.string().optional() — strip nulls to undefined
  const body = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === null ? undefined : v])
  );
  return apiFetch("/api/venues", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ---- Check-ins ----

export type CreateCheckInInput = {
  venueId: string;
  busyLevel: "dead" | "moderate" | "packed";
  vibeTags: string[];
  viewStatus: "clear" | "blocked" | "na";
  photoUrl?: string;
  isAnonymous: boolean;
};

export async function createCheckIn(
  input: CreateCheckInInput,
  token: string
): Promise<ApiResponse<CheckIn>> {
  return apiFetch("/api/checkins", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}

export async function getVenueCheckIns(
  venueId: string
): Promise<ApiResponse<{ checkIns: CheckIn[]; summary: VibeSummary }>> {
  return apiFetch(`/api/checkins/venue/${venueId}`);
}

export async function getFeed(
  lat: number,
  lng: number,
  radius?: number
): Promise<ApiResponse<(Venue & { checkin_count: number; last_checkin_at: string; all_vibe_tags: string[]; dominant_busy_level: string; distance_km: number })[]>> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    ...(radius ? { radius: radius.toString() } : {}),
  });
  return apiFetch(`/api/checkins/feed?${params.toString()}`);
}

// ---- Vibe search ----

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
  liveSummary: VibeSummary;
  aiSummary: string | null;
};

export async function vibeSearch(
  query: string,
  onStep?: (step: string) => void
): Promise<ApiResponse<VibeSearchResult[]>> {
  const res = await fetch(`${BASE_URL}/api/search/vibe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok || !res.body) {
    return { success: false, error: "Search request failed" };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const lines = part.trim().split("\n");
      let eventType = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event: ")) eventType = line.slice(7).trim();
        else if (line.startsWith("data: ")) data = line.slice(6).trim();
      }
      if (!data) continue;

      if (eventType === "step" && onStep) {
        try { onStep((JSON.parse(data) as { step: string }).step); } catch {}
      } else if (eventType === "done") {
        try { return JSON.parse(data) as ApiResponse<VibeSearchResult[]>; } catch {}
      }
    }
  }

  return { success: false, error: "Stream ended unexpectedly" };
}

// ---- Leaderboard ----

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  points: number;
  checkInCount: number;
  photoCount: number;
};

export async function getLeaderboard(): Promise<ApiResponse<LeaderboardEntry[]>> {
  return apiFetch("/api/leaderboard");
}

// ---- Saved venues ----

export async function getSavedVenues(token: string): Promise<ApiResponse<Venue[]>> {
  return apiFetch("/api/user/saved", { token });
}

export async function saveVenue(venueId: string, token: string): Promise<ApiResponse<{ saved: true }>> {
  return apiFetch(`/api/user/saved/${venueId}`, { method: "POST", token });
}

export async function unsaveVenue(venueId: string, token: string): Promise<ApiResponse<{ saved: false }>> {
  return apiFetch(`/api/user/saved/${venueId}`, { method: "DELETE", token });
}

// ---- User profile ----

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
};

export type UserProfile = {
  user: { id: string; email: string; name: string; username: string | null; avatarUrl: string | null; createdAt: string };
  stats: { checkInCount: number; points: number; photoCount: number; savedCount: number; uniqueVenues: number; currentStreak: number };
  badges: Badge[];
};

export async function getUserProfile(token: string): Promise<ApiResponse<UserProfile>> {
  return apiFetch("/api/user/profile", { token });
}

export async function getUserContributions(token: string): Promise<ApiResponse<Array<{ date: string; count: number }>>> {
  return apiFetch("/api/user/contributions", { token });
}

// ---- Upload ----

export async function uploadCheckInPhoto(
  file: File,
  token: string
): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData();
  formData.append("photo", file);

  const res = await fetch(`${BASE_URL}/api/upload/checkin-photo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json() as Promise<ApiResponse<{ url: string }>>;
}
