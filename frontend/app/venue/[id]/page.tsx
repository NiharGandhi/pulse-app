import { MapPin, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { CheckInsList } from "@/components/checkin/CheckInsList";
import { VibeSummaryBlock } from "@/components/venue/VibeSummaryBlock";
import { Navbar } from "@/components/layout/Navbar";
import { getVenue } from "@/lib/api";

type Props = { params: Promise<{ id: string }> };

function photoUrl(ref: string | null | undefined) {
  if (!ref) return null;
  return `/api/photo?ref=${encodeURIComponent(ref)}`;
}

export default async function VenuePage({ params }: Props) {
  const { id } = await params;
  const res = await getVenue(id);

  if (!res.success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <p className="font-display font-bold text-xl mb-2" style={{ color: "var(--text)" }}>Venue not found</p>
          <Link href="/home" className="text-sm font-body" style={{ color: "var(--lime-text)" }}>
            ← Back to feed
          </Link>
        </div>
      </div>
    );
  }

  const { venue, summary } = res.data;
  const photo = photoUrl(venue.photoReference);

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      {/* Hero photo */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "260px", background: photo ? undefined : "var(--surface-2)" }}
      >
        {photo && (
          <img src={photo} alt={venue.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.15) 100%)" }} />

        {/* Back */}
        <Link
          href="/home"
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.85)", color: "var(--text)" }}
        >
          <ArrowLeft size={18} />
        </Link>

        {/* Name overlay */}
        <div className="absolute bottom-5 left-5 right-5">
          <h1
            className="font-display italic font-bold text-2xl leading-tight"
            style={{ color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
          >
            {venue.name}
          </h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {venue.area && (
              <span className="flex items-center gap-1 text-sm font-body" style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                <MapPin size={12} />{venue.area}
              </span>
            )}
            {venue.googleRating && (
              <span className="flex items-center gap-1 text-sm font-body" style={{ color: "#FFD700" }}>
                <Star size={12} fill="#FFD700" style={{ color: "#FFD700" }} />{venue.googleRating}
              </span>
            )}
            {venue.category && (
              <span className="text-sm font-body capitalize" style={{ color: "rgba(255,255,255,0.8)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                {venue.category}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 pt-5 max-w-lg mx-auto">
        {/* Live vibe summary */}
        <div className="mb-5">
          <VibeSummaryBlock summary={summary} />
        </div>

        {/* Check-in CTA */}
        <Link
          href={`/checkin/${id}`}
          className="flex items-center justify-between w-full rounded-2xl p-5 mb-6"
          style={{ background: "var(--lime-bg)", border: "1px solid var(--border)", textDecoration: "none" }}
        >
          <div>
            <p className="font-display font-bold text-base" style={{ color: "var(--text)" }}>Been here?</p>
            <p className="text-sm font-body mt-0.5" style={{ color: "var(--text-2)" }}>Share the vibe</p>
          </div>
          <span
            className="rounded-full px-5 py-2.5 text-sm font-body font-semibold"
            style={{ background: "var(--lime)", color: "var(--text)" }}
          >
            Check in
          </span>
        </Link>

        {/* Recent check-ins */}
        <div>
          <p className="label-muted mb-3">Recent check-ins</p>
          <CheckInsList venueId={id} />
        </div>
      </div>
    </div>
  );
}
