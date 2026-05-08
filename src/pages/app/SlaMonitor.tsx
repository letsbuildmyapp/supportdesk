import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Avatar } from "@/components/Avatar";
import { StatusPill, PriorityPill, SlaPill } from "@/components/StatusPill";
import { evaluateSla } from "@/lib/sla";
import { durationStr, timeAgo } from "@/lib/utils";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function SlaMonitor() {
  const store = useStore();
  const open = store.tickets.filter((t) => t.status !== "resolved" && t.status !== "closed");
  const enriched = open
    .map((t) => ({
      t,
      sla: store.slaPolicies.find((s) => s.id === t.slaId),
      info: evaluateSla(t, store.slaPolicies.find((s) => s.id === t.slaId)),
    }))
    .filter((x) => x.info.status !== "ok" && x.info.status !== "n/a")
    .sort((a, b) => {
      if (a.info.status !== b.info.status) return a.info.status === "breached" ? -1 : 1;
      return Math.min(a.info.responseRemainingMins || 1e6, a.info.resolutionRemainingMins || 1e6) -
        Math.min(b.info.responseRemainingMins || 1e6, b.info.resolutionRemainingMins || 1e6);
    });

  const breached = enriched.filter((e) => e.info.status === "breached");
  const approaching = enriched.filter((e) => e.info.status === "approaching");

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="eyebrow">SLA monitor</span>
        <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
          <span className="italic">What</span> needs eyes.
        </h1>
        <p className="mt-1.5 text-[14px] text-fg-muted">Tickets approaching or breaching SLA, sorted by urgency. Click any row to dive in.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Tally label="Breached" value={breached.length} tone="breach" />
        <Tally label="Approaching" value={approaching.length} tone="warn" />
        <Tally label="On track" value={open.length - enriched.length} tone="ok" />
      </div>

      {enriched.length === 0 ? (
        <GlassCard className="px-6 py-12 text-center">
          <ShieldCheck className="w-8 h-8 text-status-resolved mx-auto" />
          <p className="mt-3 text-[16px] text-fg">All open tickets are within SLA.</p>
          <p className="text-[13px] text-fg-muted mt-1">Nice and quiet.</p>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <ul className="divide-y divide-border/40">
            {enriched.map(({ t, sla, info }) => {
              const customer = store.users.find((u) => u.id === t.customerId);
              const assignee = store.users.find((u) => u.id === t.assigneeId);
              const cat = store.categories.find((c) => c.id === t.categoryId);
              const remaining = info.responseStatus !== "ok" ? info.responseRemainingMins : info.resolutionRemainingMins;
              return (
                <li key={t.id} className="hover:bg-bg-elevated/40 transition-colors">
                  <Link to={`/app/ticket/${t.id}`} className="flex items-center gap-3 px-4 py-3.5">
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${info.status === "breached" ? "text-status-breach" : "text-status-pending"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-mono tabnum text-fg-subtle">{t.id}</span>
                        <span className="text-[14.5px] text-fg truncate font-medium">{t.subject}</span>
                      </div>
                      <div className="text-[12px] text-fg-muted mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Avatar user={customer} size="xs" />
                          {customer?.name}
                        </span>
                        <span>·</span>
                        <span>{cat?.name}</span>
                        <span>·</span>
                        <span>SLA: {sla?.name}</span>
                        <span>·</span>
                        <span>{info.responseStatus !== "ok" ? "First response" : "Resolution"} {info.status === "breached" ? "over by" : "in"} <span className="tabnum text-fg">{durationStr(Math.abs(remaining))}</span></span>
                      </div>
                    </div>
                    <PriorityPill priority={t.priority} />
                    <StatusPill status={t.status} />
                    <SlaPill status={info.status} />
                    {assignee ? (
                      <Avatar user={assignee} size="sm" />
                    ) : (
                      <span className="text-[11px] text-fg-subtle italic">Unassigned</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}

function Tally({ label, value, tone }: { label: string; value: number; tone: "breach" | "warn" | "ok" }) {
  const colour = tone === "breach" ? "text-status-breach" : tone === "warn" ? "text-status-pending" : "text-status-resolved";
  return (
    <GlassCard className="p-4">
      <div className="text-[11px] uppercase tracking-wider font-medium text-fg-muted">{label}</div>
      <div className={`mt-1.5 font-display text-[44px] leading-none tabnum ${colour}`}>{value}</div>
    </GlassCard>
  );
}
