"use client";

import Link from "next/link";
import { Bookmark, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { VibeTag } from "@/components/ui/VibeTag";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Venue, VibeSummary } from "@/lib/api";

type VenueCardProps = {
  venue: Venue;
  summary?: VibeSummary;
  lastCheckinAt?: string;
  expiresAt?: string;
  href?: string;
  /** Large photo-background card variant */
  variant?: "default" | "featured";
};

export function VenueCard({
  venue,
  summary,
  lastCheckinAt,
  expiresAt,
  href,
  variant = "default",
}: VenueCardProps) {
  const [saved, setSaved] = useState(false);
  const isLive = summary && summary.checkInCount > 0;
  const isVeryFresh =
    lastCheckinAt &&
    Date.now() - new Date(lastCheckinAt).getTime() < 30 * 60 * 1000;

  const liveIndicator = isLive ? (
    <span
      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-body font-medium"
      style={{
        background: isVeryFresh ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
        color: isVeryFresh ? "#166534" : "#92400e",
      }}
    >
      <span
        className={cn("w-1 h-1 rounded-full", isVeryFresh ? "animate-pulse" : "")}
        style={{ background: isVeryFresh ? "var(--live)" : "#f59e0b" }}
      />
      {isVeryFresh ? "Live" : lastCheckinAt ? timeAgo(lastCheckinAt) : "Active"}
    </span>
  ) : null;

  if (variant === "featured") {
    return (
      <FeaturedCard
        venue={venue}
        summary={summary}
        lastCheckinAt={lastCheckinAt}
        href={href}
        saved={saved}
        onSave={() => setSaved((v) => !v)}
        liveIndicator={liveIndicator}
      />
    );
  }

  const cardContent = (
    <div
      className="rounded-2xl p-4 transition-colors duration-150 group"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            {liveIndicator}
          </div>
          <h3
            className="font-display italic font-bold text-lg leading-tight truncate"
            style={{ color: "var(--text)" }}
          >
            {venue.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            {venue.area && (
              <span
                className="flex items-center gap-0.5 text-xs font-body"
                style={{ color: "var(--text-2)" }}
              >
                <MapPin size={9} />
                {venue.area}
              </span>
            )}
            {venue.area && venue.category && (
              <span className="text-xs" style={{ color: "var(--border-2)" }}>·</span>
            )}
            {venue.category && (
              <span className="text-xs font-body capitalize" style={{ color: "var(--text-2)" }}>
                {venue.category}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            setSaved((v) => !v);
          }}
          className="shrink-0 p-1 -mr-1 -mt-1"
          aria-label={saved ? "Unsave" : "Save venue"}
        >
          <Bookmark
            size={16}
            className="transition-colors"
            style={{
              color: saved ? "var(--lime-text)" : "var(--text-3)",
              fill: saved ? "var(--lime-text)" : "none",
            }}
          />
        </button>
      </div>

      {isLive ? (
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          {summary?.dominantBusyLevel && (
            <VibeTag tag={summary.dominantBusyLevel} />
          )}
          {summary?.topVibeTags.map((tag) => (
            <VibeTag key={tag} tag={tag} />
          ))}
          {summary?.dominantViewStatus === "clear" && (
            <VibeTag tag="view clear" />
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs font-body" style={{ color: "var(--text-3)" }}>
          No recent vibes
        </p>
      )}

      {lastCheckinAt && (
        <div className="mt-2 flex items-center gap-1 text-xs font-body" style={{ color: "var(--text-3)" }}>
          <Clock size={9} />
          <span>{timeAgo(lastCheckinAt)}</span>
        </div>
      )}
    </div>
  );

  if (href) return <Link href={href}>{cardContent}</Link>;
  return cardContent;
}

// ── Featured (photo-background) card ────────────────────

type FeaturedCardProps = {
  venue: Venue;
  summary?: VibeSummary;
  lastCheckinAt?: string;
  href?: string;
  saved: boolean;
  onSave: () => void;
  liveIndicator: React.ReactNode;
};

function FeaturedCard({
  venue,
  summary,
  lastCheckinAt,
  href,
  saved,
  onSave,
  liveIndicator,
}: FeaturedCardProps) {
  const hasBg = Boolean(venue.photoReference);

  const inner = (
    <div
      className="relative rounded-2xl overflow-hidden h-52 flex flex-col justify-between p-4"
      style={{
        backgroundImage: hasBg
          ? `url(https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${venue.photoReference}&key=${process.env["NEXT_PUBLIC_GOOGLE_PLACES_API_KEY"]})`
          : "linear-gradient(135deg, #EDE6D6 0%, #D8C8A8 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />

      {/* Top row */}
      <div className="relative flex items-start justify-between">
        <div>{liveIndicator}</div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="p-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
          aria-label={saved ? "Unsave" : "Save"}
        >
          <Bookmark
            size={14}
            style={{
              color: saved ? "var(--lime)" : "#fff",
              fill: saved ? "var(--lime)" : "none",
            }}
          />
        </button>
      </div>

      {/* Bottom content */}
      <div className="relative">
        <h3 className="font-display italic font-bold text-xl leading-tight mb-1 photo-text">
          {venue.name}
        </h3>
        {venue.area && (
          <p className="text-xs font-body mb-2 flex items-center gap-1 photo-text-muted">
            <MapPin size={9} />
            {venue.area}
            {venue.category && ` · ${venue.category}`}
          </p>
        )}
        {summary && summary.checkInCount > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {summary.dominantBusyLevel && (
              <VibeTag tag={summary.dominantBusyLevel} size="sm" />
            )}
            {summary.topVibeTags.slice(0, 2).map((tag) => (
              <VibeTag key={tag} tag={tag} size="sm" />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
