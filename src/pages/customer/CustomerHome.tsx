import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { subscribeMyTickets } from '@/lib/queries';
import type { Ticket } from '@/lib/types';
import { PriorityChip, StatusChip } from '@/components/Chip';
import { relativeTime } from '@/lib/utils';
import { Inbox, Plus, Filter } from 'lucide-react';

export function CustomerHome() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    if (!user) return;
    return subscribeMyTickets(user.uid, setTickets);
  }, [user]);

  const filtered = (tickets ?? []).filter(t => {
    if (filter === 'open') return t.status !== 'resolved' && t.status !== 'closed';
    if (filter === 'closed') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="eyebrow mb-1">Your tickets</p>
          <h1 className="text-3xl font-semibold tracking-tight">Hello, {user?.name.split(' ')[0]}.</h1>
          <p className="text-fg-muted mt-1">Track every conversation with our support team.</p>
        </div>
        <Link to="/new" className="btn-primary"><Plus size={16} /> New ticket</Link>
      </div>

      <div className="card p-2 mb-5 inline-flex items-center gap-1">
        <Filter size={14} className="text-fg-subtle ml-2" />
        {(['all', 'open', 'closed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-bg-subtle text-fg' : 'text-fg-muted hover:bg-bg-subtle'}`}
          >
            {f === 'all' ? 'All' : f === 'open' ? 'Open' : 'Resolved'}
          </button>
        ))}
      </div>

      {tickets === null ? (
        <div className="grid gap-3">{[1,2,3].map(i => <div key={i} className="card p-6 h-24 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          {filtered.map(t => <TicketRow key={t.id} t={t} />)}
        </div>
      )}
    </div>
  );
}

function TicketRow({ t }: { t: Ticket }) {
  return (
    <Link to={`/t/${t.id}`} className="card p-5 sm:p-6 flex items-start gap-4 hover:border-accent/30 hover:shadow-card transition-all">
      <div className="hidden sm:flex h-11 w-11 rounded-xl bg-bg-subtle grid place-items-center shrink-0">
        <Inbox size={18} className="text-fg-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[11px] text-fg-subtle tnum">#{t.id.slice(-4)}</span>
          <span className="text-[11px] text-fg-subtle">·</span>
          <span className="text-[11px] text-fg-subtle">{relativeTime(t.updatedAt)}</span>
        </div>
        <div className="text-[15px] font-semibold tracking-tight truncate">{t.subject}</div>
        <div className="text-sm text-fg-muted mt-1 line-clamp-1">{t.description}</div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <StatusChip s={t.status} />
          <PriorityChip p={t.priority} />
          {t.assigneeName && <span className="chip">Agent · {t.assigneeName}</span>}
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <div className="h-14 w-14 rounded-2xl bg-accent/10 grid place-items-center mx-auto mb-5">
        <Inbox size={22} className="text-accent" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">No tickets yet.</h3>
      <p className="text-fg-muted mt-1.5 mb-6">When you open a ticket it'll show up here.</p>
      <Link to="/new" className="btn-primary inline-flex"><Plus size={16} /> Create your first ticket</Link>
    </div>
  );
}
