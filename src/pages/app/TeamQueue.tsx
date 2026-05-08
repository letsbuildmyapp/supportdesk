import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DndContext, useDraggable, useDroppable, useSensor, useSensors, PointerSensor, type DragEndEvent } from "@dnd-kit/core";
import { GripVertical, Inbox, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Avatar } from "@/components/Avatar";
import { StatusPill, PriorityPill, SlaPill } from "@/components/StatusPill";
import { evaluateSla } from "@/lib/sla";
import { cn, timeAgo } from "@/lib/utils";
import type { Ticket, User } from "@/lib/types";

export function TeamQueue() {
  const store = useStore();
  const me = store.users.find((u) => u.id === store.currentUserId);
  const agents = store.users.filter((u) => u.role === "agent" || u.role === "manager");
  const open = store.tickets.filter((t) => t.status === "open" || t.status === "pending");

  const [activeId, setActiveId] = useState<string | null>(null);
  // Pointer sensor with activation distance — short drags below 6px register as clicks.
  // We also use this so drag-and-drop-back-to-same-spot doesn't open the ticket.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over || !me) return;
    const ticketId = String(active.id);
    const newAssignee = String(over.id) === "lane-unassigned" ? undefined : String(over.id);
    const t = store.tickets.find((x) => x.id === ticketId);
    if (!t) return;
    if (t.assigneeId === newAssignee) return;
    store.assign(ticketId, newAssignee, me.id);
    const a = store.users.find((u) => u.id === newAssignee);
    toast.success(`Reassigned to ${a?.name ?? "Unassigned"}`);
  }

  const lanes: Array<{ id: string; label: string; user?: User }> = [
    { id: "lane-unassigned", label: "Unassigned" },
    ...agents.map((a) => ({ id: a.id, label: a.name, user: a })),
  ];

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1500px] mx-auto">
      <div className="mb-6">
        <span className="eyebrow">Team queue</span>
        <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
          <span className="italic">Where</span> work lives.
        </h1>
        <p className="mt-1.5 text-[14px] text-fg-muted">Drag a ticket between agents to reassign. Filtered to open and pending only.</p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1">
          {lanes.map((lane) => {
            const items = open.filter((t) => (lane.id === "lane-unassigned" ? !t.assigneeId : t.assigneeId === lane.id));
            return <Lane key={lane.id} lane={lane} items={items} activeId={activeId} />;
          })}
        </div>
      </DndContext>
    </div>
  );
}

function Lane({ lane, items, activeId }: { lane: { id: string; label: string; user?: User }; items: Ticket[]; activeId: string | null }) {
  const { setNodeRef, isOver } = useDroppable({ id: lane.id });
  return (
    <div className="w-72 shrink-0 flex flex-col">
      <GlassCard
        variant="strong"
        className={cn("px-3 py-2.5 mb-2 sticky top-0 z-10 transition-colors", isOver && "ring-2 ring-accent/60")}
      >
        <div className="flex items-center gap-2.5">
          {lane.user ? <Avatar user={lane.user} size="sm" showStatus /> : <span className="w-7 h-7 rounded-full bg-bg-elevated/60 border border-dashed border-border-strong/60 flex items-center justify-center text-fg-muted"><Inbox className="w-3.5 h-3.5" /></span>}
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-fg truncate">{lane.label}</div>
            <div className="text-[11px] text-fg-muted">{lane.user?.title ?? "Up for grabs"}</div>
          </div>
          <span className="tabnum text-[12px] font-medium text-fg-muted px-1.5 py-0.5 rounded-md bg-bg-elevated/60">{items.length}</span>
        </div>
      </GlassCard>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 min-h-[120px] flex-1 px-1 py-1 rounded-2xl transition-colors",
          isOver && "bg-accent/5"
        )}
      >
        {items.length === 0 && (
          <div className="text-center py-6 text-[12px] text-fg-subtle italic">No open tickets here.</div>
        )}
        {items.map((t) => (
          <DraggableCard key={t.id} ticket={t} dragging={activeId === t.id} />
        ))}
      </div>
    </div>
  );
}

function DraggableCard({ ticket, dragging }: { ticket: Ticket; dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: ticket.id });
  const store = useStore();
  const nav = useNavigate();
  const customer = store.users.find((u) => u.id === ticket.customerId);
  const sla = evaluateSla(ticket, store.slaPolicies.find((s) => s.id === ticket.slaId));
  const cat = store.categories.find((c) => c.id === ticket.categoryId);

  // Distinguish click from drag: PointerSensor activates only past 6px of movement.
  // We track pointer-down position so a drag that ends back at the start doesn't
  // navigate, and a true click does.
  const [downAt, setDownAt] = useState<{ x: number; y: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    setDownAt({ x: e.clientX, y: e.clientY });
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!downAt) return;
    const dx = e.clientX - downAt.x;
    const dy = e.clientY - downAt.y;
    const moved = Math.hypot(dx, dy) > 6;
    setDownAt(null);
    // If we're currently dragging or moved beyond threshold, do not navigate.
    if (moved || isDragging) return;
    // Plain click — open ticket
    nav(`/app/ticket/${ticket.id}`);
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      className={cn(
        "rounded-xl glass-card p-3 pr-2 cursor-grab active:cursor-grabbing relative group select-none",
        (dragging || isDragging) && "opacity-60 shadow-glass-lg ring-2 ring-accent/50"
      )}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          nav(`/app/ticket/${ticket.id}`);
        }
      }}
      {...listeners}
      {...attributes}
    >
      {/* Open-ticket button — sits above drag listeners.
         Stop pointer-down propagation so dnd-kit doesn't see the press as a drag start. */}
      <Link
        to={`/app/ticket/${ticket.id}`}
        title="Open ticket"
        aria-label={`Open ${ticket.id}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-1.5 right-1.5 z-10 inline-flex items-center justify-center w-7 h-7 rounded-lg text-fg-muted hover:text-accent hover:bg-bg-elevated/80 transition-colors opacity-60 group-hover:opacity-100"
      >
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>

      <div className="flex items-start gap-2 pr-7">
        <GripVertical className="w-3 h-3 text-fg-subtle/60 mt-1 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1 whitespace-nowrap">
            <span className="text-[11px] font-mono tabnum text-fg-subtle">{ticket.id}</span>
            <PriorityPill priority={ticket.priority} className="!text-[10px] !px-1.5" />
          </div>
          <div className="text-[13px] text-fg leading-snug line-clamp-2">{ticket.subject}</div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <Avatar user={customer} size="xs" />
            <span className="text-[11px] text-fg-muted truncate max-w-[120px]">{customer?.name}</span>
            {cat && (
              <span className="text-[10px] text-fg-subtle whitespace-nowrap">· {cat.name}</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <StatusPill status={ticket.status} className="!text-[10px] !px-1.5" />
            <SlaPill status={sla.status} className="!text-[10px] !px-1.5" />
            <span className="ml-auto text-[10px] text-fg-subtle whitespace-nowrap">{timeAgo(ticket.updatedAt).replace(" ago", "")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
