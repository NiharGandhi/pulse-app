import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 7200) return `${Math.floor(seconds / 3600)}h ago`;
  return "2h ago";
}

export function minutesUntilExpiry(expiresAt: string | Date): number {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  return Math.max(0, Math.floor((expiry - now) / 60000));
}

export function formatPosition(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!);
}
