"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { CheckCircle2, Camera, Flame, Compass } from "lucide-react";

const HOW_POINTS = [
  { icon: <CheckCircle2 size={15} />, text: "Vibe check-in",  pts: "+10 pts" },
  { icon: <Camera size={15} />,       text: "Photo upload",    pts: "+25 pts" },
  { icon: <Flame size={15} />,        text: "Weekly streak",   pts: "×2 bonus" },
  { icon: <Compass size={15} />,      text: "New discovery",   pts: "+50 pts" },
];

const RANK_LABEL = ["1st", "2nd", "3rd"];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then((res) => {
      if (res.success) setEntries(res.data);
      setLoading(false);
    });
  }, []);

  const myEntry = user
    ? entries.find((e) => e.username === user.username || e.username === user.name)
    : null;

  return (
    <div className="min-h-screen pb-24 md:pb-0" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      <div className="px-5 md:px-8 pt-8 max-w-lg mx-auto">
        {/* Header */}
        <p className="label-muted mb-2">Community</p>
        <h1 className="font-display italic font-bold text-3xl mb-1">Leaderboard</h1>
        <p className="text-sm font-body mb-7" style={{ color: "var(--text-2)" }}>
          Top Pulse contributors this month
        </p>

        {/* My rank */}
        {myEntry && (
          <div
            className="rounded-2xl p-4 mb-5"
            style={{ background: "var(--lime-bg)", border: "1px solid var(--border)" }}
          >
            <p className="label-muted mb-3">Your stats</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-2xl" style={{ color: "var(--lime-text)" }}>
                  #{myEntry.rank}
                </span>
                <div>
                  <p className="font-body font-semibold text-sm" style={{ color: "var(--text)" }}>
                    {myEntry.username ?? "You"}
                  </p>
                  <p className="text-xs font-body" style={{ color: "var(--text-2)" }}>
                    {myEntry.checkInCount} check-ins
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-2xl" style={{ color: "var(--lime-text)" }}>
                  {myEntry.points.toLocaleString()}
                </p>
                <p className="text-xs font-body" style={{ color: "var(--text-3)" }}>points</p>
              </div>
            </div>
          </div>
        )}

        {/* How points work */}
        <div
          className="rounded-2xl p-4 mb-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
        >
          <p className="label-muted mb-3">How points work</p>
          <div className="flex flex-col gap-3">
            {HOW_POINTS.map(({ icon, text, pts }) => (
              <div key={text} className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-sm font-body" style={{ color: "var(--text)" }}>
                  <span className="w-5 flex items-center justify-center shrink-0" style={{ color: "var(--text-2)" }}>{icon}</span>
                  {text}
                </span>
                <span className="font-body font-bold text-sm px-2.5 py-0.5 rounded-full"
                  style={{ background: "var(--lime-bg)", color: "var(--lime-text)" }}>
                  {pts}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rankings */}
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface-2)" }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="font-display font-bold text-xl mb-1">No rankings yet</h2>
            <p className="text-sm font-body" style={{ color: "var(--text-2)" }}>
              Be the first to check in and claim #1.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => {
              const isTop3 = entry.rank <= 3;
              const isMe = myEntry?.userId === entry.userId;
              return (
                <div
                  key={entry.userId}
                  className="flex items-center gap-3 rounded-2xl p-4"
                  style={{
                    background: isMe ? "var(--lime-bg)" : isTop3 ? "var(--surface)" : "var(--surface)",
                    border: `1px solid ${isMe ? "var(--border-2)" : "var(--border)"}`,
                    boxShadow: isTop3 ? "var(--shadow-card)" : "none",
                  }}
                >
                  {/* Rank */}
                  <div className="w-7 text-center shrink-0">
                    {isTop3 ? (
                      <span
                        className="font-display font-bold text-xs"
                        style={{ color: "var(--lime-text)" }}
                      >
                        {RANK_LABEL[entry.rank - 1]}
                      </span>
                    ) : (
                      <span className="font-body font-bold text-sm" style={{ color: "var(--text-3)" }}>
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ background: "var(--surface-2)" }}
                  >
                    {entry.avatarUrl ? (
                      <img src={entry.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-body font-bold text-sm" style={{ color: "var(--text-2)" }}>
                        {(entry.username ?? "?")[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Name + stats */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm truncate" style={{ color: "var(--text)" }}>
                      {entry.username ?? "Anonymous"}
                      {isMe && <span className="ml-1.5 text-[10px] font-normal" style={{ color: "var(--text-3)" }}>· you</span>}
                    </p>
                    <p className="text-xs font-body" style={{ color: "var(--text-2)" }}>
                      {entry.checkInCount} check-in{entry.checkInCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-lg leading-tight" style={{ color: isTop3 ? "var(--lime-text)" : "var(--text)" }}>
                      {entry.points.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-body" style={{ color: "var(--text-3)" }}>pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
