"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, Search, Home, Bookmark, Trophy, LogIn, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Discover",    href: "/home" },
  { label: "Search",      href: "/search" },
  { label: "Saved",       href: "/saved" },
  { label: "Leaderboard", href: "/leaderboard" },
];

const MOBILE_NAV = [
  { label: "Discover", href: "/home",        icon: Home },
  { label: "Search",   href: "/search",      icon: Search },
  { label: "Saved",    href: "/saved",       icon: Bookmark },
  { label: "Ranks",    href: "/leaderboard", icon: Trophy },
  { label: "Profile",  href: "/profile",     icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setQ("");
    }
  }

  return (
    <>
      {/* Desktop */}
      <header
        className="hidden md:flex sticky top-0 z-30 items-center gap-4 px-6 py-3 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Link href="/home" className="flex items-center gap-2 shrink-0 mr-2">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--lime)" }} />
          <span className="font-display italic font-bold text-lg tracking-tight" style={{ color: "var(--text)" }}>
            Pulse
          </span>
        </Link>

        <nav className="flex items-center gap-0.5">
          {NAV_ITEMS.map(({ label, href }) => {
            const active = pathname === href || (href !== "/home" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn("px-4 py-1.5 rounded-full text-sm font-body transition-colors whitespace-nowrap", active ? "font-semibold" : "")}
                style={{
                  background: active ? "var(--text)" : "transparent",
                  color: active ? "var(--surface)" : "var(--text-2)",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <button
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-body shrink-0"
          style={{ border: "1px solid var(--border)", color: "var(--text-2)" }}
        >
          <MapPin size={12} style={{ color: "var(--lime-text)" }} />
          Dubai
          <span style={{ color: "var(--text-3)" }}>▾</span>
        </button>

        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 rounded-full px-4 py-2 w-56"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <Search size={14} style={{ color: "var(--text-3)" }} className="shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search restaurants, cuisines..."
            className="flex-1 bg-transparent text-sm font-body outline-none min-w-0"
          />
        </form>

        {user ? (
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-bold"
            style={{ background: "var(--lime)", color: "var(--text)" }}
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="flex items-center gap-1.5 text-sm font-body font-semibold px-4 py-1.5 rounded-full"
            style={{ background: "var(--text)", color: "var(--surface)" }}
          >
            <LogIn size={14} />
            Sign in
          </Link>
        )}
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch border-t"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {MOBILE_NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/home" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-center py-3 gap-1">
              <Icon size={20} style={{ color: active ? "var(--text)" : "var(--text-3)" }} />
              <span
                className="text-[10px] font-body"
                style={{ color: active ? "var(--text)" : "var(--text-3)", fontWeight: active ? 600 : 400 }}
              >
                {label}
              </span>
            </Link>
          );
        })}
        <Link
          href="/search?mode=checkin"
          className="absolute left-1/2 -translate-x-1/2 -top-5 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg"
          style={{ background: "var(--lime)", color: "var(--text)" }}
        >
          +
        </Link>
      </nav>
    </>
  );
}
