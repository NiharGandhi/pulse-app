"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Star, MapPin, Phone, Globe, Clock,
  ChevronLeft, ChevronRight, CheckCircle, XCircle
} from "lucide-react";
import { getPlaceDetails, type PlaceDetails } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";

function photoUrl(ref: string) {
  return `/api/photo?ref=${encodeURIComponent(ref)}`;
}

function priceLabel(level?: number) {
  if (!level) return null;
  return "$".repeat(Math.min(level, 4));
}

function starRating(rating: number) {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
}

export default function PlaceDetailPage({ params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = use(params);
  const router = useRouter();
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlaceDetails(decodeURIComponent(placeId)).then((res) => {
      if (res.success) setPlace(res.data);
      else setError("Could not load place details.");
      setLoading(false);
    });
  }, [placeId]);

  const photos = place?.photos ?? [];
  const reviews = place?.reviews ?? [];

  function prevPhoto() { setActivePhoto((p) => (p - 1 + photos.length) % photos.length); }
  function nextPhoto() { setActivePhoto((p) => (p + 1) % photos.length); }

  if (loading) {
    return (
      <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="animate-pulse">
          <div className="h-72 w-full" style={{ background: "var(--surface-2)" }} />
          <div className="px-6 pt-6 space-y-3 max-w-2xl mx-auto">
            <div className="h-8 rounded-xl w-2/3" style={{ background: "var(--surface-3)" }} />
            <div className="h-4 rounded-xl w-1/2" style={{ background: "var(--surface-3)" }} />
            <div className="h-4 rounded-xl w-3/4" style={{ background: "var(--surface-3)" }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="text-center px-6">
          <p className="font-display font-bold text-xl mb-3" style={{ color: "var(--text)" }}>Place not found</p>
          <button onClick={() => router.back()} className="text-sm font-body" style={{ color: "var(--lime-text)" }}>
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      {/* ── Photo hero ──────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(260px, 45vw, 480px)" }}>
        {photos.length > 0 ? (
          <>
            <img
              key={activePhoto}
              src={photoUrl(photos[activePhoto]!.photo_reference)}
              alt={place.name}
              className="w-full h-full object-cover"
              style={{ transition: "opacity 0.3s" }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)" }} />

            {/* Nav arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.85)", color: "var(--text)" }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.85)", color: "var(--text)" }}
                >
                  <ChevronRight size={20} />
                </button>
                {/* Dots */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.slice(0, 8).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className="w-1.5 h-1.5 rounded-full transition-all"
                      style={{ background: i === activePhoto ? "var(--lime)" : "rgba(255,255,255,0.5)" }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full" style={{ background: "var(--surface-2)" }} />
        )}

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.85)", color: "var(--text)" }}
        >
          <ArrowLeft size={18} />
        </button>

        {/* Venue name overlay */}
        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="font-display italic font-bold text-white text-2xl md:text-3xl leading-tight">
                {place.name}
              </h1>
              {place.formatted_address && (
                <p className="text-sm font-body mt-1 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                  <MapPin size={12} />
                  {place.formatted_address}
                </p>
              )}
            </div>
            {priceLabel(place.price_level) && (
              <span
                className="shrink-0 text-sm font-body font-semibold rounded-full px-3 py-1"
                style={{ background: "rgba(0,0,0,0.45)", color: "var(--lime)" }}
              >
                {priceLabel(place.price_level)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">

        {/* Rating + meta row */}
        <div className="flex items-center gap-4 flex-wrap">
          {place.rating && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {starRating(place.rating).map((filled, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={filled ? "#9A7A00" : "none"}
                    style={{ color: filled ? "#9A7A00" : "var(--border-2)" }}
                  />
                ))}
              </div>
              <span className="font-body font-semibold text-sm" style={{ color: "var(--text)" }}>{place.rating}</span>
              {place.user_ratings_total && (
                <span className="text-sm font-body" style={{ color: "var(--text-2)" }}>
                  ({place.user_ratings_total.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}

          {place.opening_hours && (
            <span
              className="flex items-center gap-1.5 text-sm font-body rounded-full px-3 py-1"
              style={{
                background: place.opening_hours.open_now ? "var(--lime-bg)" : "#FFE5E5",
                color: place.opening_hours.open_now ? "var(--open)" : "var(--closed)",
                border: `1px solid ${place.opening_hours.open_now ? "var(--border)" : "#FFCCCC"}`,
              }}
            >
              {place.opening_hours.open_now ? <CheckCircle size={12} /> : <XCircle size={12} />}
              {place.opening_hours.open_now ? "Open now" : "Closed"}
            </span>
          )}
        </div>

        {/* Contact info */}
        {(place.formatted_phone_number ?? place.website) && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
            {place.formatted_phone_number && (
              <a
                href={`tel:${place.formatted_phone_number}`}
                className="flex items-center gap-3 text-sm font-body"
                style={{ color: "var(--text)" }}
              >
                <Phone size={16} style={{ color: "var(--text-3)" }} />
                {place.formatted_phone_number}
              </a>
            )}
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm font-body truncate"
                style={{ color: "var(--lime-text)" }}
              >
                <Globe size={16} style={{ color: "var(--text-3)" }} />
                {place.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            )}
          </div>
        )}

        {/* Opening hours */}
        {place.opening_hours?.weekday_text && place.opening_hours.weekday_text.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} style={{ color: "var(--text-3)" }} />
              <p className="label-muted">Hours</p>
            </div>
            <div className="space-y-1.5">
              {place.opening_hours.weekday_text.map((line, i) => {
                const [day, ...rest] = line.split(": ");
                return (
                  <div key={i} className="flex justify-between text-sm font-body">
                    <span style={{ color: "var(--text-2)" }}>{day}</span>
                    <span style={{ color: "var(--text)" }}>{rest.join(": ")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Photo strip */}
        {photos.length > 1 && (
          <div>
            <p className="label-muted mb-3">Photos</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {photos.slice(0, 10).map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className="shrink-0 w-24 h-24 rounded-xl overflow-hidden"
                  style={{ border: `2px solid ${i === activePhoto ? "var(--lime-text)" : "var(--border)"}` }}
                >
                  <img
                    src={photoUrl(photo.photo_reference)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <p className="label-muted mb-4">Guest Reviews</p>
            <div className="space-y-3">
              {reviews.slice(0, 5).map((review, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <img
                      src={review.profile_photo_url}
                      alt={review.author_name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-body font-semibold text-sm truncate" style={{ color: "var(--text)" }}>
                          {review.author_name}
                        </p>
                        <span className="text-xs font-body shrink-0" style={{ color: "var(--text-3)" }}>
                          {review.relative_time_description}
                        </span>
                      </div>
                      <div className="flex gap-0.5 mt-0.5">
                        {starRating(review.rating).map((filled, j) => (
                          <Star
                            key={j}
                            size={11}
                            fill={filled ? "#9A7A00" : "none"}
                            style={{ color: filled ? "#9A7A00" : "var(--border-2)" }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-body leading-relaxed" style={{ color: "var(--text-2)" }}>
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check-in CTA */}
        <div
          className="rounded-2xl p-5 flex items-center justify-between"
          style={{ background: "var(--lime-bg)", border: "1px solid var(--border)" }}
        >
          <div>
            <p className="font-display font-bold text-base" style={{ color: "var(--text)" }}>Been here?</p>
            <p className="text-sm font-body mt-0.5" style={{ color: "var(--text-2)" }}>
              Share the vibe with the community
            </p>
          </div>
          <button
            onClick={() => router.push(`/search?mode=checkin&q=${encodeURIComponent(place.name)}`)}
            className="shrink-0 rounded-full px-5 py-2.5 text-sm font-body font-semibold"
            style={{ background: "var(--lime)", color: "var(--text)" }}
          >
            Check in
          </button>
        </div>
      </div>
    </div>
  );
}
