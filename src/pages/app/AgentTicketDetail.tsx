import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, Lock, MessageSquare, AlertTriangle, ExternalLink, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Avatar } from "@/components/Avatar";
import { StatusPill, PriorityPill, SlaPill } from "@/components/StatusPill";
import { Markdown } from "@/components/Markdown";
import { Composer } from "@/components/Composer";
import { Dropdown } from "@/components/Dropdown";
import { Button } from "@/components/Button";
import { AttachmentList } from "@/components/FileUpload";
import { evaluateSla } from "@/lib/sla";
import { formatDateTime, timeAgo, cn, durationStr } from "@/lib/utils";
import type { Ticket, TicketPriority, TicketStatus } from "@/lib/types";

export function AgentTicketDetail() {
  const { id } = useParams();
  const store = useStore();
  const nav = useNavigate();
  const ticket = store.tickets.find((t) => t.id === id);
  const me = store.users.find((u) => u.id === store.currentUserId);

  useEffect(() => {
    if (ticket && ticket.unreadByAgent) {
      const t = setTimeout(() => store.markRead(ticket.id, "agent"), 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line
  }, [ticket?.id]);

  if (!ticket || !me) {
    return (
      <div className="px-6 py-12 text-center">
        <h2 className="font-display text-[34px] text-fg italic">Ticket not found.</h2>
        <Link to="/app" className="inline-block mt-4 text-accent hover:underline">
          ← Back to inbox
        </Link>
      </div>
    );
  }

  const customer = store.users.find((u) => u.id === ticket.customerId);
  const assignee = store.users.find((u) => u.id === ticket.assigneeId);
  const cat = store.categories.find((c) => c.id === ticket.categoryId);
  const sla = store.slaPolicies.find((s) => s.id === ticket.slaId);
  const slaInfo = evaluateSla(ticket, sla);
  const customerTickets = store.tickets.filter((t) => t.customerId === ticket.customerId && t.id !== ticket.id);

  const timeline = useMemo(() => {
    const items: Array<
      | { kind: "reply"; at: string; payload: import("@/lib/types").Reply }
      | { kind: "event"; at: string; payload: import("@/lib/types").TicketEvent }
    > = [
      ...ticket.replies.map((r) => ({ kind: "reply" as const, at: r.createdAt, payload: r })),
      ...ticket.events.map((e) => ({ kind: "event" as const, at: e.createdAt, payload: e })),
    ];
    items.sort((a, b) => (a.at < b.at ? -1 : 1));
    return items;
  }, [ticket]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-0 min-h-[calc(100vh-3.5rem)] max-w-5xl mx-auto">
      <div className="px-4 sm:px-6 py-5 min-w-0">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? nav(-1) : nav("/app"))}
          className="inline-flex items-center gap-1 text-[13px] text-fg-muted hover:text-fg mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="flex items-start gap-3 flex-wrap mb-3">
          <span className="text-[12.5px] font-mono tabnum text-fg-subtle pt-1">{ticket.id}</span>
          <h1 className="font-display text-[28px] sm:text-[34px] leading-tight text-fg flex-1 min-w-0">{ticket.subject}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <StatusPill status={ticket.status} />
          <PriorityPill priority={ticket.priority} />
          {cat && (
            <span className="inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-full border border-border bg-bg-elevated/40 text-fg-muted">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(${cat.color})` }} />
              {cat.name}
            </span>
          )}
          <SlaPill status={slaInfo.status} />
          <span className="text-[12px] text-fg-subtle ml-auto">Opened {timeAgo(ticket.createdAt)}</span>
        </div>

        {/* SLA banner if approaching/breached */}
        {slaInfo.status !== "ok" && slaInfo.status !== "n/a" && (
          <div
            className={cn(
              "mb-4 rounded-2xl px-4 py-3 flex items-center gap-3",
              slaInfo.status === "breached"
                ? "bg-status-breach/15 text-status-breach border border-status-breach/40"
                : "bg-status-pending/15 text-status-pending border border-status-pending/40"
            )}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <div className="text-[13px] leading-snug flex-1">
              {slaInfo.responseStatus === "breached" || slaInfo.responseStatus === "approaching"
                ? `First-response SLA ${slaInfo.responseStatus === "breached" ? "breached" : "approaching"} — ${durationStr(Math.abs(slaInfo.responseRemainingMins))} ${slaInfo.responseRemainingMins < 0 ? "over" : "left"}.`
                : `Resolution SLA ${slaInfo.resolutionStatus === "breached" ? "breached" : "approaching"} — ${durationStr(Math.abs(slaInfo.resolutionRemainingMins))} ${slaInfo.resolutionRemainingMins < 0 ? "over" : "left"}.`}
            </div>
          </div>
        )}

        {/* Original */}
        <ThreadEntry
          author={customer}
          content={ticket.description}
          attachments={ticket.attachments}
          createdAt={ticket.createdAt}
          kind="customer"
        />

        {timeline.map((it, i) => {
          if (it.kind === "reply") {
            const r = it.payload;
            const author = store.users.find((u) => u.id === r.authorId);
            return (
              <ThreadEntry
                key={r.id}
                author={author}
                content={r.body}
                attachments={r.attachments}
                createdAt={r.createdAt}
                isInternal={r.isInternal}
                kind={author?.role === "customer" ? "customer" : "agent"}
              />
            );
          }
          const e = it.payload;
          const labels: Record<string, string> = {
            status_changed: `Status → ${e.meta?.to ?? "—"}`,
            priority_changed: `Priority → ${e.meta?.to ?? "—"}`,
            assigned: `Assigned → ${e.meta?.to === "unassigned" ? "unassigned" : (store.users.find((u) => u.id === e.meta?.to)?.name ?? "—")}`,
            category_changed: `Category changed`,
            csat_submitted: "Customer submitted CSAT",
            reopened: "Reopened by reply",
            closed: "Closed",
          };
          const actor = store.users.find((u) => u.id === e.actorId);
          return (
            <div key={e.id ?? i} className="flex items-center gap-3 my-3 ml-12 text-[12px] text-fg-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-fg-subtle/60" />
              <span>{labels[e.type] ?? e.type}</span>
              {actor && (
                <>
                  <span>·</span>
                  <span>{actor.name.split(" ")[0]}</span>
                </>
              )}
              <span>·</span>
              <span>{timeAgo(e.createdAt)}</span>
            </div>
          );
        })}

        {ticket.csat && (
          <GlassCard className="mt-4 p-4 flex items-center gap-3">
            <span className="text-[13px] text-fg-muted">
              <span className="text-status-pending font-medium tabnum">{ticket.csat.rating}/5</span> CSAT
              {ticket.csat.comment && <> — "<span className="text-fg">{ticket.csat.comment}</span>"</>}
            </span>
            <span className="ml-auto text-[11px] text-fg-subtle">{timeAgo(ticket.csat.submittedAt)}</span>
          </GlassCard>
        )}

        {ticket.status !== "closed" && (
          <div className="mt-5">
            <Composer
              ticketId={ticket.id}
              onSent={() => {
                toast.success("Sent");
              }}
            />
          </div>
        )}
      </div>

      {/* Right rail */}
      <aside className="lg:border-l lg:border-border/50 lg:bg-bg-elevated/40 p-5 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto space-y-5">
        <Section label="Status">
          <Dropdown<TicketStatus>
            value={ticket.status}
            onChange={(v) => {
              store.changeStatus(ticket.id, v, me.id);
              toast.success(`Status → ${v}`);
            }}
            width="w-full"
            options={[
              { value: "open", label: "Open" },
              { value: "pending", label: "Pending" },
              { value: "resolved", label: "Resolved" },
              { value: "closed", label: "Closed" },
            ]}
          />
        </Section>

        <Section label="Priority">
          <Dropdown<TicketPriority>
            value={ticket.priority}
            onChange={(v) => store.changePriority(ticket.id, v, me.id)}
            width="w-full"
            options={[
              { value: "low", label: "Low" },
              { value: "normal", label: "Normal" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
          />
        </Section>

        <Section label="Assignee">
          <Dropdown<string | undefined>
            value={ticket.assigneeId}
            onChange={(v) => store.assign(ticket.id, v || undefined, me.id)}
            width="w-full"
            placeholder="Unassigned"
            options={[
              { value: undefined, label: "— Unassigned" },
              ...store.users
                .filter((u) => u.role !== "customer")
                .map((u) => ({ value: u.id, label: u.name, description: u.title })),
            ]}
          />
          {assignee?.id !== me.id && (
            <Button
              variant="subtle"
              size="sm"
              onClick={() => store.assign(ticket.id, me.id, me.id)}
              className="mt-2 w-full"
            >
              Assign to me
            </Button>
          )}
        </Section>

        <Section label="Category">
          <Dropdown
            value={ticket.categoryId}
            onChange={(v) => store.changeCategory(ticket.id, v, me.id)}
            width="w-full"
            options={store.categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Section>

        <Section label="SLA policy">
          <div className="text-[13px] text-fg">{sla?.name ?? "—"}</div>
          {sla && (
            <div className="text-[11.5px] text-fg-muted mt-1 leading-relaxed">
              First response in <span className="tabnum text-fg">{durationStr(sla.firstResponseMins)}</span>; resolve in <span className="tabnum text-fg">{durationStr(sla.resolutionMins)}</span>.
            </div>
          )}
        </Section>

        <div className="border-t border-border/50 pt-4">
          <Section label="Customer">
            {customer && (
              <div className="rounded-xl border border-border bg-bg-elevated/40 p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <Avatar user={customer} size="md" />
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-fg truncate">{customer.name}</div>
                    <div className="text-[11.5px] text-fg-muted truncate">{customer.title} · {customer.company}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-[11.5px]">
                  <Stat label="Plan" value={customer.plan ?? "—"} />
                  <Stat label="Joined" value={timeAgo(customer.joinedAt).replace(" ago", "")} />
                  <Stat label="Tickets" value={String(store.tickets.filter((t) => t.customerId === customer.id).length)} />
                  <Stat label="Email" value={customer.email} className="col-span-2" />
                </div>
              </div>
            )}
          </Section>
        </div>

        {customerTickets.length > 0 && (
          <Section label="Other tickets from this customer">
            <ul className="space-y-1">
              {customerTickets.slice(0, 4).map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/app/ticket/${t.id}`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-elevated/50 group"
                  >
                    <FileText className="w-3.5 h-3.5 text-fg-subtle shrink-0" />
                    <span className="text-[12.5px] text-fg-muted group-hover:text-fg truncate">{t.subject}</span>
                    <StatusPill status={t.status} className="ml-auto !text-[10.5px] !px-1.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </aside>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-fg-subtle uppercase tracking-wider text-[10px] font-medium">{label}</div>
      <div className="text-fg text-[12.5px] tabnum truncate">{value}</div>
    </div>
  );
}

function ThreadEntry({
  author,
  content,
  attachments,
  createdAt,
  kind,
  isInternal,
}: {
  author?: import("@/lib/types").User;
  content: string;
  attachments: import("@/lib/types").Attachment[];
  createdAt: string;
  kind: "agent" | "customer";
  isInternal?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("mb-3 flex gap-3")}
    >
      <div className="shrink-0 mt-1.5">
        <Avatar user={author} size="md" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1.5 text-[12px]">
          <span className="font-medium text-fg">{author?.name ?? "—"}</span>
          {kind === "customer" && <span className="px-1.5 py-0.5 rounded bg-bg-elevated/60 text-fg-subtle text-[10.5px]">Customer</span>}
          {isInternal && (
            <span className="px-1.5 py-0.5 rounded bg-status-pending/20 text-status-pending text-[10.5px] flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Internal note
            </span>
          )}
          <span className="text-fg-subtle">·</span>
          <span className="text-fg-subtle">{formatDateTime(createdAt)}</span>
        </div>
        <GlassCard
          variant={isInternal ? "card" : "card"}
          className={cn(
            "p-4 sm:p-5",
            isInternal && "ring-1 ring-status-pending/40 bg-status-pending/[0.04]",
            kind === "customer" && !isInternal && "bg-bg-elevated/30"
          )}
        >
          <Markdown>{content}</Markdown>
          <AttachmentList attachments={attachments ?? []} />
        </GlassCard>
      </div>
    </motion.div>
  );
}
