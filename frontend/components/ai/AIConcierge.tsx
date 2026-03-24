"use client";

import { useState, useRef } from "react";
import { Sparkles, X, Send, MapPin, Star, ArrowRight } from "lucide-react";
import { vibeSearch, type VibeSearchResult } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

const EXAMPLE_PROMPTS = [
  "Lively rooftop in DIFC",
  "Quiet Italian for a date",
  "Packed club in Business Bay",
  "Indian food with Burj views",
  "Chill brunch spot in JBR",
];

function photoUrl(ref: string | null | undefined) {
  if (!ref) return null;
  return `/api/photo?ref=${encodeURIComponent(ref)}`;
}

const TAG_COLORS: Record<string, string> = {
  packed: "#FF8080", moderate: "#FFB400", dead: "#888",
  lively: "var(--lime)", chill: "#00C8FF", loud: "#FF6400", romantic: "#FF50B4",
};

export function AIConcierge() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VibeSearchResult[] | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(q: string) {
    if (!q.trim()) return;
    setLastQuery(q.trim());
    setLoading(true);
    setResults(null);
    const res = await vibeSearch(q.trim());
    if (res.success) setResults(res.data);
    setLoading(false);
  }

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={handleOpen}
        className={cn(
          "fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40",
          "flex items-center gap-2 rounded-full px-4 py-3 shadow-xl",
          "font-body font-semibold text-sm transition-all active:scale-95",
          open && "hidden"
        )}
        style={{ background: "var(--lime)", color: "#000" }}
      >
        <Sparkles size={15} />
        <span className="hidden sm:inline">Ask Pulse AI</span>
      </button>

      {open && (
        <>
          <div
            className="hidden md:block fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div
            className={cn(
              "fixed z-50 flex flex-col",
              "inset-x-0 bottom-0 rounded-t-2xl max-h-[90vh]",
              "md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:rounded-2xl md:max-h-[75vh]",
            )}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-4 shrink-0" style={{ borderBottom: "1px solid #1E1E1E" }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--lime)" }} />
                  <h3 className="font-display font-bold text-[var(--text)] text-base">Pulse AI</h3>
                </div>
                <p className="text-xs font-body mt-0.5 ml-3.5" style={{ color: "#555" }}>
                  Describe the vibe you're after
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 -mt-1 -mr-1 rounded-lg transition-colors" style={{ color: "#555" }}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
              {/* Example chips */}
              {!results && !loading && (
                <div>
                  <p className="text-[11px] font-body uppercase tracking-widest mb-2.5" style={{ color: "#555" }}>
                    Try asking
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => { setQuery(p); void handleSearch(p); }}
                        className="rounded-full px-3 py-1.5 text-xs font-body transition-colors"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skeletons */}
              {loading && (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--surface-2)" }} />
                  ))}
                  <p className="text-xs font-body text-center" style={{ color: "#555" }}>
                    Searching Google Places + generating vibe summaries...
                  </p>
                </div>
              )}

              {/* Results */}
              {results !== null && !loading && (
                <div>
                  <p className="text-xs font-body mb-3" style={{ color: "#555" }}>
                    {results.length === 0
                      ? "No places found. Try a different query."
                      : `${results.length} place${results.length !== 1 ? "s" : ""} for "${lastQuery}"`}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {results.map((v) => {
                      const href = v.dbVenueId ? `/venue/${v.dbVenueId}` : `/place/${v.googlePlaceId}`;
                      const photo = photoUrl(v.photoReference);
                      return (
                        <Link
                          key={v.googlePlaceId}
                          href={href}
                          onClick={() => setOpen(false)}
                          className="flex gap-3 rounded-2xl p-3 transition-colors group"
                          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                        >
                          {/* Thumbnail */}
                          <div
                            className="shrink-0 w-14 h-14 rounded-xl overflow-hidden"
                            style={{ background: "linear-gradient(135deg, #1a0800, #3d1500)" }}
                          >
                            {photo && <img src={photo} alt="" className="w-full h-full object-cover" />}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <p className="font-body font-semibold text-[var(--text)] text-sm leading-tight truncate">{v.name}</p>
                              <ArrowRight size={12} className="shrink-0 mt-0.5" style={{ color: "#555" }} />
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                              {v.area && (
                                <span className="flex items-center gap-0.5 text-[11px] font-body" style={{ color: "#888" }}>
                                  <MapPin size={9} />{v.area}
                                </span>
                              )}
                              {v.googleRating && (
                                <span className="flex items-center gap-0.5 text-[11px] font-body" style={{ color: "#FFD700" }}>
                                  <Star size={9} fill="#FFD700" />{v.googleRating}
                                </span>
                              )}
                              {v.openNow !== null && (
                                <span className="text-[10px] font-body" style={{ color: v.openNow ? "var(--lime)" : "#FF8080" }}>
                                  {v.openNow ? "Open" : "Closed"}
                                </span>
                              )}
                            </div>

                            {/* AI vibe summary */}
                            {v.aiSummary && (
                              <p className="text-[11px] font-body mt-1 leading-snug line-clamp-2" style={{ color: "#888" }}>
                                {v.aiSummary}
                              </p>
                            )}

                            {/* Live vibe tags */}
                            {v.liveSummary && v.liveSummary.checkInCount > 0 && (
                              <div className="flex gap-1 mt-1.5 flex-wrap">
                                {[v.liveSummary.dominantBusyLevel, ...v.liveSummary.topVibeTags.slice(0, 2)]
                                  .filter(Boolean)
                                  .map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full px-2 py-0.5 text-[10px] font-body capitalize"
                                      style={{ background: "rgba(255,255,255,0.06)", color: TAG_COLORS[tag!] ?? "#aaa" }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                <span className="text-[10px] font-body" style={{ color: "#555" }}>
                                  · {v.liveSummary.checkInCount} check-in{v.liveSummary.checkInCount !== 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  {results.length > 0 && (
                    <button
                      onClick={() => { setResults(null); setQuery(""); }}
                      className="mt-3 text-xs font-body transition-colors"
                      style={{ color: "#555" }}
                    >
                      ← New search
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 shrink-0" style={{ borderTop: "1px solid #1E1E1E" }}>
              <form
                onSubmit={(e) => { e.preventDefault(); void handleSearch(query); }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. lively rooftop in DIFC..."
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-body text-[var(--text)] outline-none"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                />
                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-all active:scale-95"
                  style={{ background: "var(--lime)", color: "#000" }}
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
