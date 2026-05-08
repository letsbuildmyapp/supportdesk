import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNowStrict, format, parseISO, differenceInMinutes } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STORAGE_KEY = "supportdesk:data:v1";
export const AUTH_KEY = "supportdesk:auth:v1";
export const THEME_KEY = "supportdesk:theme";
export const SEED_KEY = "supportdesk:seeded:v1";
export const TUTORIAL_KEY = (role: string) => `supportdesk:tutorial_seen:${role}`;

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function ticketId(seq: number): string {
  return `T-${String(2400 + seq).padStart(4, "0")}`;
}

export function timeAgo(iso: string): string {
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function formatDate(iso: string, fmt = "MMM d, yyyy"): string {
  try {
    return format(parseISO(iso), fmt);
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, h:mma").replace("AM", "am").replace("PM", "pm");
  } catch {
    return iso;
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function minutesBetween(aIso: string, bIso: string): number {
  return differenceInMinutes(parseISO(bIso), parseISO(aIso));
}

export function durationStr(mins: number): string {
  if (mins < 60) return `${Math.max(0, Math.round(mins))}m`;
  if (mins < 60 * 24) return `${Math.round((mins / 60) * 10) / 10}h`;
  return `${Math.round((mins / 60 / 24) * 10) / 10}d`;
}

export function pluralize(n: number, one: string, many?: string) {
  return `${n} ${n === 1 ? one : many ?? `${one}s`}`;
}

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlight(text: string, q: string): string {
  if (!q.trim()) return text;
  return text.replace(new RegExp(`(${escapeRegExp(q)})`, "ig"), '<mark class="bg-accent/20 text-fg rounded-sm px-0.5">$1</mark>');
}

// Extract @mentions from markdown body. Mentions look like @name-with-hyphens.
export function extractMentions(body: string, allUsers: { id: string; name: string }[]): string[] {
  const matches = body.match(/@([a-z0-9-]+)/gi) ?? [];
  const handles = matches.map((m) => m.slice(1).toLowerCase());
  return allUsers
    .filter((u) => handles.includes(u.name.toLowerCase().replace(/\s+/g, "-")))
    .map((u) => u.id);
}

export function userHandle(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function substituteCannedVars(
  body: string,
  ctx: { customerName?: string; agentName?: string; ticketId?: string; orgName?: string }
): string {
  return body
    .replace(/\{\{customer\.name\}\}/g, ctx.customerName ?? "there")
    .replace(/\{\{agent\.name\}\}/g, ctx.agentName ?? "the team")
    .replace(/\{\{ticket\.id\}\}/g, ctx.ticketId ?? "")
    .replace(/\{\{org\.name\}\}/g, ctx.orgName ?? "Support");
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function chooseRandom<T>(arr: T[], rng: () => number = Math.random): T {
  return arr[Math.floor(rng() * arr.length)];
}

// Deterministic small PRNG so the seed is reproducible
export function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function priorityRank(p: string): number {
  return { low: 1, normal: 2, high: 3, urgent: 4 }[p] ?? 0;
}

export function statusOrder(s: string): number {
  return { open: 1, pending: 2, resolved: 3, closed: 4 }[s] ?? 99;
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
