"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Camera, X, CheckCircle2, Eye, Users, Volume2, Heart, Loader2, Zap, Minus, Flame, Lock, MapPin, Mountain } from "lucide-react";
import { createCheckIn, uploadCheckInPhoto, type Venue } from "@/lib/api";
import { BUSY_LEVELS, VIBE_TAGS, VIEW_STATUSES, VIBE_TAG_STYLES } from "@/lib/constants";
import type { BusyLevel, VibeTag, ViewStatus } from "@/lib/constants";
import Link from "next/link";

type Props = { venue: Venue };

const BUSY_META: Record<string, { icon: React.ReactNode; desc: string }> = {
  dead:     { icon: <Minus size={20} />,  desc: "Very quiet"   },
  moderate: { icon: <Zap size={20} />,    desc: "Comfortable"  },
  packed:   { icon: <Flame size={20} />,  desc: "Full house"   },
};

const VIBE_ICONS: Record<string, React.ReactNode> = {
  chill:    <Eye size={14} />,
  lively:   <Users size={14} />,
  loud:     <Volume2 size={14} />,
  romantic: <Heart size={14} />,
};

export function CheckInFlow({ venue }: Props) {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();

  const [busyLevel, setBusyLevel] = useState<BusyLevel | null>(null);
  const [vibeTags, setVibeTags] = useState<VibeTag[]>([]);
  const [viewStatus, setViewStatus] = useState<ViewStatus>("na");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function toggleVibeTag(tag: VibeTag) {
    setVibeTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!busyLevel || !token) return;
    setSubmitting(true);
    setError("");

    try {
      let photoUrl: string | undefined;
      if (photo) {
        const uploadRes = await uploadCheckInPhoto(photo, token);
        if (uploadRes.success) photoUrl = uploadRes.data.url;
      }

      const res = await createCheckIn(
        { venueId: venue.id, busyLevel, vibeTags, viewStatus, photoUrl, isAnonymous },
        token
      );

      if (res.success) {
        setSubmitted(true);
        setTimeout(() => router.push(`/venue/${venue.id}`), 1200);
      } else {
        setError(res.error);
        setSubmitting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  // ── Auth loading ────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-3)" }} />
        <p className="text-sm font-body" style={{ color: "var(--text-3)" }}>Loading…</p>
      </div>
    );
  }

  // ── Not authenticated ───────────────────────────────────
  if (!token) {
    return (
      <div className="px-4 py-12 max-w-sm mx-auto text-center">
        <Lock size={36} className="mb-4" style={{ color: "var(--text-3)" }} />
        <h2 className="font-display italic font-bold text-xl mb-2" style={{ color: "var(--text)" }}>
          Sign in to check in
        </h2>
        <p className="text-sm font-body mb-6" style={{ color: "var(--text-2)" }}>
          You need an account to share the vibe.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-body font-semibold"
          style={{ background: "var(--text)", color: "var(--bg)" }}
        >
          Sign in
        </Link>
      </div>
    );
  }

  // ── Success state ───────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <CheckCircle2 size={40} style={{ color: "var(--live)" }} />
        <p className="font-display italic font-bold text-lg" style={{ color: "var(--text)" }}>
          Vibe posted!
        </p>
        <p className="text-sm font-body" style={{ color: "var(--text-3)" }}>Taking you back…</p>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────
  return (
    <div className="px-4 py-6 max-w-md mx-auto flex flex-col gap-8">

      {/* Venue header */}
      <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--lime)" }}>
          <MapPin size={16} style={{ color: "var(--lime-text)" }} />
        </div>
        <div className="min-w-0">
          <p className="label-muted">You&apos;re at</p>
          <p className="font-body font-semibold text-sm truncate" style={{ color: "var(--text)" }}>{venue.name}</p>
          {venue.area && <p className="text-xs font-body" style={{ color: "var(--text-3)" }}>{venue.area}</p>}
        </div>
      </div>

      {/* Q1: Busy level */}
      <div>
        <p className="font-body font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>
          How busy is it right now?
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {BUSY_LEVELS.map(({ value, label }) => {
            const selected = busyLevel === value;
            const s = VIBE_TAG_STYLES[value]!;
            const m = BUSY_META[value]!;
            return (
              <button
                key={value}
                onClick={() => setBusyLevel(value)}
                className="flex flex-col items-center gap-2 rounded-2xl py-4 transition-all active:scale-95"
                style={{
                  background: selected ? s.background : "var(--surface)",
                  color: selected ? s.color : "var(--text-2)",
                  border: `2px solid ${selected ? s.color : "var(--border)"}`,
                  boxShadow: selected ? `0 0 0 4px ${s.background}` : "none",
                }}
              >
                <span>{m.icon}</span>
                <span className="text-xs font-body font-semibold">{label}</span>
                <span className="text-[10px] font-body" style={{ color: selected ? s.color : "var(--text-3)", opacity: 0.8 }}>{m.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Q2: Vibe tags */}
      <div>
        <p className="font-body font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
          What&apos;s the vibe? <span className="font-normal" style={{ color: "var(--text-3)" }}>(pick all that apply)</span>
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {VIBE_TAGS.map(({ value, label }) => {
            const selected = vibeTags.includes(value);
            const s = VIBE_TAG_STYLES[value] ?? { background: "var(--surface-2)", color: "var(--text-3)" };
            return (
              <button
                key={value}
                onClick={() => toggleVibeTag(value)}
                className="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-body font-medium transition-all active:scale-95"
                style={{
                  background: selected ? s.background : "var(--surface)",
                  color: selected ? s.color : "var(--text-2)",
                  border: `2px solid ${selected ? s.color : "var(--border)"}`,
                }}
              >
                <span style={{ color: selected ? s.color : "var(--text-3)" }}>
                  {VIBE_ICONS[value]}
                </span>
                {label}
                {selected && (
                  <span className="ml-auto shrink-0">
                    <CheckCircle2 size={14} style={{ color: s.color }} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Q3: Burj view */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Mountain size={14} style={{ color: "var(--text-2)" }} />
          <p className="font-body font-semibold text-sm" style={{ color: "var(--text)" }}>Burj Khalifa view?</p>
        </div>
        <div className="flex gap-2">
          {VIEW_STATUSES.map(({ value, label }) => {
            const selected = viewStatus === value;
            return (
              <button
                key={value}
                onClick={() => setViewStatus(value)}
                className="flex-1 rounded-full py-2.5 text-xs font-body font-semibold transition-all"
                style={{
                  background: selected ? "var(--text)" : "var(--surface)",
                  color: selected ? "var(--bg)" : "var(--text-2)",
                  border: `1.5px solid ${selected ? "var(--text)" : "var(--border)"}`,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo upload */}
      <div>
        <p className="font-body font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>
          Add a photo <span className="font-normal" style={{ color: "var(--text-3)" }}>(optional)</span>
        </p>
        {photoPreview ? (
          <div className="relative rounded-2xl overflow-hidden">
            <img src={photoPreview} alt="Preview" className="w-full h-44 object-cover" />
            <button
              onClick={() => { setPhoto(null); setPhotoPreview(null); }}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <label
            className="flex flex-col items-center justify-center gap-2 w-full py-8 rounded-2xl cursor-pointer transition-colors"
            style={{ background: "var(--surface-2)", border: "1.5px dashed var(--border-2)" }}
          >
            <Camera size={20} style={{ color: "var(--text-3)" }} />
            <span className="text-sm font-body" style={{ color: "var(--text-3)" }}>Tap to add a photo</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
          </label>
        )}
      </div>

      {/* Anonymous toggle */}
      <div
        className="flex items-center justify-between rounded-2xl px-4 py-3.5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div>
          <p className="text-sm font-body font-medium" style={{ color: "var(--text)" }}>Post anonymously</p>
          <p className="text-xs font-body mt-0.5" style={{ color: "var(--text-3)" }}>Your name won&apos;t appear on this check-in</p>
        </div>
        <button
          onClick={() => setIsAnonymous((v) => !v)}
          className="w-11 h-6 rounded-full relative transition-colors shrink-0"
          style={{ background: isAnonymous ? "var(--text)" : "var(--border-2)" }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform"
            style={{
              background: "var(--surface)",
              transform: isAnonymous ? "translateX(19px)" : "translateX(2px)",
            }}
          />
        </button>
      </div>

      {error && (
        <p className="text-sm font-body text-center px-2" style={{ color: "var(--closed)" }}>{error}</p>
      )}

      {/* Submit */}
      <button
        disabled={!busyLevel || submitting}
        onClick={handleSubmit}
        className="w-full rounded-full py-4 text-sm font-body font-bold transition-all active:scale-[0.98] disabled:opacity-40"
        style={{ background: busyLevel ? "var(--text)" : "var(--surface-2)", color: busyLevel ? "var(--bg)" : "var(--text-3)" }}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Posting…
          </span>
        ) : (
          "Post vibe check"
        )}
      </button>

    </div>
  );
}
