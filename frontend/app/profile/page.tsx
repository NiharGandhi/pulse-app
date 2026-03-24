"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  MapPin, Camera, Flame, Compass, Star, Moon, Sunrise,
  Trophy, Repeat, LogOut, Bookmark, CheckCircle2,
} from "lucide-react";
import { getUserProfile, getUserContributions, getSavedVenues, type UserProfile, type Badge } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";

const ICON_MAP: Record<string, React.ReactNode> = {
  MapPin:   <MapPin size={16} />,
  Repeat:   <Repeat size={16} />,
  Compass:  <Compass size={16} />,
  Camera:   <Camera size={16} />,
  Moon:     <Moon size={16} />,
  Sunrise:  <Sunrise size={16} />,
  Flame:    <Flame size={16} />,
  Trophy:   <Trophy size={16} />,
  Star:     <Star size={16} />,
};

// ── Contribution Heatmap ───────────────────────────────────────────────────────
function ContributionMap({ data }: { data: Array<{ date: string; count: number }> }) {
  const countByDate = new Map(data.map((d) => [d.date, d.count]));
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 363);
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks: Array<Array<{ date: string; count: number; isFuture: boolean }>> = [];
  const cursor = new Date(startDate);
  while (cursor <= today) {
    const week: typeof weeks[0] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().slice(0, 10);
      week.push({ date: dateStr, count: countByDate.get(dateStr) ?? 0, isFuture: cursor > today });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  function cellColor(count: number, isFuture: boolean): string {
    if (isFuture) return "transparent";
    if (count === 0) return "var(--surface-3)";
    const i = count / maxCount;
    if (i < 0.25) return "#D6FFE8";
    if (i < 0.5)  return "#A3EFC0";
    if (i < 0.75) return "#5DD68A";
    return "#22c55e";
  }

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthLabels: Array<{ label: string; weekIdx: number }> = [];
  weeks.forEach((week, wi) => {
    const d = new Date(week[0]!.date);
    if (d.getDate() <= 7) monthLabels.push({ label: MONTHS[d.getMonth()]!, weekIdx: wi });
  });

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="label-muted">Contributions</p>
        <span className="text-xs font-body" style={{ color: "var(--text-3)" }}>
          {total} check-in{total !== 1 ? "s" : ""} this year
        </span>
      </div>

      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", maxWidth: "100%" }}
      >
        {/* Scrollable inner — heatmap is ~730px wide */}
        <div className="overflow-x-auto no-scrollbar">
          <div style={{ minWidth: "fit-content" }}>
            {/* Month labels row */}
            <div className="flex mb-1" style={{ gap: "3px", paddingLeft: "16px" }}>
              {weeks.map((_, wi) => {
                const lbl = monthLabels.find((m) => m.weekIdx === wi);
                return (
                  <div key={wi} style={{ width: "12px", flexShrink: 0 }}>
                    {lbl && (
                      <span className="font-body" style={{ fontSize: "9px", color: "var(--text-3)", whiteSpace: "nowrap" }}>
                        {lbl.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grid + day labels */}
            <div className="flex" style={{ gap: "3px" }}>
              {/* Day-of-week labels */}
              <div className="flex flex-col shrink-0" style={{ gap: "3px", marginRight: "4px", width: "12px" }}>
                {["S","M","T","W","T","F","S"].map((day, i) => (
                  <div key={i} style={{ height: "12px", display: "flex", alignItems: "center" }}>
                    {i % 2 === 1 && (
                      <span className="font-body" style={{ fontSize: "8px", color: "var(--text-3)" }}>{day}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Cells */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: "3px" }}>
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      title={cell.count > 0 ? `${cell.date}: ${cell.count} check-in${cell.count !== 1 ? "s" : ""}` : cell.date}
                      style={{ width: "12px", height: "12px", borderRadius: "2px", background: cellColor(cell.count, cell.isFuture), flexShrink: 0 }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-3 justify-end">
              <span className="font-body" style={{ fontSize: "9px", color: "var(--text-3)" }}>Less</span>
              {["var(--surface-3)", "#D6FFE8", "#A3EFC0", "#5DD68A", "#22c55e"].map((bg, i) => (
                <div key={i} style={{ width: "12px", height: "12px", borderRadius: "2px", background: bg }} />
              ))}
              <span className="font-body" style={{ fontSize: "9px", color: "var(--text-3)" }}>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Badge Card ─────────────────────────────────────────────────────────────────
function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl p-2.5 text-center w-full overflow-hidden"
      style={{
        background: badge.earned ? "var(--lime-bg)" : "var(--surface)",
        border: `1px solid ${badge.earned ? "var(--border-2)" : "var(--border)"}`,
        opacity: badge.earned ? 1 : 0.45,
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: badge.earned ? "var(--lime)" : "var(--surface-2)",
          color: badge.earned ? "var(--lime-text)" : "var(--text-3)",
        }}
      >
        {ICON_MAP[badge.icon] ?? <CheckCircle2 size={14} />}
      </div>
      <div className="w-full min-w-0">
        <p className="font-body font-semibold truncate" style={{ fontSize: "11px", color: "var(--text)" }}>{badge.name}</p>
        <p className="font-body leading-tight line-clamp-2" style={{ fontSize: "9px", color: "var(--text-3)" }}>
          {badge.description}
        </p>
      </div>
    </div>
  );
}

// ── Stat Pill ──────────────────────────────────────────────────────────────────
function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="flex-1 flex flex-col items-center gap-0.5 py-3 rounded-2xl"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
    >
      <span className="font-display font-bold text-xl" style={{ color: "var(--text)" }}>{value}</span>
      <span className="font-body text-[11px]" style={{ color: "var(--text-3)" }}>{label}</span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contributions, setContributions] = useState<Array<{ date: string; count: number }>>([]);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token) { router.push("/sign-in"); return; }
    Promise.all([
      getUserProfile(token),
      getUserContributions(token),
      getSavedVenues(token),
    ]).then(([profileRes, contribRes, savedRes]) => {
      if (profileRes.success) setProfile(profileRes.data);
      if (contribRes.success) setContributions(contribRes.data);
      if (savedRes.success) setSavedCount(savedRes.data.length);
      setLoading(false);
    });
  }, [token, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pb-24 md:pb-0" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="px-5 md:px-10 pt-8 max-w-5xl mx-auto w-full grid md:grid-cols-[280px_1fr] gap-6">
          <div className="flex flex-col gap-4">
            {[1,2,3].map((i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--surface-2)" }} />)}
          </div>
          <div className="flex flex-col gap-4">
            {[1,2].map((i) => <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: "var(--surface-2)" }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const { stats, badges } = profile;
  const displayName = profile.user.username ?? profile.user.name ?? user?.name ?? "You";
  const initials = displayName.slice(0, 2).toUpperCase();
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="min-h-screen pb-24 md:pb-0" style={{ background: "var(--bg)", color: "var(--text)", overflowX: "clip" }}>
      <Navbar />

      <div className="px-5 md:px-10 pt-8 pb-10 max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:grid md:grid-cols-[280px_1fr] gap-6 items-start">

          {/* ── Left sidebar ─────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Avatar + name */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ background: "var(--lime-bg)", border: "2px solid var(--border-2)" }}
                >
                  {profile.user.avatarUrl ? (
                    <img src={profile.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display font-bold text-2xl" style={{ color: "var(--lime-text)" }}>{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => { logout(); router.push("/"); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-3)" }}
                >
                  <LogOut size={14} />
                </button>
              </div>

              <h1 className="font-display italic font-bold text-2xl leading-tight">{displayName}</h1>
              {profile.user.username && (
                <p className="text-sm font-body mt-0.5" style={{ color: "var(--text-2)" }}>@{profile.user.username}</p>
              )}
              <p className="text-xs font-body mt-1" style={{ color: "var(--text-3)" }}>
                Member since {new Date(profile.user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 md:grid-cols-2 gap-2.5">
              <StatPill label="check-ins" value={stats.checkInCount} />
              <StatPill label="points" value={stats.points.toLocaleString()} />
              <StatPill label="streak" value={stats.currentStreak > 0 ? `${stats.currentStreak}d` : "–"} />
              <StatPill label="venues" value={stats.uniqueVenues} />
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              <Link
                href="/saved"
                className="flex items-center justify-between rounded-2xl px-3 py-3 md:px-4 md:py-3.5"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", textDecoration: "none" }}
              >
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--lime-bg)" }}>
                    <Bookmark size={13} style={{ color: "var(--lime-text)" }} />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-xs md:text-sm" style={{ color: "var(--text)" }}>Saved Places</p>
                    <p className="text-[10px] md:text-xs font-body" style={{ color: "var(--text-3)" }}>{savedCount} venue{savedCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <span style={{ color: "var(--text-3)", fontSize: "14px" }}>→</span>
              </Link>

              <Link
                href="/leaderboard"
                className="flex items-center justify-between rounded-2xl px-3 py-3 md:px-4 md:py-3.5"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", textDecoration: "none" }}
              >
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--lime-bg)" }}>
                    <Trophy size={13} style={{ color: "var(--lime-text)" }} />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-xs md:text-sm" style={{ color: "var(--text)" }}>Leaderboard</p>
                    <p className="text-[10px] md:text-xs font-body" style={{ color: "var(--text-3)" }}>{stats.points.toLocaleString()} pts</p>
                  </div>
                </div>
                <span style={{ color: "var(--text-3)", fontSize: "14px" }}>→</span>
              </Link>
            </div>
          </div>

          {/* ── Right main ───────────────────────────────── */}
          <div className="flex flex-col gap-6 min-w-0" style={{ maxWidth: "100%" }}>

            {/* Contribution heatmap */}
            <ContributionMap data={contributions} />

            {/* Badges */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="label-muted">Badges</p>
                <span className="text-xs font-body" style={{ color: "var(--text-3)" }}>
                  {earnedCount}/{badges.length} earned
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 w-full">
                {badges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
