import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, CheckCircle2, MessageCircle, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Avatar } from "@/components/Avatar";
import { StatusPill, PriorityPill } from "@/components/StatusPill";
import { Markdown } from "@/components/Markdown";
import { Composer } from "@/components/Composer";
import { Button } from "@/components/Button";
import { AttachmentList } from "@/components/FileUpload";
import { formatDate, formatDateTime, timeAgo, cn } from "@/lib/utils";

export function CustomerTicketDetail() {
  const { id } = useParams();
  const store = useStore();
  const nav = useNavigate();
  const ticket = store.tickets.find((t) => t.id === id);

  useEffect(() => {
    if (ticket && ticket.unreadByCustomer) {
      const t = setTimeout(() => store.markRead(ticket.id, "customer"), 600);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line
  }, [ticket?.id]);

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12 text-center">
        <h2 className="font-display text-[34px] text-fg italic">Ticket not found.</h2>
        <Link to="/portal/my-tickets" className="inline-block mt-4 text-accent hover:underline">
          ← Back to your tickets
        </Link>
      </div>
    );
  }

  const customer = store.users.find((u) => u.id === ticket.customerId);
  const assignee = store.users.find((u) => u.id === ticket.assigneeId);
  const cat = store.categories.find((c) => c.id === ticket.categoryId);
  // For customer: only public messages
  const visibleReplies = ticket.replies.filter((r) => !r.isInternal);
  const visibleEvents = ticket.events.filter((e) => e.type !== "category_changed");

  // Merge replies + events into one timeline sorted by createdAt
  const timeline = [
    ...visibleReplies.map((r) => ({ kind: "reply" as const, at: r.createdAt, payload: r })),
    ...visibleEvents.map((e) => ({ kind: "event" as const, at: e.createdAt, payload: e })),
  ].sort((a, b) => (a.at < b.at ? -1 : 1));

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-6 sm:py-10">
      <Link to="/portal/my-tickets" className="inline-flex items-center gap-1 text-[13px] text-fg-muted hover:text-fg mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />
        All tickets
      </Link>

      <GlassCard variant="strong" className="p-5 sm:p-6 mb-5">
        <div className="flex items-start gap-3 flex-wrap">
          <span className="text-[12.5px] font-mono tabnum text-fg-subtle">{ticket.id}</span>
          <h1 className="font-display text-[28px] sm:text-[34px] leading-tight text-fg flex-1 min-w-0">{ticket.subject}</h1>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <StatusPill status={ticket.status} />
          <PriorityPill priority={ticket.priority} />
          {cat && (
            <span className="inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-full border border-border bg-bg-elevated/40 text-fg-muted">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(${cat.color})` }} />
              {cat.name}
            </span>
          )}
          <span className="text-[12px] text-fg-subtle ml-auto flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Opened {formatDate(ticket.createdAt)}
          </span>
        </div>
      </GlassCard>

      {/* Original ticket */}
      <ThreadEntry
        author={customer}
        content={ticket.description}
        attachments={ticket.attachments}
        createdAt={ticket.createdAt}
        kind="opened"
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
              kind={author?.role === "customer" ? "customer" : "agent"}
            />
          );
        }
        const e = it.payload;
        return <TimelineEvent key={e.id ?? i} event={e} />;
      })}

      {ticket.status === "resolved" && !ticket.csat && (
        <CsatPrompt
          onSubmit={(rating, comment) => {
            store.submitCsat(ticket.id, rating, comment);
            toast.success("Thanks for the feedback.");
          }}
        />
      )}

      {ticket.csat && (
        <GlassCard className="mt-4 p-5 flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-status-pending/15 text-status-pending">
            <Star className="w-5 h-5 fill-current" />
          </span>
          <div className="flex-1">
            <div className="text-[13px] text-fg">
              You rated this ticket <strong className="tabnum">{ticket.csat.rating}/5</strong>.
            </div>
            {ticket.csat.comment && <div className="text-[13px] text-fg-muted mt-0.5">"{ticket.csat.comment}"</div>}
          </div>
          <span className="text-[11px] text-fg-subtle">{timeAgo(ticket.csat.submittedAt)}</span>
        </GlassCard>
      )}

      {ticket.status !== "closed" && (
        <div className="mt-5">
          <span className="eyebrow flex items-center gap-1.5 mb-2">
            <MessageCircle className="w-3 h-3" />
            Reply
          </span>
          <Composer ticketId={ticket.id} customerOnly />
        </div>
      )}

      {ticket.status === "closed" && (
        <GlassCard className="mt-5 p-5 text-center">
          <p className="text-[14px] text-fg-muted">
            This ticket is closed. <Link to="/portal/new" className="text-accent hover:underline">Open a new one</Link> if you need anything else.
          </p>
        </GlassCard>
      )}

      {assignee && (
        <div className="mt-8 pt-6 border-t border-border/50 flex items-center gap-3 text-[12px] text-fg-muted">
          <Avatar user={assignee} size="sm" />
          <div>
            <div>Handled by <span className="text-fg">{assignee.name}</span></div>
            <div>{assignee.title}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThreadEntry({
  author,
  content,
  attachments,
  createdAt,
  kind,
}: {
  author?: import("@/lib/types").User;
  content: string;
  attachments: import("@/lib/types").Attachment[];
  createdAt: string;
  kind: "opened" | "agent" | "customer";
}) {
  const isAgent = kind === "agent";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("mb-3 flex gap-3", kind === "customer" && "flex-row-reverse")}
    >
      <div className="shrink-0 mt-1.5">
        <Avatar user={author} size="md" />
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn("flex items-center gap-2 mb-1.5 text-[12px]", kind === "customer" && "justify-end")}>
          <span className="font-medium text-fg">{author?.name ?? "—"}</span>
          {isAgent && (
            <span className="text-fg-subtle">{author?.title?.split("·")[0]?.trim() ?? "Support"}</span>
          )}
          <span className="text-fg-subtle">·</span>
          <span className="text-fg-subtle">{formatDateTime(createdAt)}</span>
        </div>
        <GlassCard
          variant={isAgent ? "strong" : "card"}
          className={cn("p-4 sm:p-5", isAgent && "ring-1 ring-accent/30")}
        >
          <Markdown>{content}</Markdown>
          <AttachmentList attachments={attachments ?? []} />
        </GlassCard>
      </div>
    </motion.div>
  );
}

function TimelineEvent({ event }: { event: import("@/lib/types").TicketEvent }) {
  const labels: Record<string, string> = {
    status_changed: `Status changed${event.meta?.from ? ` from ${event.meta.from}` : ""}${event.meta?.to ? ` to ${event.meta.to}` : ""}`,
    priority_changed: `Priority changed${event.meta?.to ? ` to ${event.meta.to}` : ""}`,
    assigned: `Assigned${event.meta?.to ? `` : ""}`,
    csat_submitted: "Customer rated this ticket",
    reopened: "Reopened by reply",
    closed: "Closed",
  };
  const text = labels[event.type] ?? event.type;
  return (
    <div className="flex items-center gap-3 my-3 ml-12 text-[12px] text-fg-subtle">
      <span className="w-1.5 h-1.5 rounded-full bg-fg-subtle/60" />
      <span>{text}</span>
      <span>·</span>
      <span>{timeAgo(event.createdAt)}</span>
    </div>
  );
}

function CsatPrompt({ onSubmit }: { onSubmit: (rating: 1 | 2 | 3 | 4 | 5, comment?: string) => void }) {
  const [hovered, setHovered] = useState(0);
  const [chosen, setChosen] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <GlassCard variant="strong" className="mt-5 p-5 text-center">
        <CheckCircle2 className="w-7 h-7 text-status-resolved mx-auto" />
        <p className="mt-2 text-[14px] text-fg">Thanks — we appreciate the feedback.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="strong" className="mt-5 p-5">
      <h3 className="font-display text-[22px] text-fg italic">How did we do?</h3>
      <p className="mt-1 text-[13px] text-fg-muted">A quick rating helps us measure how the team is doing.</p>
      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setChosen(n)}
            className="p-1"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "w-7 h-7 transition-colors",
                n <= (hovered || chosen) ? "fill-status-pending text-status-pending" : "text-fg-subtle/60"
              )}
            />
          </button>
        ))}
      </div>
      {chosen > 0 && (
        <div className="mt-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Anything to add? (optional)"
            className="w-full rounded-xl bg-bg-elevated/50 border border-border-strong/60 px-3 py-2 text-[14px] text-fg placeholder:text-fg-subtle outline-none focus:ring-2 focus:ring-accent/60"
          />
          <div className="mt-3 flex justify-end">
            <Button
              variant="primary"
              onClick={() => {
                onSubmit(chosen as 1 | 2 | 3 | 4 | 5, comment.trim() || undefined);
                setSubmitted(true);
              }}
            >
              Submit rating
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
