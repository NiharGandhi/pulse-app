"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ModalPlace } from "@/components/venue/PlaceModal";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, X, SearchX
} from "lucide-react";
import {
  vibeSearch, searchVenues, upsertVenue, type VibeSearchResult, type Venue,
} from "@/lib/api";
import { SEARCH_EXAMPLE_PROMPTS } from "@/lib/constants";
import { Navbar } from "@/components/layout/Navbar";
import { PlaceCard, PlaceCardGrid, PlaceCardSkeleton } from "@/components/venue/PlaceCard";
import { PlaceModal } from "@/components/venue/PlaceModal";
import Link from "next/link";
import { Suspense } from "react";




// ── AI Loading Steps ───────────────────────────────────────────────────────────
function AILoadingSteps({ query, step }: { query: string; step: string }) {
  const [displayStep, setDisplayStep] = useState(step);
  const [fade, setFade] = useState(true);
  const prevStep = useRef(step);

  useEffect(() => {
    if (step === prevStep.current) return;
    prevStep.current = step;
    setFade(false);
    const t = setTimeout(() => { setDisplayStep(step); setFade(true); }, 180);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="py-4">
      {/* Query echo + live status */}
      <div className="mb-5 rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: "var(--lime)" }} />
          <p className="text-[10px] font-body uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Pulse AI</p>
        </div>
        <p className="font-body font-semibold text-sm leading-snug mb-3">"{query}"</p>
        <p
          className="text-sm font-body transition-opacity duration-180"
          style={{ color: "var(--text-2)", opacity: fade ? 1 : 0 }}
        >
          {displayStep}
        </p>
      </div>

      <PlaceCardGrid>
        {[1, 2, 3, 4].map((i) => <PlaceCardSkeleton key={i} />)}
      </PlaceCardGrid>
    </div>
  );
}

const VIBE_KEYWORDS = ["with", "near", "in", "for", "by", "vibe", "lively", "chill", "romantic", "quiet", "busy", "packed", "rooftop", "view", "views", "outdoor", "cozy", "loud", "bar", "place", "spot", "spots", "area"];

function looksLikeVibQuery(q: string): boolean {
  const words = q.trim().split(/\s+/);
  if (words.length > 3) return true;
  const lower = q.toLowerCase();
  return VIBE_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── Main page ──────────────────────────────────────────────────────────────────
function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCheckInMode = searchParams.get("mode") === "checkin";
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("Analyzing your query...");
  const [vibeResults, setVibeResults] = useState<VibeSearchResult[] | null>(null);
  const [venueResults, setVenueResults] = useState<Venue[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<ModalPlace | null>(null);

  const handleVibeSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true); setVibeResults(null); setVenueResults(null); setSearched(true);
    setCurrentStep("Analyzing your query...");
    const res = await vibeSearch(q.trim(), setCurrentStep);
    if (res.success) setVibeResults(res.data);
    setLoading(false);
  }, []);

  const handleVenueSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true); setVibeResults(null); setVenueResults(null); setSearched(true);
    const res = await searchVenues(q.trim());
    if (res.success) setVenueResults(res.data);
    setLoading(false);
  }, []);

  const handleSearch = useCallback((q: string) => {
    if (isCheckInMode || !looksLikeVibQuery(q)) {
      void handleVenueSearch(q);
    } else {
      void handleVibeSearch(q);
    }
  }, [isCheckInMode, handleVenueSearch, handleVibeSearch]);

  useEffect(() => {
    if (initialQ) handleSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelectVenue(venue: Venue) {
    const res = await upsertVenue({
      googlePlaceId: venue.googlePlaceId, name: venue.name,
      area: venue.area, category: venue.category,
      latitude: venue.latitude, longitude: venue.longitude,
      googleRating: venue.googleRating, photoReference: venue.photoReference,
    });
    router.push(`/checkin/${res.success ? res.data.id : venue.googlePlaceId}`);
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      {/* Page header + search */}
      <div className="px-5 md:px-8 pt-8 pb-5 max-w-2xl mx-auto">
        <p className="text-[11px] font-body uppercase tracking-widest mb-1" style={{ color: "var(--text-3)" }}>
          {isCheckInMode ? "Check In" : "AI Vibe Search"}
        </p>
        <h1 className="font-display italic font-bold text-3xl mb-5">
          {isCheckInMode ? "Where are you?" : "Find your vibe"}
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}>
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <Search size={16} style={{ color: "var(--text-3)", flexShrink: 0 }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isCheckInMode ? "Restaurant, bar or café name..." : "e.g. lively rooftop with views in DIFC..."}
              className="flex-1 bg-transparent text-sm font-body outline-none"
              style={{ caretColor: "var(--text)" }}
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="shrink-0" style={{ color: "var(--text-3)" }}>
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="shrink-0 rounded-xl px-4 py-1.5 text-xs font-body font-semibold text-black disabled:opacity-40 transition-all"
              style={{ background: "var(--lime)" }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Example chips */}
        {!isCheckInMode && !searched && (
          <div className="mt-4 flex flex-wrap gap-2">
            {SEARCH_EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => { setQuery(p); handleSearch(p); }}
                className="rounded-full px-3 py-1.5 text-xs font-body transition-all"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-5 md:px-8 max-w-2xl mx-auto">
        {loading && <AILoadingSteps query={query} step={currentStep} />}

        {!loading && vibeResults !== null && (
          <>
            {vibeResults.length === 0 ? (
              <div className="py-16 text-center">
                <SearchX size={40} className="mx-auto mb-3" style={{ color: "var(--border-2)" }} />
                <p className="font-display font-bold text-xl mb-1">Nothing found</p>
                <p className="text-sm font-body" style={{ color: "var(--text-2)" }}>Try a different description</p>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-body uppercase tracking-widest mb-4" style={{ color: "var(--text-3)" }}>
                  {vibeResults.length} places · tap to explore
                </p>
                <PlaceCardGrid>
                  {vibeResults.map((v) => (
                    <PlaceCard
                      key={v.googlePlaceId}
                      card={{
                        id: v.googlePlaceId,
                        name: v.name,
                        area: v.area,
                        googleRating: v.googleRating,
                        photoReference: v.photoReference,
                        openNow: v.openNow,
                        aiSummary: v.aiSummary,
                        relevanceScore: v.relevanceScore,
                        liveSummary: v.liveSummary ?? null,
                        onClick: () => setSelected({
                          googlePlaceId: v.googlePlaceId,
                          name: v.name,
                          area: v.area,
                          googleRating: v.googleRating,
                          totalRatings: v.totalRatings,
                          photoReference: v.photoReference,
                          openNow: v.openNow,
                          aiSummary: v.aiSummary,
                          category: v.category,
                          liveSummary: v.liveSummary ?? null,
                          dbVenueId: v.dbVenueId,
                        }),
                      }}
                    />
                  ))}
                </PlaceCardGrid>
              </>
            )}
          </>
        )}

        {!loading && venueResults !== null && (
          <>
            {venueResults.length === 0 ? (
              <div className="py-16 text-center">
                <SearchX size={40} className="mx-auto mb-3" style={{ color: "var(--border-2)" }} />
                <p className="font-display font-bold text-xl mb-1">Nothing found</p>
                <p className="text-sm font-body" style={{ color: "var(--text-2)" }}>Try a different name</p>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-body uppercase tracking-widest mb-4" style={{ color: "var(--text-3)" }}>
                  {venueResults.length} {venueResults.length === 1 ? "place" : "places"} found
                </p>
                <PlaceCardGrid>
                  {venueResults.map((v) => (
                    <PlaceCard
                      key={v.googlePlaceId}
                      card={{
                        id: v.googlePlaceId,
                        name: v.name,
                        area: v.area,
                        googleRating: v.googleRating,
                        photoReference: v.photoReference,
                        category: v.category,
                        onClick: isCheckInMode
                          ? () => void handleSelectVenue(v)
                          : () => setSelected({
                              googlePlaceId: v.googlePlaceId,
                              name: v.name,
                              area: v.area,
                              googleRating: v.googleRating,
                              photoReference: v.photoReference,
                              category: v.category,
                              dbVenueId: v.id,
                            }),
                      }}
                    />
                  ))}
                </PlaceCardGrid>
              </>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <PlaceModal
          place={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
