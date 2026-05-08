import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Modal } from "@/components/Modal";
import { Mail, Search } from "lucide-react";
import { formatDateTime, timeAgo } from "@/lib/utils";
import type { Email } from "@/lib/types";
import { Logo } from "@/components/Logo";

const TEMPLATE_LABEL: Record<Email["template"], string> = {
  new_ticket: "Ticket opened",
  agent_reply: "Agent reply",
  status_change: "Status changed",
  sla_warning: "SLA warning",
  mention: "Internal mention",
  csat_request: "CSAT survey",
  welcome: "Welcome",
};

export function NotificationsLog() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [tpl, setTpl] = useState<Email["template"] | "all">("all");
  const [open, setOpen] = useState<Email | null>(null);

  const filtered = useMemo(() => {
    let xs = store.outbox;
    if (tpl !== "all") xs = xs.filter((e) => e.template === tpl);
    if (q.trim()) {
      const ql = q.toLowerCase();
      xs = xs.filter((e) => e.subject.toLowerCase().includes(ql) || e.to.toLowerCase().includes(ql) || e.toName.toLowerCase().includes(ql));
    }
    return xs;
  }, [store.outbox, q, tpl]);

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="eyebrow">Notifications log</span>
        <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
          <span className="italic">Every</span> email we sent.
        </h1>
        <p className="mt-1.5 text-[14px] text-fg-muted">
          The system outbox. In a deployed environment these would go through Resend; here they're rendered locally with the same templates.
        </p>
      </div>

      <GlassCard variant="strong" className="px-3 py-2.5 flex items-center gap-3 mb-4 flex-wrap">
        <Search className="w-4 h-4 text-fg-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by subject or recipient…" className="flex-1 min-w-[200px] bg-transparent outline-none text-[14px] text-fg placeholder:text-fg-subtle" />
        <select
          value={tpl}
          onChange={(e) => setTpl(e.target.value as typeof tpl)}
          className="bg-bg-elevated/60 border border-border-strong/60 rounded-lg px-2 py-1 text-[13px] text-fg"
        >
          <option value="all">All templates</option>
          {(Object.keys(TEMPLATE_LABEL) as Email["template"][]).map((t) => (
            <option key={t} value={t}>{TEMPLATE_LABEL[t]}</option>
          ))}
        </select>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <ul className="divide-y divide-border/40">
          {filtered.map((e) => (
            <li key={e.id}>
              <button
                onClick={() => setOpen(e)}
                className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated/40 transition-colors"
              >
                <Mail className={`w-4 h-4 shrink-0 ${e.read ? "text-fg-subtle" : "text-accent"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10.5px] uppercase tracking-wider text-fg-subtle font-medium">{TEMPLATE_LABEL[e.template]}</span>
                    {e.ticketId && <span className="text-[11px] font-mono tabnum text-fg-subtle">{e.ticketId}</span>}
                  </div>
                  <div className="text-[14px] text-fg truncate">{e.subject}</div>
                  <div className="text-[12px] text-fg-muted truncate">to {e.toName} ({e.to})</div>
                </div>
                <div className="text-[11px] text-fg-subtle tabnum text-right">
                  {timeAgo(e.sentAt)}
                </div>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-12 text-center text-[14px] text-fg-muted">Nothing matches.</li>
          )}
        </ul>
      </GlassCard>

      {open && <EmailPreview email={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function EmailPreview({ email, onClose }: { email: Email; onClose: () => void }) {
  const store = useStore();
  const ticket = email.ticketId ? store.tickets.find((t) => t.id === email.ticketId) : null;
  return (
    <Modal open onClose={onClose} size="lg" title="Email preview">
      <div className="space-y-3">
        <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-1 text-[13px]">
          <span className="text-fg-subtle">From</span><span className="text-fg">{email.from}</span>
          <span className="text-fg-subtle">To</span><span className="text-fg">{email.toName} &lt;{email.to}&gt;</span>
          <span className="text-fg-subtle">Subject</span><span className="text-fg font-medium">{email.subject}</span>
          <span className="text-fg-subtle">Sent</span><span className="text-fg-muted">{formatDateTime(email.sentAt)}</span>
        </div>

        {/* Rendered template */}
        <div className="rounded-2xl border border-border bg-white text-[#222] overflow-hidden mt-4">
          <div className="px-6 py-5 border-b border-zinc-200 flex items-center gap-2">
            <Logo size={32} />
            <span className="font-medium text-zinc-900">{store.orgSettings.name}</span>
          </div>
          <div className="px-6 py-7" style={{ fontFamily: "Geist, sans-serif" }}>
            <h2 style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 26, lineHeight: 1.18, margin: 0, fontWeight: 500, letterSpacing: "-0.01em" }}>
              {email.template === "new_ticket" && "We've got it."}
              {email.template === "agent_reply" && "A reply from the team."}
              {email.template === "status_change" && "Quick update."}
              {email.template === "sla_warning" && "Heads up — running close to SLA."}
              {email.template === "csat_request" && "How did we do?"}
              {email.template === "welcome" && "Welcome."}
              {email.template === "mention" && "You were mentioned."}
            </h2>
            <p className="mt-3 text-[14px] text-zinc-600">Hi {email.toName.split(" ")[0]},</p>
            <p className="mt-2 text-[14px] text-zinc-600 leading-relaxed">
              {email.template === "new_ticket" && `Your ticket ${ticket?.id} has been received. We'll respond within the SLA window for your plan and you'll get an email when there's an update.`}
              {email.template === "agent_reply" && `There's a new reply from our team on ticket ${ticket?.id}. Open it to see the full thread.`}
              {email.template === "status_change" && `The status of ticket ${ticket?.id} changed.`}
              {email.template === "sla_warning" && `Ticket ${ticket?.id} is approaching its SLA target — internally flagged so the right person can pick it up.`}
              {email.template === "csat_request" && `Ticket ${ticket?.id} has been resolved. We'd love a quick rating to help the team.`}
              {email.template === "welcome" && `You're all set up. The help center is at the URL we shared with your invite.`}
              {email.template === "mention" && `A teammate @-mentioned you on ticket ${ticket?.id}.`}
            </p>
            {ticket && (
              <div className="mt-5 border border-zinc-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 text-[12px] text-zinc-500">
                  Ticket
                </div>
                <div className="px-4 py-3">
                  <div className="text-[14px] text-zinc-900 font-medium">{ticket.subject}</div>
                  <div className="text-[12px] text-zinc-500 mt-0.5">{ticket.id} · {ticket.status} · {ticket.priority}</div>
                </div>
              </div>
            )}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="mt-5 inline-block px-5 py-2.5 rounded-lg text-white text-[14px] font-medium"
              style={{ background: "oklch(0.52 0.250 305)" }}
            >
              {email.template === "csat_request" ? "Rate this ticket" : "Open ticket"}
            </a>
            <p className="mt-7 text-[12px] text-zinc-500">— The {store.orgSettings.name} support team</p>
          </div>
          <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 text-[11px] text-zinc-500">
            You're getting this because you have a ticket with {store.orgSettings.name}. <a href="#" onClick={(e) => e.preventDefault()} className="underline">Manage notification preferences</a>.
          </div>
        </div>
      </div>
    </Modal>
  );
}
