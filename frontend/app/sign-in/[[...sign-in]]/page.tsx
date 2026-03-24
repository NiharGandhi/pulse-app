"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#1A1714" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ background: "#C8FF00" }} />
            <span className="font-display font-bold text-white text-xl">Pulse</span>
          </div>
          <p className="text-sm font-body" style={{ color: "#888" }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "#141414", border: "1px solid #252525" }}>
          {error && (
            <p className="text-sm font-body rounded-xl px-4 py-3" style={{ background: "rgba(255,80,80,0.1)", color: "#FF8080" }}>
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-body uppercase tracking-widest" style={{ color: "#888" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="rounded-xl px-4 py-3 text-sm font-body text-white outline-none"
              style={{ background: "#1E1E1E", border: "1px solid #2A2A2A" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-body uppercase tracking-widest" style={{ color: "#888" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="rounded-xl px-4 py-3 text-sm font-body text-white outline-none"
              style={{ background: "#1E1E1E", border: "1px solid #2A2A2A" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-body font-semibold text-black mt-1 disabled:opacity-50"
            style={{ background: "#C8FF00" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm font-body mt-5" style={{ color: "#888" }}>
          No account?{" "}
          <Link href="/sign-up" style={{ color: "#C8FF00" }}>Create one</Link>
        </p>
      </div>
    </main>
  );
}
