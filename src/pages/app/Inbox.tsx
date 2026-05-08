import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox as InboxIcon, Check, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { StatusPill, PriorityPill, SlaPill } from "@/components/StatusPill";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { evaluateSla } from "@/lib/sla";
import { timeAgo, cn, priorityRank, statusOrder } from "@/lib/utils";
import type { Ticket, TicketPriority, TicketStatus } from "@/lib/types";

type View = "my" | "unassigned" | "all" | "mentions" | "resolved";

const VIEW_TITLE: Record<View, string> = {
  my: "My tickets",
  unassigned: "Unassigned",
  all: "All open",
  mentions: "Mentions",
  resolved: "Resolved",
};

const VIEW_BLURB: Record<View, string> = {
  my: "Tickets assigned to you, sorted by activity.",
  unassigned: "Open tickets without an owner. Pick one up to claim it.",
  all: "Every open or pending ticket in the team queue.",
  mentions: "Tickets where someone @-mentioned you in an internal note.",
  resolved: "Recently resolved tickets across the team.",
};

export function Inbox({ view }: { view: View }) {
  const store = useStore();
  const me = store.users.find((u) => u.id === store.currentUserId);
  const [sort, setSort] = useState<"updated" | "created" | "priority" | "status">("updated");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const tickets = useMemo(() => {
    if (!me) return [];
    let xs: Ticket[] = store.tickets;
    if (view === "my") xs = xs.filter((t) => t.assigneeId === me.id && t.status !== "closed");
    else if (view === "unassigned") xs = xs.filter((t) => !t.assigneeId && t.status !== "closed");
    else if (view === "all") xs = xs.filter((t) => t.status === "open" || t.status === "pending");
    else if (view === "resolved") xs = xs.filter((t) => t.status === "resolved" || t.status === "closed");
    else if (view === "mentions") {
      const mentioned = new Set(
        store.notifications.filter((n) => n.userId === me.id && n.kind === "mention").map((n) => n.ticketId)
      );
      xs = xs.filter((t) => mentioned.has(t.id));
    }

    const sorted = [...xs];
    if (sort === "updated") sorted.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    else if (sort === "created") sorted.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    else if (sort === "priority") sorted.sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority));
    else if (sort === "status") sorted.sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
    return sorted;
  }, [store.tickets, store.notifications, view, me, sort]);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function clearSel() {
    setSelected(new Set());
  }
  const allSelected = tickets.length > 0 && tickets.every((t) => selected.has(t.id));
  function selectAll() {
    if (allSelected) clearSel();
    else setSelected(new Set(tickets.map((t) => t.id)));
  }
  function bulkSetStatus(s: TicketStatus) {
    if (!me) return;
    store.bulkUpdate(Array.from(selected), { status: s }, me.id);
    clearSel();
  }
  function bulkSetPriority(p: TicketPriority) {
    if (!me) return;
    store.bulkUpdate(Array.from(selected), { priority: p }, me.id);
    clearSel();
  }
  function bulkAssign(uid: string | undefined) {
    if (!me) return;
    store.bulkUpdate(Array.from(selected), { assigneeId: uid }, me.id);
    clearSel();
  }

  const selectionMode = selected.size > 0;

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto" data-tour="inbox-list">
      <div className="flex items-end gap-4 flex-wrap mb-6">
        <div>
          <span className="eyebrow">{VIEW_TITLE[view]}</span>
          <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
            {VIEW_TITLE[view].split(" ")[0]} <span className="text-fg-muted font-normal">{VIEW_TITLE[view].split(" ").slice(1).join(" ") || "queue"}</span>
          </h1>
          <p className="mt-1 text-[14px] text-fg-muted max-w-xl">{VIEW_BLURB[view]}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Dropdown
            value={sort}
            onChange={(v) => setSort(v as typeof sort)}
            options={[
              { value: "updated", label: "Sort: Last activity" },
              { value: "created", label: "Sort: Newest first" },
              { value: "priority", label: "Sort: Priority" },
              { value: "status", label: "Sort: Status" },
            ]}
          />
        </div>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          icon={<InboxIcon className="w-6 h-6" />}
          title="Nothing in this view."
          description={view === "my" ? "No tickets are assigned to you." : "Check back later — or browse another view from the sidebar."}
        />
      ) : (
        <GlassCard className="overflow-visible relative">
          {/* Header bar — swaps between column headers and bulk actions in place. Same height, no shift. */}
          <div className="relative h-[40px] border-b border-border/50">
            {/* column headers (always rendered, hidden when selection) */}
            <div
              className={cn(
                "absolute inset-0 px-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-fg-subtle font-medium whitespace-nowrap transition-opacity",
                selectionMode ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            >
              <button
                onClick={selectAll}
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  allSelected ? "bg-accent border-accent text-accent-fg" : "border-border-strong/60 hover:border-fg-muted"
                )}
              >
                {allSelected && <Check className="w-3 h-3" />}
              </button>
              <span className="flex-1">Subject</span>
              <span className="hidden md:inline w-32">Customer</span>
              <span className="hidden lg:inline w-28">Category</span>
              <span className="w-20">Priority</span>
              <span className="w-20">Status</span>
              <span className="hidden md:inline w-24">SLA</span>
              <span className="hidden md:inline w-24">Assignee</span>
              <span className="hidden md:inline w-24 text-right">Updated</span>
            </div>
            {/* bulk action toolbar (overlays headers when selection mode) */}
            <div
              className={cn(
                "absolute inset-0 px-4 flex items-center gap-2 transition-opacity z-[55]",
                selectionMode ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <button
                onClick={selectAll}
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                  allSelected ? "bg-accent border-accent text-accent-fg" : "border-border-strong/60 hover:border-fg-muted"
                )}
              >
                {allSelected && <Check className="w-3 h-3" />}
              </button>
              <span className="text-[13px] font-medium text-fg whitespace-nowrap">
                <span className="tabnum">{selected.size}</span> selected
              </span>
              <span className="w-px h-4 bg-border" />
              <Dropdown
                value={undefined}
                placeholder="Set status"
                onChange={(v) => v && bulkSetStatus(v as TicketStatus)}
                options={[
                  { value: "open", label: "Open" },
                  { value: "pending", label: "Pending" },
                  { value: "resolved", label: "Resolved" },
                  { value: "closed", label: "Closed" },
                ]}
              />
              <Dropdown
                value={undefined}
                placeholder="Set priority"
                onChange={(v) => v && bulkSetPriority(v as TicketPriority)}
                options={[
                  { value: "low", label: "Low" },
                  { value: "normal", label: "Normal" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
              />
              <Dropdown
                value={undefined}
                placeholder="Assign…"
                onChange={(v) => bulkAssign(v as string)}
                options={[
                  { value: "", label: "— Unassign" },
                  ...store.users
                    .filter((u) => u.role !== "customer")
                    .map((u) => ({ value: u.id, label: u.name, description: u.title })),
                ]}
              />
              <button
                onClick={clearSel}
                className="ml-auto inline-flex items-center gap-1 text-[13px] text-fg-muted hover:text-fg px-2 py-1 rounded-md hover:bg-bg-elevated/40"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>
          <ul className="divide-y divide-border/40">
            {tickets.map((t) => (
              <InboxRow
                key={t.id}
                ticket={t}
                selected={selected.has(t.id)}
                onSelect={() => toggle(t.id)}
              />
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}

function InboxRow({ ticket, selected, onSelect }: { ticket: Ticket; selected: boolean; onSelect: () => void }) {
  const store = useStore();
  const customer = store.users.find((u) => u.id === ticket.customerId);
  const assignee = store.users.find((u) => u.id === ticket.assigneeId);
  const cat = store.categories.find((c) => c.id === ticket.categoryId);
  const sla = evaluateSla(ticket, store.slaPolicies.find((s) => s.id === ticket.slaId));
  const unread = ticket.unreadByAgent;

  return (
    <li className={cn("group hover:bg-bg-elevated/50 transition-colors", selected && "bg-accent/[0.06]")}>
      <div className="flex items-center gap-3 px-4 py-3 whitespace-nowrap">
        <button
          onClick={onSelect}
          className={cn(
            "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
            selected ? "bg-accent border-accent text-accent-fg" : "border-border-strong/60 hover:border-fg-muted"
          )}
          aria-label={selected ? "Deselect" : "Select"}
        >
          {selected && <Check className="w-3 h-3" />}
        </button>
        <Link
          to={`/app/ticket/${ticket.id}`}
          className="flex-1 min-w-0 flex items-center gap-3"
          onClick={(e) => {
            if ((e.target as HTMLElement).tagName === "BUTTON") e.preventDefault();
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {unread && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
              <span className="text-[12px] font-mono tabnum text-fg-subtle whitespace-nowrap shrink-0">{ticket.id}</span>
              <span className={cn("text-[14.5px] text-fg truncate", unread && "font-semibold")}>{ticket.subject}</span>
              {ticket.replies.length > 0 && (
                <span className="text-[11px] text-fg-subtle tabnum px-1.5 py-0.5 rounded bg-bg-elevated/60 shrink-0">
                  {ticket.replies.length}
                </span>
              )}
            </div>
            <div className="md:hidden mt-1 text-[12px] text-fg-muted truncate">
              {customer?.name} · {cat?.name} · {timeAgo(ticket.updatedAt)}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1.5 w-32 min-w-0">
            <Avatar user={customer} size="xs" />
            <span className="text-[12.5px] text-fg-muted truncate">{customer?.name}</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 w-28 min-w-0">
            {cat && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `oklch(${cat.color})` }} />}
            <span className="text-[12px] text-fg-muted truncate">{cat?.name}</span>
          </div>
          <div className="w-20 shrink-0"><PriorityPill priority={ticket.priority} /></div>
          <div className="w-20 shrink-0"><StatusPill status={ticket.status} /></div>
          <div className="hidden md:block w-24 shrink-0"><SlaPill status={sla.status} /></div>
          <div className="hidden md:flex items-center gap-1.5 w-24 min-w-0">
            {assignee ? (
              <>
                <Avatar user={assignee} size="xs" />
                <span className="text-[12px] text-fg-muted truncate">{assignee.name.split(" ")[0]}</span>
              </>
            ) : (
              <span className="text-[12px] text-fg-subtle italic">Unassigned</span>
            )}
          </div>
          <div className="hidden md:block w-24 shrink-0 text-right text-[12px] text-fg-muted">{timeAgo(ticket.updatedAt)}</div>
        </Link>
      </div>
    </li>
  );
}
