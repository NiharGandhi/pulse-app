import type { VibeSummary } from "@/lib/api";

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

function Tag({ label }: { label: string }) {
  const style = TAG_STYLES[label] ?? { bg: "var(--surface-2)", color: "var(--text-2)" };
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-body font-medium capitalize"
      style={{ background: style.bg, color: style.color }}
    >
      {label}
    </span>
  );
}

type Props = { summary: VibeSummary };

export function VibeSummaryBlock({ summary }: Props) {
  if (!summary || summary.checkInCount === 0) {
    return (
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-sm font-body" style={{ color: "var(--text-2)" }}>
          No recent vibes. Check in to start the pulse.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="label-muted">Live right now</span>
        <span className="flex items-center gap-1.5 text-xs font-body font-semibold" style={{ color: "var(--lime-text)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--live)" }} />
          {summary.checkInCount} check-in{summary.checkInCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {summary.dominantBusyLevel && <Tag label={summary.dominantBusyLevel} />}
        {summary.topVibeTags.map((tag) => <Tag key={tag} label={tag} />)}
        {summary.dominantViewStatus === "clear" && <Tag label="view clear" />}
      </div>
    </div>
  );
}
