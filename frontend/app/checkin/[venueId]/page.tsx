import { CheckInFlow } from "@/components/checkin/CheckInFlow";
import { getVenue } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = { params: Promise<{ venueId: string }> };

export default async function CheckInPage({ params }: Props) {
  const { venueId } = await params;
  const res = await getVenue(venueId);

  if (!res.success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <p className="font-display italic font-bold text-xl mb-2" style={{ color: "var(--text)" }}>
            Venue not found
          </p>
          <Link href="/home" className="text-sm font-body" style={{ color: "var(--lime-text)" }}>
            ← Back to feed
          </Link>
        </div>
      </div>
    );
  }

  const { venue } = res.data;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header
        className="px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <Link href={`/venue/${venueId}`} className="p-1" style={{ color: "var(--text-2)" }}>
          <ArrowLeft size={20} />
        </Link>
        <span className="font-display italic font-bold text-base" style={{ color: "var(--text)" }}>
          Vibe check
        </span>
      </header>
      <CheckInFlow venue={venue} />
    </div>
  );
}
