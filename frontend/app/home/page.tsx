"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Flame, Coffee, Heart, Users, Briefcase, Star, MoonStar } from "lucide-react";
import { getFeed, getNearbyPlaces, type PlaceResult } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { PlaceCard, type PlaceCardData } from "@/components/venue/PlaceCard";
import { PlaceModal, type ModalPlace } from "@/components/venue/PlaceModal";
import Link from "next/link";

type FeedVenue = {
  id: string;
  name: string;
  area: string | null;
  category: string | null;
  googleRating: string | null;
  photoReference: string | null;
  checkin_count: number;
  last_checkin_at: string;
  all_vibe_tags: string[];
  dominant_busy_level: string;
  distance_km: number;
};

function placePhotoUrl(ref: string | undefined | null): string | null {
  if (!ref) return null;
  return `/api/photo?ref=${encodeURIComponent(ref)}`;
}

const VIBE_FILTERS = [
  { icon: Flame,     label: "Lively",     tag: "lively"   },
  { icon: Coffee,    label: "Chill",      tag: "chill"    },
  { icon: Heart,     label: "Date Night", tag: "romantic" },
  { icon: Users,     label: "Group",      tag: "loud"     },
  { icon: Briefcase, label: "Work",       tag: "chill"    },
];

const MOSAIC_BG = [
  "linear-gradient(135deg,#1a0800 0%,#3d2000 100%)",
  "linear-gradient(135deg,#001a1a 0%,#003d3d 100%)",
  "linear-gradient(135deg,#0d0d1a 0%,#1a1a3d 100%)",
];
const MOSAIC_LABELS = ["Fine Dining", "Rooftop Bar", "Casual Eats"];

function toNearbyCard(place: PlaceResult, onClick: () => void): PlaceCardData {
  return {
    id: place.googlePlaceId,
    name: place.name,
    area: place.area,
    googleRating: place.googleRating,
    photoReference: place.photoReference,
    category: place.category,
    onClick,
  };
}

function toFeedCard(venue: FeedVenue, onClick: () => void): PlaceCardData {
  return {
    id: venue.id,
    name: venue.name,
    area: venue.area,
    googleRating: venue.googleRating,
    photoReference: venue.photoReference,
    category: venue.category,
    liveSummary: venue.checkin_count > 0
      ? { checkInCount: venue.checkin_count, dominantBusyLevel: venue.dominant_busy_level, topVibeTags: venue.all_vibe_tags ?? [] }
      : null,
    onClick,
  };
}

