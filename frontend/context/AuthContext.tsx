"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((tok: string, u: AuthUser) => {
    setToken(tok);
    setUser(u);
    localStorage.setItem("pulse_token", tok);
    document.cookie = `pulse_token=${tok}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }, []);

  const clear = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("pulse_token");
    document.cookie = "pulse_token=; path=/; max-age=0";
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("pulse_token");
    if (!stored) { setLoading(false); return; }

    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${stored}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.success) persist(stored, res.data);
        else clear();
      })
      .catch(() => clear())
      .finally(() => setLoading(false));
  }, [persist, clear]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error ?? "Login failed");
    persist(data.data.token, data.data.user);
  }, [persist]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error ?? "Registration failed");
    persist(data.data.token, data.data.user);
  }, [persist]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout: clear }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
