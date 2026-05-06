import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeAllTickets, listAgents, listCategories } from '@/lib/queries';
import type { Ticket, User, Category } from '@/lib/types';
import { Inbox, Clock, Award, BarChart3, type LucideIcon } from 'lucide-react';
import { Avatar } from '@/components/Avatar';

export function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => subscribeAllTickets(setTickets), []);
  useEffect(() => { listAgents().then(setAgents); listCategories().then(setCats); }, []);

  const stats = useMemo(() => {
    if (!tickets) return null;
    const open = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
    const urgent = tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed');
    const responseTimes = tickets
      .filter(t => t.firstResponseAt)
      .map(t => (t.firstResponseAt as number) - t.createdAt);
    const avgMs = responseTimes.length ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
    const resolved24 = tickets.filter(t => t.resolvedAt && (Date.now() - t.resolvedAt) < 24 * 3600 * 1000).length;
    return { total: tickets.length, open: open.length, urgent: urgent.length, avgMs, resolved24 };
  }, [tickets]);

  const byCategory = useMemo(() => {
    if (!tickets) return [];
    const counts: Record<string, number> = {};
    tickets.forEach(t => { counts[t.category] = (counts[t.category] ?? 0) + 1; });
    const max = Math.max(1, ...Object.values(counts));
    return cats.map(c => ({ ...c, count: counts[c.id] ?? 0, pct: (counts[c.id] ?? 0) / max }));
  }, [tickets, cats]);

  const leaderboard = useMemo(() => {
    if (!tickets) return [];
    const map = new Map<string, { agent: User; resolved: number; open: number; avgResponseMs: number; samples: number[] }>();
    agents.forEach(a => map.set(a.uid, { agent: a, resolved: 0, open: 0, avgResponseMs: 0, samples: [] }));
    tickets.forEach(t => {
      if (!t.assigneeId) return;
      const e = map.get(t.assigneeId);
      if (!e) return;
      if (t.status === 'resolved' || t.status === 'closed') e.resolved++;
      else e.open++;
      if (t.firstResponseAt) e.samples.push((t.firstResponseAt as number) - t.createdAt);
    });
    return Array.from(map.values())
      .map(e => ({ ...e, avgResponseMs: e.samples.length ? e.samples.reduce((a, b) => a + b, 0) / e.samples.length : 0 }))
      .filter(e => e.resolved + e.open > 0)
      .sort((a, b) => b.resolved - a.resolved);
  }, [tickets, agents]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-1">Admin</p>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-fg-muted mt-1">Live view of queue health, response time, and agent throughput.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={Inbox} label="Open tickets" value={stats?.open ?? 0} hint={`${stats?.urgent ?? 0} urgent`} />
        <Stat icon={Clock} label="Avg first response" value={fmtDuration(stats?.avgMs ?? 0)} hint="across all tickets" />
        <Stat icon={Award} label="Resolved · 24h" value={stats?.resolved24 ?? 0} hint="last 24 hours" />
        <Stat icon={BarChart3} label="Total tickets" value={stats?.total ?? 0} hint="all-time" />
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="card p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="eyebrow mb-1">Volume</p>
              <h2 className="text-lg font-semibold tracking-tight">Tickets by category</h2>
            </div>
            <Link to="/admin/categories" className="btn-ghost !h-9">Manage</Link>
          </div>
          <ul className="space-y-3">
            {byCategory.map(c => (
              <li key={c.id} className="grid grid-cols-[120px_1fr_50px] items-center gap-3">
                <span className="text-sm font-medium truncate">{c.name}</span>
                <div className="h-2 rounded-full bg-bg-subtle overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.pct * 100}%`, background: c.color }} />
                </div>
                <span className="text-sm tabular-nums text-fg-muted text-right">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-7">
          <div className="mb-5">
            <p className="eyebrow mb-1">Throughput</p>
            <h2 className="text-lg font-semibold tracking-tight">Agent leaderboard</h2>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-fg-muted">No assignments yet.</p>
          ) : (
            <ul className="space-y-3">
              {leaderboard.map((e, i) => (
                <li key={e.agent.uid} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-mono tnum text-fg-subtle">{i + 1}</span>
                  <Avatar name={e.agent.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{e.agent.name}</div>
                    <div className="text-xs text-fg-subtle">avg response · {fmtDuration(e.avgResponseMs)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tnum">{e.resolved}<span className="text-fg-subtle font-normal"> resolved</span></div>
                    <div className="text-xs text-fg-subtle tnum">{e.open} open</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow">{label}</span>
        <div className="h-8 w-8 rounded-lg bg-accent/10 grid place-items-center">
          <Icon size={15} className="text-accent" />
        </div>
      </div>
      <div className="text-3xl font-semibold tracking-tight tnum">{value}</div>
      {hint && <div className="text-xs text-fg-subtle mt-1">{hint}</div>}
    </div>
  );
}

function fmtDuration(ms: number): string {
  if (!ms) return '—';
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h < 24) return rem ? `${h}h ${rem}m` : `${h}h`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}
