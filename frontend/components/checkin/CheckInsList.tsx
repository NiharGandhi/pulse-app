"use client";

import { useCheckins } from "@/hooks/useCheckins";
import { timeAgo } from "@/lib/utils";

type Props = { venueId: string };

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  packed:       { bg: "#FFD6D6", color: "#7A0000" },
  moderate:     { bg: "#FFF0CC", color: "#664800" },
  dead:         { bg: "#EDEBE8", color: "#5A5450" },
  lively:       { bg: "#EEFF99", color: "#4E6200" },
  chill:        { bg: "#CCF0FF", color: "#005A75" },
  loud:         { bg: "#FFE5CC", color: "#7A3000" },
  romantic:     { bg: "#FFD6F0", color: "#7A004F" },
  "view clear": { bg: "#D6FFE8", color: "#005A2A" },
};

export function CheckInsList({ venueId }: Props) {
  const { checkIns, loading } = useCheckins(venueId);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface-2)" }} />
        ))}
      </div>
    );
  }

  if (checkIns.length === 0) {
    return (
      <p className="text-sm font-body py-4" style={{ color: "var(--text-2)" }}>
        No recent check-ins. Be the first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {checkIns.map((ci) => (
        <div
          key={ci.id}
          className="rounded-2xl p-3"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-body font-semibold" style={{ color: "var(--text)" }}>
              {ci.isAnonymous ? "Anonymous" : (ci.username ?? "Someone")}
            </span>
            <span className="text-xs font-body" style={{ color: "var(--text-3)" }}>
              {timeAgo(ci.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[ci.busyLevel, ...ci.vibeTags, ...(ci.viewStatus === "clear" ? ["view clear"] : [])].map((tag) => {
              const s = TAG_STYLES[tag] ?? { bg: "var(--surface-2)", color: "var(--text-2)" };
              return (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-body capitalize"
                  style={{ background: s.bg, color: s.color }}
                >
                  {tag}
                </span>
              );
            })}
          </div>

          {ci.photoUrl && (
            <img
              src={ci.photoUrl}
              alt="Check-in photo"
              className="mt-2 rounded-xl w-full h-32 object-cover"
            />
          )}
        </div>
      ))}
    </div>
  );
}
