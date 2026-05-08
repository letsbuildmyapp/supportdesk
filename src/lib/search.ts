import type { AppData, KbArticle, Ticket, User } from "./types";

export type SearchHit =
  | { kind: "ticket"; ticket: Ticket; score: number }
  | { kind: "article"; article: KbArticle; score: number }
  | { kind: "customer"; user: User; score: number }
  | { kind: "agent"; user: User; score: number };

function score(needle: string, hay: string): number {
  const n = needle.toLowerCase();
  const h = hay.toLowerCase();
  if (h === n) return 10;
  if (h.startsWith(n)) return 7;
  if (h.includes(n)) return 4;
  // soft fuzzy: each char in order
  let i = 0;
  for (const c of h) {
    if (c === n[i]) i++;
    if (i >= n.length) return 1.5;
  }
  return 0;
}

export function search(data: AppData, q: string): SearchHit[] {
  if (!q || !q.trim()) return [];
  const hits: SearchHit[] = [];
  // Tickets
  for (const t of data.tickets) {
    const s = Math.max(
      score(q, t.subject) * 1.2,
      score(q, t.id) * 1.5,
      score(q, t.description) * 0.5,
      ...t.tags.map((tag) => score(q, tag) * 0.8)
    );
    if (s > 0) hits.push({ kind: "ticket", ticket: t, score: s });
  }
  // Articles
  for (const a of data.kbArticles) {
    if (!a.published) continue;
    const s = Math.max(
      score(q, a.title) * 1.3,
      score(q, a.excerpt) * 0.7,
      score(q, a.body) * 0.3,
      ...a.tags.map((tag) => score(q, tag) * 0.8)
    );
    if (s > 0) hits.push({ kind: "article", article: a, score: s });
  }
  // Users — split customers vs internal
  for (const u of data.users) {
    const s = Math.max(score(q, u.name), score(q, u.email) * 0.7, score(q, u.company ?? "") * 0.6);
    if (s > 0) {
      hits.push({ kind: u.role === "customer" ? "customer" : "agent", user: u, score: s });
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 18);
}
