"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin, Star, X, Phone, Globe, Clock,
  ChevronLeft, ChevronRight, Bookmark,
} from "lucide-react";
import {
  getPlaceDetails, getVenueCheckIns,
  saveVenue, unsaveVenue, getSavedVenues, upsertVenue,
  type PlaceDetails, type VibeSummary,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { VibeSummaryBlock } from "@/components/venue/VibeSummaryBlock";
import { CheckInsList } from "@/components/checkin/CheckInsList";

export type ModalPlace = {
  googlePlaceId: string;
  name: string;
  area?: string | null;
  googleRating?: number | string | null;
  totalRatings?: number | null;
  photoReference?: string | null;
  openNow?: boolean | null;
  aiSummary?: string | null;
  category?: string | null;
  liveSummary?: {
    checkInCount: number;
    dominantBusyLevel?: string;
    topVibeTags: string[];
  } | null;
  dbVenueId?: string | null;
};

function photoUrl(ref: string | null | undefined) {
  if (!ref) return null;
  return `/api/photo?ref=${encodeURIComponent(ref)}`;
}

type Tab = "vibe" | "details";

export function PlaceModal({
  place,
  onClose,
}: {
  place: ModalPlace;
  onClose: () => void;
}) {
  const { token } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("vibe");
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [vibeSummary, setVibeSummary] = useState<VibeSummary>(place.liveSummary ?? null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  const [resolvedVenueId, setResolvedVenueId] = useState<string | null>(place.dbVenueId ?? null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Fetch place details (for Details tab)
    void getPlaceDetails(place.googlePlaceId).then((r) => {
      if (r.success) setDetails(r.data);
    });

    // If we have a DB venue id, fetch fresh vibe summary
    if (resolvedVenueId) {
      void getVenueCheckIns(resolvedVenueId).then((r) => {
        if (r.success) setVibeSummary(r.data.summary);
      });
    }

    return () => { document.body.style.overflow = ""; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place.googlePlaceId, resolvedVenueId]);

  // Check saved state — match by DB id OR googlePlaceId (nearby cards have no dbVenueId)
  useEffect(() => {
    if (!token) return;
    void getSavedVenues(token).then((r) => {
      if (!r.success) return;
      const found = r.data.find(
        (v) => (resolvedVenueId && v.id === resolvedVenueId) || v.googlePlaceId === place.googlePlaceId
      );
      setSaved(!!found);
      // If we matched via googlePlaceId, populate resolvedVenueId so Vibe tab works
      if (found && !resolvedVenueId) setResolvedVenueId(found.id);
    });
  }, [token, resolvedVenueId, place.googlePlaceId]);

  async function toggleSave() {
    if (!token || savingLoading) return;
    setSavingLoading(true);
    let venueId = resolvedVenueId;
    if (!venueId) {
      const res = await upsertVenue({
        googlePlaceId: place.googlePlaceId,
        name: place.name,
        area: place.area ?? null,
        category: place.category ?? null,
        latitude: null,
        longitude: null,
        googleRating: place.googleRating?.toString() ?? null,
        photoReference: place.photoReference ?? null,
      });
      if (!res.success) { setSavingLoading(false); return; }
      venueId = res.data.id;
      setResolvedVenueId(venueId);
    }
    if (saved) {
      await unsaveVenue(venueId, token);
      setSaved(false);
    } else {
      await saveVenue(venueId, token);
      setSaved(true);
    }
    setSavingLoading(false);
  }

  async function handleCheckIn() {
    onClose();
    let venueId = resolvedVenueId;
    if (!venueId) {
      const res = await upsertVenue({
        googlePlaceId: place.googlePlaceId,
        name: place.name,
        area: place.area ?? null,
        category: place.category ?? null,
        latitude: null,
        longitude: null,
        googleRating: place.googleRating?.toString() ?? null,
        photoReference: place.photoReference ?? null,
      });
      if (res.success) venueId = res.data.id;
    }
    router.push(`/checkin/${venueId ?? place.googlePlaceId}`);
  }

  const allPhotos = details?.photos ?? (place.photoReference ? [{ photo_reference: place.photoReference }] : []);
  const openNow = details?.opening_hours?.open_now ?? place.openNow;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative w-full md:max-w-lg md:mx-4 rounded-t-3xl md:rounded-3xl flex flex-col overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", maxHeight: "92vh" }}
      >
        {/* ── Photo header ──────────────────────────────── */}
        {allPhotos.length > 0 ? (
          <div className="relative shrink-0" style={{ height: "200px" }}>
            <img
              src={photoUrl(allPhotos[photoIdx]?.photo_reference) ?? ""}
              alt={place.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />

            {/* Photo nav */}
            {allPhotos.length > 1 && (
              <>
                <button onClick={() => setPhotoIdx((i) => Math.max(0, i - 1))} disabled={photoIdx === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-25"
                  style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setPhotoIdx((i) => Math.min(allPhotos.length - 1, i + 1))} disabled={photoIdx === allPhotos.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-25"
                  style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>
                  <ChevronRight size={14} />
                </button>
              </>
            )}

            {/* Close */}
            <button onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
              <X size={15} />
            </button>

            {/* Name overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
              <h2 className="font-display font-bold text-xl leading-tight photo-text">{place.name}</h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {place.area && (
                  <span className="flex items-center gap-1 text-xs font-body photo-text-muted">
                    <MapPin size={9} />{place.area}
                  </span>
                )}
                {place.googleRating && (
                  <span className="flex items-center gap-1 text-xs font-body" style={{ color: "#FFD700" }}>
                    <Star size={9} fill="#FFD700" style={{ color: "#FFD700" }} />{place.googleRating}
                    {place.totalRatings && <span style={{ color: "rgba(255,255,255,0.4)" }}>({place.totalRatings.toLocaleString()})</span>}
                  </span>
                )}
                {openNow !== null && openNow !== undefined && (
                  <span className="text-[11px] font-body font-semibold rounded-full px-2 py-0.5"
                    style={{ color: openNow ? "var(--lime)" : "#FF8080", background: openNow ? "rgba(200,255,0,0.12)" : "rgba(255,80,80,0.12)" }}>
                    {openNow ? "● Open" : "Closed"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* No-photo header */
          <div className="flex items-start justify-between px-4 pt-5 pb-3 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <h2 className="font-display font-bold text-xl">{place.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {place.area && <span className="text-xs font-body flex items-center gap-1" style={{ color: "var(--text-2)" }}><MapPin size={9} />{place.area}</span>}
                {place.googleRating && <span className="text-xs font-body flex items-center gap-1" style={{ color: "#FFD700" }}><Star size={9} fill="#FFD700" style={{ color: "#FFD700" }} />{place.googleRating}</span>}
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-full" style={{ color: "var(--text-3)" }}><X size={18} /></button>
          </div>
        )}

        {/* ── Tab bar ───────────────────────────────────── */}
        <div className="shrink-0 flex" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          {(["vibe", "details"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-sm font-body font-semibold capitalize transition-colors"
              style={{
                color: tab === t ? "var(--text)" : "var(--text-3)",
                borderBottom: tab === t ? "2px solid var(--text)" : "2px solid transparent",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab content ───────────────────────────────── */}
        <div className="flex-1 overflow-y-auto no-scrollbar">

          {/* VIBE TAB */}
          {tab === "vibe" && (
            <div className="px-4 py-4 flex flex-col gap-4">
              {/* AI summary */}
              {place.aiSummary && (
                <p className="text-sm font-body leading-relaxed" style={{ color: "var(--text-2)" }}>
                  {place.aiSummary}
                </p>
              )}

              {/* Live vibe summary */}
              <VibeSummaryBlock summary={vibeSummary} />

              {/* Recent check-ins */}
              {resolvedVenueId ? (
                <>
                  <p className="label-muted -mb-1">Recent check-ins</p>
                  <CheckInsList venueId={resolvedVenueId} />
                </>
              ) : (
                <div className="rounded-2xl p-4 text-center" style={{ background: "var(--surface-2)" }}>
                  <p className="text-sm font-body" style={{ color: "var(--text-3)" }}>
                    Check in to be the first to report the vibe here.
                  </p>
                </div>
              )}

              <div style={{ height: "16px" }} />
            </div>
          )}

          {/* DETAILS TAB */}
          {tab === "details" && (
            <div className="px-4 py-4 flex flex-col gap-5">

              {/* Contact */}
              {(details?.formatted_phone_number || details?.website) && (
                <div className="flex flex-col gap-2">
                  {details?.formatted_phone_number && (
                    <a href={`tel:${details.formatted_phone_number}`}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-body"
                      style={{ background: "var(--surface-2)", color: "var(--text)" }}>
                      <Phone size={14} style={{ color: "var(--text-3)" }} />
                      {details.formatted_phone_number}
                    </a>
                  )}
                  {details?.website && (
                    <a href={details.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-body"
                      style={{ background: "var(--surface-2)", color: "var(--lime-text)" }}>
                      <Globe size={14} style={{ color: "var(--text-3)" }} />
                      <span className="truncate">{details.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Hours */}
              {details?.opening_hours?.weekday_text && details.opening_hours.weekday_text.length > 0 && (
                <div>
                  <p className="text-[11px] font-body uppercase tracking-widest mb-2" style={{ color: "var(--text-3)" }}>
                    <Clock size={10} className="inline mr-1" />Hours
                  </p>
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    {details.opening_hours.weekday_text.map((line, i) => {
                      const [day, ...rest] = line.split(": ");
                      return (
                        <div key={i} className="flex justify-between px-4 py-2.5 text-xs font-body"
                          style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)", borderBottom: i < 6 ? "1px solid var(--border)" : "none" }}>
                          <span style={{ color: "var(--text-2)" }}>{day}</span>
                          <span style={{ color: "var(--text)" }}>{rest.join(": ")}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {details?.reviews && details.reviews.length > 0 && (
                <div>
                  <p className="text-[11px] font-body uppercase tracking-widest mb-2.5" style={{ color: "var(--text-3)" }}>Reviews</p>
                  <div className="flex flex-col gap-2">
                    {details.reviews.slice(0, 5).map((r, i) => (
                      <div key={i} className="rounded-xl p-3" style={{ background: "var(--surface-2)" }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-body font-semibold" style={{ color: "var(--text)" }}>{r.author_name}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: r.rating }).map((_, si) => (
                              <Star key={si} size={9} fill="#9A7A00" style={{ color: "#9A7A00" }} />
                            ))}
                            <span className="text-[10px] font-body ml-1" style={{ color: "var(--text-3)" }}>{r.relative_time_description}</span>
                          </div>
                        </div>
                        <p className="text-xs font-body leading-relaxed line-clamp-4" style={{ color: "var(--text-2)" }}>{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!details && (
                <div className="flex flex-col gap-2">
                  {[1,2,3].map((i) => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "var(--surface-2)" }} />)}
                </div>
              )}

              <div style={{ height: "16px" }} />
            </div>
          )}
        </div>

        {/* ── Footer CTA ────────────────────────────────── */}
        <div className="shrink-0 px-4 py-3 flex gap-2" style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
          <button
            onClick={() => void handleCheckIn()}
            className="flex-1 rounded-2xl py-3.5 text-sm font-body font-semibold transition-all active:scale-95"
            style={{ background: "var(--lime)", color: "var(--text)" }}
          >
            Check in here
          </button>

          {token && (
            <button
              onClick={() => void toggleSave()}
              disabled={savingLoading}
              className="w-12 rounded-2xl flex items-center justify-center transition-all active:scale-95"
              style={{
                background: saved ? "var(--lime-bg)" : "var(--surface-2)",
                border: `1px solid ${saved ? "var(--border-2)" : "var(--border)"}`,
              }}
            >
              <Bookmark size={16} fill={saved ? "var(--lime-text)" : "none"} style={{ color: saved ? "var(--lime-text)" : "var(--text-2)" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
