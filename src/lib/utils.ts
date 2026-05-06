import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Priority, Status } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export function formatDateTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function priorityLabel(p: Priority) {
  return { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' }[p];
}

export function priorityClasses(p: Priority): string {
  switch (p) {
    case 'urgent': return 'bg-danger/10 text-danger border-danger/20';
    case 'high':   return 'bg-warn/10 text-warn border-warn/20';
    case 'normal': return 'bg-accent/10 text-accent border-accent/20';
    case 'low':    return 'bg-bg-subtle text-fg-muted border-line';
  }
}

export function statusLabel(s: Status) {
  return { open: 'Open', in_progress: 'In progress', waiting: 'Waiting', resolved: 'Resolved', closed: 'Closed' }[s];
}

export function statusClasses(s: Status): string {
  switch (s) {
    case 'open':        return 'bg-accent/10 text-accent border-accent/20';
    case 'in_progress': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'waiting':     return 'bg-warn/10 text-warn border-warn/20';
    case 'resolved':    return 'bg-success/10 text-success border-success/20';
    case 'closed':      return 'bg-bg-subtle text-fg-muted border-line';
  }
}

export function initials(name: string) {
  return name.split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export function avatarColor(seed: string): string {
  const palette = ['#f97316', '#0ea5e9', '#10b981', '#a855f7', '#f43f5e', '#eab308', '#06b6d4', '#8b5cf6'];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
