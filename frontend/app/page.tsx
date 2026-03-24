"use client";

import { useState, useEffect, useRef } from "react";
import { joinWaitlist } from "@/lib/api";
import { formatPosition } from "@/lib/utils";
import { X, Twitter, Link2, Facebook, Instagram, Zap, MapPin, Users, Bookmark } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LINE_PATH =
  "M -20 1900 " +
  "C 60 1700, 80 1500, 200 1320 " +
  "C 320 1140, 480 1160, 540 1000 " +
  "C 600 840, 460 700, 540 560 " +
  "C 600 460, 720 440, 800 360 " +
  "C 890 270, 860 150, 940 90 " +
  "C 1020 30, 1180 10, 1300 -10 " +
  "C 1380 -25, 1460 -30, 1480 -40";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ position: number; alreadyJoined: boolean } | null>(null);

  const lineRef      = useRef<SVGPathElement>(null);
  const formRef      = useRef<HTMLFormElement>(null);
  const avatarRef    = useRef<HTMLDivElement>(null);
  const textLeftRef  = useRef<HTMLDivElement>(null);
  const textRightRef = useRef<HTMLDivElement>(null);
  const mockupRef    = useRef<HTMLDivElement>(null);
  const bentoRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    const ctx = gsap.context(() => {
      if (lineRef.current) {
        const len = lineRef.current.getTotalLength();
        gsap.set(lineRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(lineRef.current, { strokeDashoffset: 0, duration: 3.5, ease: "power2.inOut", delay: 0.1 });
      }

      gsap.fromTo([avatarRef.current, formRef.current],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(textLeftRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out", delay: 0.5 }
      );
      gsap.fromTo(textRightRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out", delay: 0.6 }
      );
      gsap.fromTo(mockupRef.current,
        { opacity: 0, y: 70, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power3.out", delay: 0.4 }
      );
      gsap.to(mockupRef.current, { y: -14, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.8 });

      if (bentoRef.current) {
        gsap.fromTo(bentoRef.current.querySelectorAll(".bento-card"),
          { opacity: 0, y: 44, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.72, stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: bentoRef.current, start: "top 85%", once: true } }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(""); setLoading(true);
    const res = await joinWaitlist(email.trim());
    setLoading(false);
    if (res.success) setResult(res.data);
    else setError(res.error);
  }

  function copyLink() { void navigator.clipboard.writeText(window.location.href); }
  function shareTwitter() {
    const text = encodeURIComponent(`I'm #${result?.position} on the Pulse waitlist 🔥 Real-time vibes in Dubai — join me`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }

  return (
    <main className="relative" style={{ background: "#FAFAFA", color: "#1A1714", overflowX: "hidden" }}>

      {/* ── Line SVG ─────────────────────────────────────────────────────────── */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
        viewBox="0 0 1440 1900" preserveAspectRatio="xMidYMid slice" fill="none">
        <path ref={lineRef} d={LINE_PATH} stroke="#C8FF00" strokeWidth="18" strokeLinecap="round" fill="none" />
      </svg>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-14 py-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: "#C8FF00" }} />
          <span className="font-display italic font-bold text-lg tracking-tight">Pulse.</span>
        </div>
        <a href="mailto:hello@pulse.app" className="text-sm font-body" style={{ color: "#888" }}>Contact</a>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative z-10" style={{ minHeight: "calc(100vh - 57px)", display: "flex", flexDirection: "column" }}>

        {/* Avatar + form — top center */}
        <div className="flex flex-col items-center px-6 pt-8 pb-4">
          <div ref={avatarRef} className="flex items-center gap-2 mb-5" style={{ opacity: 0 }}>
            <div className="flex -space-x-2">
              {["#C8FF00", "#FF6B6B", "#6BB8FF", "#FFB86B"].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white" style={{ background: c, zIndex: 4 - i }} />
              ))}
            </div>
            <span className="text-sm font-body" style={{ color: "#888" }}>Join 600+ others on the waitlist</span>
          </div>

          <form ref={formRef} onSubmit={handleSubmit}
            className="flex w-full max-w-md rounded-full overflow-hidden"
            style={{ border: "1.5px solid #E0E0E0", background: "#fff", opacity: 0,
              boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" required
              className="flex-1 bg-transparent px-6 py-3.5 text-sm font-body outline-none" style={{ color: "#1A1714" }} />
            <button type="submit" disabled={loading}
              className="px-6 py-3.5 text-sm font-body font-semibold text-white rounded-full shrink-0"
              style={{ background: "#1A1714", opacity: loading ? 0.6 : 1 }}>
              {loading ? "..." : "Join waitlist"}
            </button>
          </form>
          {error && <p className="mt-2 text-xs font-body" style={{ color: "#E53E3E" }}>{error}</p>}
          <p className="mt-2 text-xs font-body" style={{ color: "#bbb" }}>No spam · Early access when we launch in Dubai</p>
        </div>

        {/* Headline + mockup — stacks on mobile, splits on desktop */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-4 md:px-16 gap-0" style={{ minHeight: "420px" }}>

          {/* Mobile headline — above mockup */}
          <h1 className="md:hidden font-display italic font-bold text-center leading-[0.93] tracking-tight px-4 pb-6"
            style={{ fontSize: "clamp(2.8rem, 11vw, 4.2rem)", color: "#1A1714" }}>
            Know the vibe.{" "}
            <span style={{ color: "#C8FF00", WebkitTextStroke: "1px #8BAF00" }}>Before you arrive.</span>
          </h1>

          {/* LEFT text — desktop only */}
          <div ref={textLeftRef}
            className="hidden md:flex flex-col items-end"
            style={{ opacity: 0, flex: "1", paddingRight: "clamp(12px, 2.5vw, 40px)", alignSelf: "flex-start", marginTop: "clamp(60px, 9vw, 140px)" }}>
            <h1 className="font-display italic font-bold text-right leading-[0.92] tracking-tight"
              style={{ fontSize: "clamp(2.2rem, 3.8vw, 4.2rem)", color: "#1A1714" }}>
              Know<br />the vibe.
            </h1>
          </div>

          {/* Phone mockup — single element */}
          <div ref={mockupRef} className="flex-shrink-0"
            style={{ opacity: 0, zIndex: 10, width: "clamp(260px, 30vw, 440px)" }}>
            <div style={{
              maskImage: "linear-gradient(to bottom, black 58%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 58%, transparent 100%)",
            }}>
              <Image src="/mockups/Home.png" alt="Pulse app" width={480} height={620}
                className="w-full h-auto" priority style={{ display: "block" }} />
            </div>
          </div>

          {/* RIGHT text — desktop only */}
          <div ref={textRightRef}
            className="hidden md:flex flex-col items-start"
            style={{ opacity: 0, flex: "1", paddingLeft: "clamp(10px, 2.5vw, 10px)", alignSelf: "flex-start", marginTop: "clamp(60px, 9vw, 140px)" }}>
            <h1 className="font-display italic font-bold text-left leading-[0.92] tracking-tight"
              style={{ fontSize: "clamp(2.2rem, 3.8vw, 4.2rem)", color: "#1A1714" }}>
              Before<br />
              <span style={{ color: "#C8FF00", WebkitTextStroke: "1.5px #8BAF00" }}>you arrive.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── Bento features ───────────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 md:px-14 pt-2 pb-28 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-body uppercase tracking-widest mb-2" style={{ color: "#aaa" }}>Built for Dubai nights</p>
          <h2 className="font-display italic font-bold" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1A1714" }}>
            Everything you need<br />to go out smarter.
          </h2>
        </div>

        <div ref={bentoRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Wide dark — Live right now */}
          <div className="bento-card md:col-span-2 rounded-3xl overflow-hidden relative"
            style={{ background: "#1A1714", minHeight: "300px" }}>
            {/* Screenshot — bottom-right, showing venue photo cards */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden" style={{ zIndex: 1 }}>
              <div className="absolute right-0 top-0 bottom-[-110%]" style={{ width: "62%" }}>
                <Image src="/mockups/Search.png" alt="" fill
                  className="object-cover object-bottom" style={{ opacity: 0.85 }} />
              </div>
              {/* Strong dark gradient from left, softer on right */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to right, #1A1714 25%, rgba(26,23,20,0.92) 42%, rgba(26,23,20,0.5) 62%, rgba(26,23,20,0.1) 85%, transparent 100%)"
              }} />
              {/* Top fade so card icon/title stay readable */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to bottom, #1A1714 15%, transparent 50%)"
              }} />
            </div>
            <div className="relative z-10 p-7 flex flex-col h-full" style={{ minHeight: "300px" }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-auto"
                style={{ background: "#C8FF00" }}>
                <Zap size={18} style={{ color: "#000" }} />
              </div>
              <div className="mt-16">
                <h3 className="font-display italic font-bold text-2xl mb-2" style={{ color: "#fff" }}>Live right now</h3>
                <p className="font-body text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                  See who&apos;s checked in to every venue in the last 2 hours. Real signals, from real people inside.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Packed 🔥", "Chill ✨", "Lively 🎶"].map((t) => (
                    <span key={t} className="rounded-full px-3 py-1 text-xs font-body"
                      style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Small lime — AI vibe search */}
          <div className="bento-card rounded-3xl overflow-hidden relative"
            style={{ background: "#F0FFB3", minHeight: "300px" }}>
            {/* Screenshot at bottom */}
            <div className="absolute bottom-0 left-0 right-0" style={{ height: "55%", zIndex: 1 }}>
              <div className="relative w-full h-full overflow-hidden"
                style={{ borderRadius: "0 0 24px 24px",
                  maskImage: "linear-gradient(to bottom, transparent 0%, black 50%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 50%)" }}>
                <Image src="/mockups/Search.png" alt="" fill
                  className="object-cover object-top" style={{ opacity: 0.6 }} />
              </div>
            </div>
            <div className="relative z-10 p-6">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#C8FF00" }}>
                <MapPin size={18} style={{ color: "#000" }} />
              </div>
              <h3 className="font-display italic font-bold text-xl mb-2" style={{ color: "#1A1714" }}>AI vibe search</h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: "#5A6200" }}>
                &ldquo;Lively rooftop with Burj views in DIFC&rdquo; — our AI finds the exact spot.
              </p>
            </div>
          </div>

          {/* Small neutral — Save spots */}
          <div className="bento-card rounded-3xl overflow-hidden relative"
            style={{ background: "#F5F4F2", minHeight: "260px" }}>
            {/* Screenshot — right half, object-center shows the venue photo card */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden" style={{ zIndex: 1 }}>
              <div className="absolute right-0 top-0 bottom-0" style={{ width: "58%" }}>
                <Image src="/mockups/Saved.png" alt="" fill
                  className="object-cover object-center" style={{ opacity: 0.9 }} />
              </div>
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to right, #F5F4F2 22%, rgba(245,244,242,0.95) 38%, rgba(245,244,242,0.4) 58%, transparent 100%)"
              }} />
            </div>
            <div className="relative z-10 p-6">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#E2DDD8" }}>
                <Bookmark size={18} style={{ color: "#6E6760" }} />
              </div>
              <h3 className="font-display italic font-bold text-xl mb-2" style={{ color: "#1A1714" }}>Save your spots</h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: "#6E6760" }}>
                Bookmark venues you love and check back when they&apos;re popping off.
              </p>
            </div>
          </div>

          {/* Wide neutral — Community */}
          <div className="bento-card md:col-span-2 rounded-3xl overflow-hidden relative"
            style={{ background: "#F5F4F2", minHeight: "260px" }}>
            <div className="absolute bottom-0 right-0" style={{ width: "45%", height: "100%", zIndex: 1 }}>
              <div className="relative w-full h-full overflow-hidden"
                style={{ borderRadius: "0 24px 24px 0",
                  maskImage: "linear-gradient(to right, transparent 0%, black 40%)",
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 40%)" }}>
                <Image src="/mockups/Leaderboard.png" alt="" fill
                  className="object-cover object-top" style={{ opacity: 0.5 }} />
              </div>
            </div>
            <div className="relative z-10 p-7 flex flex-col h-full" style={{ minHeight: "260px" }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-auto"
                style={{ background: "#E2DDD8" }}>
                <Users size={18} style={{ color: "#6E6760" }} />
              </div>
              <div className="mt-16">
                <h3 className="font-display italic font-bold text-2xl mb-2" style={{ color: "#1A1714" }}>Community picks</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "#6E6760" }}>
                  See what Dubai&apos;s top explorers are checking into this week. Earn points, climb the leaderboard.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-6 md:px-14 pt-16 pb-10" style={{ borderTop: "1px solid #EBEBEB" }}>
        <div className="max-w-5xl mx-auto">
          {/* Top row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-12">
            {/* Brand */}
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: "#C8FF00" }} />
                <span className="font-display italic font-bold text-xl tracking-tight">Pulse.</span>
              </div>
              <p className="text-sm font-body leading-relaxed" style={{ color: "#888" }}>
                Real-time vibe discovery for Dubai&apos;s restaurants, bars, cafes and nightlife. Know before you go.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-3">
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-body uppercase tracking-widest mb-1" style={{ color: "#bbb" }}>Product</p>
                <a href="/how-it-works" className="text-sm font-body transition-colors" style={{ color: "#555" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#1A1714")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#555")}>How it works</a>
                <a href="/ai-search" className="text-sm font-body transition-colors" style={{ color: "#555" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#1A1714")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#555")}>AI vibe search</a>
                <a href="/how-leaderboard-works" className="text-sm font-body transition-colors" style={{ color: "#555" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#1A1714")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#555")}>Leaderboard</a>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-body uppercase tracking-widest mb-1" style={{ color: "#bbb" }}>Company</p>
                <a href="mailto:hello@pulse.app" className="text-sm font-body transition-colors" style={{ color: "#555" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#1A1714")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#555")}>Contact</a>
                <a href="/privacy" className="text-sm font-body transition-colors" style={{ color: "#555" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#1A1714")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#555")}>Privacy</a>
                <a href="/terms" className="text-sm font-body transition-colors" style={{ color: "#555" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#1A1714")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#555")}>Terms</a>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6"
            style={{ borderTop: "1px solid #EBEBEB" }}>
            <p className="text-xs font-body" style={{ color: "#bbb" }}>
              © {new Date().getFullYear()} Pulse Dubai. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C8FF00" }} />
              <p className="text-xs font-body" style={{ color: "#bbb" }}>
                Launching in Dubai — join the waitlist above
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Success modal ─────────────────────────────────────────────────────── */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setResult(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl p-8 text-center"
            style={{ background: "#fff", color: "#1A1714" }}>
            <button onClick={() => setResult(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "#F0F0F0" }}>
              <X size={14} />
            </button>
            <div className="flex items-center justify-center gap-1.5 mb-5">
              <span className="w-2 h-2 rounded-full" style={{ background: "#C8FF00" }} />
              <span className="font-display italic font-bold text-base">Pulse.</span>
            </div>
            <h2 className="font-body font-bold text-xl mb-2">
              You&apos;re #{formatPosition(result.position)} on the waitlist
            </h2>
            <p className="text-sm font-body mb-6" style={{ color: "#888" }}>
              {result.alreadyJoined ? "You're already on the list!" : "We'll let you know when a spot opens up."}
            </p>
            <p className="text-sm font-body font-semibold mb-4">Tell your friends</p>
            <div className="flex justify-center gap-5 mb-5">
              {[
                { Icon: Facebook, action: () => {} },
                { Icon: Twitter, action: shareTwitter },
                { Icon: Instagram, action: () => {} },
                { Icon: Link2, action: copyLink },
              ].map(({ Icon, action }, i) => (
                <button key={i} onClick={action}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <Icon size={20} />
                </button>
              ))}
            </div>
            <button onClick={copyLink}
              className="w-full flex items-center justify-between rounded-full px-4 py-3 text-sm font-body"
              style={{ background: "#1A1714", color: "#fff" }}>
              <span className="truncate" style={{ color: "#aaa" }}>pulse.app/waitlist</span>
              <Link2 size={14} className="shrink-0 ml-2" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
