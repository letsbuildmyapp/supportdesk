import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Inbox, MessageSquarePlus, Filter, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Button } from "@/components/Button";
import { StatusPill, PriorityPill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { timeAgo, cn } from "@/lib/utils";
import type { TicketStatus } from "@/lib/types";

export function MyTickets() {
  const store = useStore();
  const me = store.users.find((u) => u.id === store.currentUserId);
  const fallbackCustomer = me?.role === "customer" ? me : store.users.find((u) => u.id === "c_aisha");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [q, setQ] = useState("");

  const myTickets = useMemo(() => {
    if (!fallbackCustomer) return [];
    let xs = store.tickets.filter((t) => t.customerId === fallbackCustomer.id);
    if (status !== "all") xs = xs.filter((t) => t.status === status);
    if (q.trim()) {
      const ql = q.toLowerCase();
      xs = xs.filter((t) => t.subject.toLowerCase().includes(ql) || t.id.toLowerCase().includes(ql));
    }
    return xs.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [store.tickets, fallbackCustomer, status, q]);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <span className="eyebrow">Your tickets</span>
          <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
            <span className="italic">Everything</span> you've raised.
          </h1>
        </div>
        <Button variant="primary" size="md" className="shrink-0">
          <Link to="/portal/new" className="flex items-center gap-2">
            <MessageSquarePlus className="w-3.5 h-3.5" />
            New ticket
          </Link>
        </Button>
      </div>

      <GlassCard variant="strong" className="px-3 sm:px-4 py-2.5 flex items-center gap-3 mb-4">
        <Search className="w-4 h-4 text-fg-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by subject or ticket ID…"
          className="flex-1 bg-transparent outline-none text-[14px] text-fg placeholder:text-fg-subtle"
        />
        <Filter className="w-3.5 h-3.5 text-fg-subtle" />
      </GlassCard>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {(["all", "open", "pending", "resolved", "closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "px-3 py-1.5 rounded-full text-[12.5px] font-medium border transition-colors capitalize",
              status === s
                ? "bg-accent text-accent-fg border-accent"
                : "bg-bg-elevated/40 border-border-strong/50 text-fg-muted hover:text-fg hover:bg-bg-elevated/60"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {myTickets.length === 0 ? (
        <EmptyState
          icon={<Inbox className="w-6 h-6" />}
          title="Nothing here yet."
          description={status === "all" ? "You haven't raised any tickets yet. Submit one and we'll get started." : `No tickets in ${status}.`}
          action={
            <Link to="/portal/new">
              <Button variant="primary">
                <MessageSquarePlus className="w-4 h-4" />
                Submit a ticket
              </Button>
            </Link>
          }
        />
      ) : (
        <GlassCard className="divide-y divide-border/60 overflow-hidden">
          {myTickets.map((t) => {
            const cat = store.categories.find((c) => c.id === t.categoryId);
            const assignee = store.users.find((u) => u.id === t.assigneeId);
            const lastReply = t.replies.filter((r) => !r.isInternal).at(-1);
            return (
              <Link
                key={t.id}
                to={`/portal/ticket/${t.id}`}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-bg-elevated/40 transition-colors"
              >
                {t.unreadByCustomer && <span className="w-2 h-2 rounded-full bg-accent shrink-0 -ml-1" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-mono tabnum text-fg-subtle">{t.id}</span>
                    <span className={cn("text-[15px] font-medium text-fg truncate", t.unreadByCustomer && "font-semibold")}>
                      {t.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[12px] text-fg-muted flex-wrap">
                    {cat && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(${cat.color})` }} />
                        {cat.name}
                      </span>
                    )}
                    <span>·</span>
                    <span>Updated {timeAgo(t.updatedAt)}</span>
                    {lastReply && (
                      <>
                        <span>·</span>
                        <span className="truncate max-w-[260px]">
                          {store.users.find((u) => u.id === lastReply.authorId)?.name?.split(" ")[0] ?? "—"}: {lastReply.body.slice(0, 60).replace(/\n/g, " ")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityPill priority={t.priority} />
                  <StatusPill status={t.status} />
                  {assignee && <Avatar user={assignee} size="sm" />}
                </div>
              </Link>
            );
          })}
        </GlassCard>
      )}
    </div>
  );
}