export default function HomePage() {
  const router = useRouter();
  const [searchQ, setSearchQ] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("lively");

  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceResult[]>([]);
  const [feedVenues, setFeedVenues] = useState<FeedVenue[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLat, setUserLat] = useState(25.2048);
  const [userLng, setUserLng] = useState(55.2708);

  // Modal state
  const [modalPlace, setModalPlace] = useState<ModalPlace | null>(null);

  const loadNearby = useCallback(async (lat: number, lng: number) => {
    const res = await getNearbyPlaces(lat, lng, "restaurant bar nightclub");
    if (res.success) setNearbyPlaces(res.data);
    setLoadingNearby(false);
  }, []);

  const loadFeed = useCallback(async (lat: number, lng: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const res = await getFeed(lat, lng, 20);
    if (res.success) setFeedVenues(res.data as FeedVenue[]);
    setLoadingFeed(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLat(latitude);
        setUserLng(longitude);
        void loadNearby(latitude, longitude);
        void loadFeed(latitude, longitude);
      },
      () => {
        void loadNearby(25.2048, 55.2708);
        void loadFeed(25.2048, 55.2708);
      }
    );
  }, [loadNearby, loadFeed]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`);
  };

  const mosaicPlaces = nearbyPlaces.filter((p) => p.photoReference).slice(0, 3);
  const filteredFeed = activeFilter
    ? feedVenues.filter((v) => v.all_vibe_tags?.includes(activeFilter))
    : feedVenues;

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="grid md:grid-cols-[46fr_54fr]"
        style={{ minHeight: "calc(100vh - 57px)" }}
      >
        {/* Left — editorial text */}
        <div className="flex flex-col justify-center px-8 py-16 md:py-0 lg:px-12 xl:px-16 relative">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-6 h-px shrink-0" style={{ background: "var(--lime)" }} />
            <span className="text-[10px] font-body uppercase tracking-[0.18em]" style={{ color: "var(--text-3)" }}>
              Dubai · Real-time vibes
            </span>
          </div>

          <h1
            className="font-display font-bold mb-6"
            style={{ fontSize: "clamp(3rem, 5.2vw, 4.8rem)", lineHeight: 1.0, letterSpacing: "-0.035em", color: "var(--text)" }}
          >
            Skip the<br />
            dead{" "}
            <span className="font-display italic" style={{ color: "var(--lime)" }}>
              spots.
            </span>
          </h1>

          <p
            className="font-body mb-10"
            style={{ fontSize: "15px", lineHeight: 1.7, color: "var(--text-2)", maxWidth: "340px" }}
          >
            See what&apos;s actually busy right now — from
            people already inside, not yesterday&apos;s reviews.
          </p>

          <form onSubmit={handleSearch} style={{ maxWidth: "400px" }}>
            <div
              className="flex items-center rounded-2xl overflow-hidden"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)",
              }}
            >
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder='"Packed rooftop with views…"'
                className="flex-1 bg-transparent px-5 py-4 text-sm font-body outline-none"
                style={{ color: "var(--text)", caretColor: "var(--text)" }}
              />
              <button
                type="submit"
                className="m-1.5 px-5 py-2.5 rounded-xl text-[13px] font-body font-bold shrink-0 transition-all active:scale-95"
                style={{ background: "var(--lime)", color: "var(--lime-text)" }}
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ background: "var(--live)" }} />
            <span className="text-xs font-body" style={{ color: "var(--text-3)" }}>
              {nearbyPlaces.length > 0 ? `${nearbyPlaces.length}+ venues loaded near you` : "Loading nearby venues…"}
            </span>
          </div>
        </div>

        {/* Right — photos bleeding to viewport edge */}
        <div className="hidden md:flex h-full" style={{ padding: "10px 0 10px 10px", gap: "8px" }}>
          <div className="relative overflow-hidden flex-[1.45]" style={{ borderRadius: "20px 0 0 20px" }}>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: mosaicPlaces[0] ? `url(${placePhotoUrl(mosaicPlaces[0].photoReference)})` : MOSAIC_BG[0] }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, transparent 40%, rgba(0,0,0,0.72) 100%)" }} />
            <div className="absolute top-5 left-5 flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--lime)" }} />
              <span className="text-[11px] font-body font-semibold photo-text">Live now</span>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="photo-text font-body font-bold text-lg leading-snug">{mosaicPlaces[0]?.name ?? MOSAIC_LABELS[0]}</p>
              <p className="photo-text-muted text-xs font-body mt-1">{mosaicPlaces[0]?.area ?? "Dubai"}</p>
            </div>
          </div>

          <div className="flex flex-col flex-1" style={{ gap: "8px" }}>
            {[mosaicPlaces[1] ?? null, mosaicPlaces[2] ?? null].map((place, i) => (
              <div key={i} className="relative flex-1 overflow-hidden" style={{ borderRadius: "20px 0 0 20px" }}>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: place ? `url(${placePhotoUrl(place.photoReference)})` : MOSAIC_BG[i + 1] }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)" }} />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="photo-text text-xs font-body font-semibold leading-tight">{place?.name ?? MOSAIC_LABELS[i + 1]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI-Powered Nearby ───────────────────────────────── */}
      <section className="px-6 md:px-10 py-12">
        <p className="text-xs font-body uppercase tracking-widest mb-2" style={{ color: "var(--text-2)" }}>AI-POWERED</p>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display italic font-bold text-3xl">Lively Spots Near You</h2>
          <Link href="/search" className="text-sm font-body" style={{ color: "var(--text-2)" }}>Browse all →</Link>
        </div>

        {loadingNearby ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="shrink-0 w-60 h-80 rounded-2xl animate-pulse" style={{ background: "var(--surface-2)" }} />
            ))}
          </div>
        ) : nearbyPlaces.length === 0 ? (
          <p className="text-sm font-body py-8 text-center" style={{ color: "var(--text-3)" }}>
            Could not load nearby spots. Check your Google Places API key.
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {nearbyPlaces.map((place) => (
              <div key={place.googlePlaceId} className="shrink-0 w-60">
                <PlaceCard
                  card={toNearbyCard(place, () =>
                    setModalPlace({
                      googlePlaceId: place.googlePlaceId,
                      name: place.name,
                      area: place.area,
                      googleRating: place.googleRating,
                      photoReference: place.photoReference,
                      category: place.category,
                    })
                  )}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Nearby Right Now (live feed) ─────────────────────── */}
      <section className="px-6 md:px-10 py-12">
        <p className="text-xs font-body uppercase tracking-widest mb-2" style={{ color: "var(--text-2)" }}>AROUND YOU</p>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display italic font-bold text-3xl">Nearby Right Now</h2>
          <button
            onClick={() => void loadFeed(userLat, userLng, true)}
            className="flex items-center gap-1.5 text-sm font-body"
            style={{ color: "var(--text-2)" }}
          >
            Refresh <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Vibe filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5">
          {VIBE_FILTERS.map(({ icon: Icon, label, tag }) => {
            const active = activeFilter === tag;
            return (
              <button
                key={label}
                onClick={() => setActiveFilter(active ? "" : tag)}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-body font-medium transition-all shrink-0"
                style={{
                  background: active ? "var(--text)" : "var(--surface)",
                  color: active ? "var(--bg)" : "var(--text-2)",
                  border: `1px solid ${active ? "var(--text)" : "var(--border)"}`,
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>

        {loadingFeed ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shrink-0 w-60 h-80 rounded-2xl animate-pulse" style={{ background: "var(--surface-2)" }} />
            ))}
          </div>
        ) : filteredFeed.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <MoonStar size={40} className="mb-3" style={{ color: "var(--border-2)" }} />
            <p className="font-body text-sm mb-4" style={{ color: "var(--text-2)" }}>No active check-ins nearby right now.</p>
            <button
              onClick={() => router.push("/search?mode=checkin")}
              className="rounded-full px-5 py-2.5 text-sm font-body font-semibold"
              style={{ background: "var(--lime)", color: "#000" }}
            >
              Be the first to check in
            </button>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {filteredFeed.slice(0, 10).map((v) => (
              <div key={v.id} className="shrink-0 w-60">
                <PlaceCard card={toFeedCard(v, () =>
                  setModalPlace({
                    googlePlaceId: v.id, // use DB id as fallback for places detail fetch
                    name: v.name,
                    area: v.area,
                    googleRating: v.googleRating,
                    photoReference: v.photoReference,
                    category: v.category,
                    dbVenueId: v.id,
                    liveSummary: v.checkin_count > 0
                      ? { checkInCount: v.checkin_count, dominantBusyLevel: v.dominant_busy_level, topVibeTags: v.all_vibe_tags ?? [] }
                      : null,
                  })
                )} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {modalPlace && (
        <PlaceModal
          place={modalPlace}
          onClose={() => setModalPlace(null)}
        />
      )}
    </div>
  );
}
