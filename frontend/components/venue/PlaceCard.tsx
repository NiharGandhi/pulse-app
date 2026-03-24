"use client";

import { MapPin, Star, Camera } from "lucide-react";

export type PlaceCardData = {
  id: string;
  name: string;
  area?: string | null;
  googleRating?: number | string | null;
  photoReference?: string | null;
  openNow?: boolean | null;
  aiSummary?: string | null;
  relevanceScore?: number | null;
  category?: string | null;
  liveSummary?: {
    checkInCount: number;
    dominantBusyLevel?: string;
    topVibeTags: string[];
  } | null;
  onClick?: () => void;
  href?: string;
};

function photoUrl(ref: string | null | undefined) {
  if (!ref) return null;
  return `/api/photo?ref=${encodeURIComponent(ref)}`;
}

function matchScore(rating: number | string | null | undefined): number {
  const r = parseFloat(String(rating ?? "4.0"));
  return Math.min(99, Math.round((r / 5.0) * 80 + 10));
}

export function PlaceCard({ card }: { card: PlaceCardData }) {
  const photo = photoUrl(card.photoReference);
  const hasLive = card.liveSummary && card.liveSummary.checkInCount > 0;
  const match = card.relevanceScore != null ? Math.round(card.relevanceScore * 10) : matchScore(card.googleRating);
  const topTags = hasLive
    ? [card.liveSummary!.dominantBusyLevel, ...(card.liveSummary!.topVibeTags ?? [])]
        .filter(Boolean)
        .slice(0, 2) as string[]
    : [];

  const inner = (
    <div
      className="w-full rounded-2xl overflow-hidden relative flex flex-col"
      style={{ height: "320px", background: "var(--surface-2)" }}
    >
      {/* Background */}
      {photo ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} />
      ) : (
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#1a0800 0%,#3d1500 100%)" }} />
      )}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)" }}
      />

      {/* Top row */}
      <div className="relative flex items-center justify-between p-4">
        {hasLive ? (
          <span
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-body font-semibold leading-none"
            style={{ background: "rgba(200,255,0,0.15)", border: "1px solid rgba(200,255,0,0.3)", color: "var(--lime)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: "var(--lime)" }} />
            {card.liveSummary!.checkInCount} live
          </span>
        ) : card.googleRating ? (
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-body"
            style={{ background: "rgba(0,0,0,0.55)", color: "#FFD700" }}
          >
            <Star size={10} fill="#FFD700" style={{ color: "#FFD700" }} />
            {card.googleRating}
          </span>
        ) : (
          <span />
        )}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <Camera size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
        </div>
      </div>

      {/* Bottom content */}
      <div className="relative mt-auto p-4">
        <h3 className="font-body font-bold text-sm leading-tight mb-0.5 truncate photo-text">
          {card.name}
        </h3>
        {card.area && (
          <p className="text-xs font-body mb-2 truncate photo-text-muted flex items-center gap-0.5">
            <MapPin size={9} className="inline shrink-0" />
            {card.area}
          </p>
        )}

        {/* Vibe tags (if live) or category */}
        {topTags.length > 0 ? (
          <div className="flex gap-1 flex-wrap mb-3">
            {topTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-body rounded px-2 py-0.5 capitalize"
                style={{ background: "rgba(200,255,0,0.15)", color: "var(--lime)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : card.category ? (
          <div className="flex gap-1 flex-wrap mb-3">
            <span
              className="text-[10px] font-body rounded px-2 py-0.5 capitalize photo-text-muted"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              {card.category}
            </span>
          </div>
        ) : (
          <div className="mb-3" />
        )}

        {/* Match bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
            <div className="h-full rounded-full" style={{ width: `${match}%`, background: "var(--lime)" }} />
          </div>
          <span className="text-[10px] font-body photo-text-dim">{match}%</span>
        </div>
      </div>
    </div>
  );

  if (card.href) {
    return (
      <a href={card.href} style={{ textDecoration: "none", display: "block" }}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={card.onClick} className="w-full text-left active:scale-[0.98] transition-transform">
      {inner}
    </button>
  );
}

export function PlaceCardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{children}</div>;
}

export function PlaceCardSkeleton() {
  return (
    <div className="w-full rounded-2xl overflow-hidden animate-pulse" style={{ height: "320px", background: "var(--surface-2)" }} />
  );
}
