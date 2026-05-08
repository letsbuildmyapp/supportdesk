import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Avatar } from "@/components/Avatar";
import { Activity, MessageCircle, CheckCircle2, Star } from "lucide-react";
import { minutesBetween, durationStr } from "@/lib/utils";

export function Workload() {
  const store = useStore();
  const agents = store.users.filter((u) => u.role === "agent" || u.role === "manager");

  const rows = agents.map((a) => {
    const my = store.tickets.filter((t) => t.assigneeId === a.id);
    const open = my.filter((t) => t.status === "open" || t.status === "pending");
    const resolvedRecent = my.filter((t) => t.status === "resolved" && t.resolvedAt && minutesBetween(t.resolvedAt, new Date().toISOString()) < 60 * 24 * 7);
    const csat = my.filter((t) => t.csat).map((t) => t.csat!.rating);
    const avgCsat = csat.length ? csat.reduce((s, x) => s + x, 0) / csat.length : 0;
    const responses = my.filter((t) => t.firstAgentResponseAt);
    const avgRespMins = responses.length
      ? responses.reduce((s, t) => s + minutesBetween(t.createdAt, t.firstAgentResponseAt!), 0) / responses.length
      : 0;
    return { user: a, open, resolvedRecent: resolvedRecent.length, avgCsat, avgRespMins };
  });

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="eyebrow">Workload</span>
        <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
          <span className="italic">Who's</span> carrying what.
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((r) => (
          <GlassCard key={r.user.id} className="p-5">
            <div className="flex items-center gap-3">
              <Avatar user={r.user} size="lg" showStatus />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium text-fg truncate">{r.user.name}</div>
                <div className="text-[12px] text-fg-muted truncate">{r.user.title}</div>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${r.user.online ? "bg-status-resolved/15 text-status-resolved" : "bg-bg-elevated/50 text-fg-muted"}`}>
                {r.user.online ? "Online" : "Away"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-border/60">
              <Stat icon={<MessageCircle className="w-3.5 h-3.5" />} label="Open" value={String(r.open.length)} />
              <Stat icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Resolved (7d)" value={String(r.resolvedRecent)} />
              <Stat icon={<Activity className="w-3.5 h-3.5" />} label="Avg first resp" value={r.avgRespMins ? durationStr(r.avgRespMins) : "—"} />
              <Stat icon={<Star className="w-3.5 h-3.5" />} label="CSAT" value={r.avgCsat ? `${r.avgCsat.toFixed(1)}/5` : "—"} />
            </div>

            {r.open.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {r.open.slice(0, 5).map((t) => (
                  <Link
                    key={t.id}
                    to={`/app/ticket/${t.id}`}
                    title={t.subject}
                    className="text-[10.5px] px-1.5 py-0.5 rounded font-mono tabnum bg-bg-elevated/50 text-fg-muted border border-border/60 hover:bg-accent/15 hover:text-accent hover:border-accent/40 transition-colors whitespace-nowrap"
                  >
                    {t.id}
                  </Link>
                ))}
                {r.open.length > 5 && (
                  <span className="text-[10.5px] px-1.5 py-0.5 rounded text-fg-subtle">+{r.open.length - 5} more</span>
                )}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-fg-subtle text-[10.5px] uppercase tracking-wider font-medium mb-1">
        {icon}
        {label}
      </div>
      <div className="text-[15px] font-medium text-fg tabnum">{value}</div>
    </div>
  );
}
