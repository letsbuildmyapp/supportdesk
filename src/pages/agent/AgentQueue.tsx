import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { subscribeAllTickets } from '@/lib/queries';
import type { Ticket, Status } from '@/lib/types';
import { PriorityChip, StatusChip } from '@/components/Chip';
import { Avatar } from '@/components/Avatar';
import { relativeTime, statusLabel } from '@/lib/utils';
import { Search, AlertCircle } from 'lucide-react';

type Tab = 'mine' | 'unassigned' | 'open' | 'all';
const TABS: { id: Tab; label: string }[] = [
  { id: 'mine', label: 'Assigned to me' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'open', label: 'All open' },
  { id: 'all', label: 'All tickets' },
];

export function AgentQueue() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [tab, setTab] = useState<Tab>('mine');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'any'>('any');

  useEffect(() => subscribeAllTickets(setTickets), []);

  const filtered = useMemo(() => {
    if (!tickets || !user) return [];
    let list = tickets;
    if (tab === 'mine') list = list.filter(t => t.assigneeId === user.uid);
    else if (tab === 'unassigned') list = list.filter(t => !t.assigneeId);
    else if (tab === 'open') list = list.filter(t => t.status !== 'resolved' && t.status !== 'closed');
    if (statusFilter !== 'any') list = list.filter(t => t.status === statusFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(t =>
        t.subject.toLowerCase().includes(s) ||
        t.customerName.toLowerCase().includes(s) ||
        t.id.toLowerCase().includes(s));
    }
    return list;
  }, [tickets, user, tab, statusFilter, search]);

  const counts = useMemo(() => {
    if (!tickets || !user) return { mine: 0, unassigned: 0, open: 0, all: 0 };
    return {
      mine: tickets.filter(t => t.assigneeId === user.uid && t.status !== 'resolved' && t.status !== 'closed').length,
      unassigned: tickets.filter(t => !t.assigneeId && t.status !== 'resolved' && t.status !== 'closed').length,
      open: tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length,
      all: tickets.length,
    };
  }, [tickets, user]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-7">
        <p className="eyebrow mb-1">Queue</p>
        <h1 className="text-3xl font-semibold tracking-tight">Hi {user?.name.split(' ')[0]} — let's clear the board.</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="card p-1 inline-flex items-center gap-1">
          {TABS.map(t => {
            const c = (counts as any)[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`h-9 px-3.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 ${tab === t.id ? 'bg-bg-subtle text-fg' : 'text-fg-muted hover:bg-bg-subtle'}`}
              >
                {t.label}
                {c > 0 && (
                  <span className={`tnum text-[11px] h-5 min-w-[20px] px-1.5 rounded-md grid place-items-center font-semibold ${tab === t.id ? 'bg-accent text-white' : 'bg-bg-hover text-fg-muted'}`}>{c}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, customer, or ID…"
            className="input !h-10 !pl-9 w-72"
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | 'any')} className="input !h-10 !w-44">
          <option value="any">Any status</option>
          {(['open','in_progress','waiting','resolved','closed'] as Status[]).map(s => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
      </div>

      {tickets === null ? (
        <div className="grid gap-3">{[1,2,3,4].map(i => <div key={i} className="card p-6 h-20 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-bg-subtle grid place-items-center mx-auto mb-5">
            <AlertCircle size={22} className="text-fg-subtle" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">Nothing here.</h3>
          <p className="text-fg-muted mt-1.5">No tickets match this filter. Try widening it.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-line">
            {filtered.map(t => (
              <li key={t.id}>
                <Link to={`/t/${t.id}`} className="flex items-start gap-4 p-5 hover:bg-bg-subtle/60 transition-colors">
                  <PriorityChip p={t.priority} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[11px] text-fg-subtle tnum">#{t.id.slice(-4)}</span>
                      <span className="text-[15px] font-semibold tracking-tight truncate">{t.subject}</span>
                    </div>
                    <div className="text-sm text-fg-muted line-clamp-1">{t.description}</div>
                    <div className="flex items-center gap-3 mt-2.5 flex-wrap text-xs text-fg-subtle">
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar name={t.customerName} size={18} /> {t.customerName}
                      </span>
                      <span>·</span>
                      <span>{relativeTime(t.updatedAt)}</span>
                      <span>·</span>
                      <span>Category · {t.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusChip s={t.status} />
                    {t.assigneeName ? (
                      <span className="text-xs text-fg-muted truncate max-w-[140px]">→ {t.assigneeName}</span>
                    ) : (
                      <span className="text-xs text-warn font-semibold">Unassigned</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
