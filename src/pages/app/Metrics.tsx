import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { minutesBetween, durationStr, formatDate } from "@/lib/utils";
import { Activity, CheckCircle2, AlertTriangle, Star, TrendingUp } from "lucide-react";

const ACCENT = "oklch(0.55 0.215 254)";
const RESOLVED = "oklch(0.62 0.155 158)";
const PENDING = "oklch(0.72 0.165 65)";
const BREACH = "oklch(0.58 0.220 22)";
const VIOLET = "oklch(0.52 0.250 305)";
const SLATE = "oklch(0.55 0.020 285)";

export function Metrics() {
  const store = useStore();
  const tickets = store.tickets;

  const metrics = useMemo(() => {
    const open = tickets.filter((t) => t.status === "open" || t.status === "pending");
    const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed");

    const responses = tickets.filter((t) => t.firstAgentResponseAt);
    const avgFirstResp = responses.length
      ? responses.reduce((s, t) => s + minutesBetween(t.createdAt, t.firstAgentResponseAt!), 0) / responses.length
      : 0;

    const resolvedAge = tickets
      .filter((t) => t.resolvedAt)
      .map((t) => minutesBetween(t.createdAt, t.resolvedAt!));
    const avgResolution = resolvedAge.length ? resolvedAge.reduce((s, x) => s + x, 0) / resolvedAge.length : 0;

    const csat = tickets.filter((t) => t.csat).map((t) => t.csat!.rating);
    const avgCsat = csat.length ? csat.reduce((s, x) => s + x, 0) / csat.length : 0;

    // 7-day window
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const start = d.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      const created = tickets.filter((t) => {
        const ts = new Date(t.createdAt).getTime();
        return ts >= start && ts < end;
      }).length;
      const res = tickets.filter((t) => {
        if (!t.resolvedAt) return false;
        const ts = new Date(t.resolvedAt).getTime();
        return ts >= start && ts < end;
      }).length;
      return { day: d.toISOString(), label: formatDate(d.toISOString(), "EEE"), created, resolved: res };
    });

    const byCat = store.categories.map((c) => ({
      name: c.name,
      value: tickets.filter((t) => t.categoryId === c.id).length,
      color: `oklch(${c.color})`,
    }));

    const byStatus = [
      { name: "Open", value: tickets.filter((t) => t.status === "open").length, color: ACCENT },
      { name: "Pending", value: tickets.filter((t) => t.status === "pending").length, color: PENDING },
      { name: "Resolved", value: tickets.filter((t) => t.status === "resolved").length, color: RESOLVED },
      { name: "Closed", value: tickets.filter((t) => t.status === "closed").length, color: SLATE },
    ];

    const csatBuckets = [1, 2, 3, 4, 5].map((n) => ({
      rating: `${n}★`,
      count: csat.filter((c) => c === n).length,
      color: n >= 4 ? RESOLVED : n === 3 ? PENDING : BREACH,
    }));

    return {
      open: open.length,
      resolved: resolved.length,
      avgFirstResp,
      avgResolution,
      avgCsat,
      csatCount: csat.length,
      breachCount: tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").filter((t) => {
        const sla = store.slaPolicies.find((s) => s.id === t.slaId);
        if (!sla) return false;
        return minutesBetween(t.createdAt, new Date().toISOString()) > sla.resolutionMins;
      }).length,
      days,
      byCat,
      byStatus,
      csatBuckets,
    };
  }, [tickets, store.categories, store.slaPolicies]);

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <span className="eyebrow">Metrics</span>
        <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
          <span className="italic">How</span> the team's doing.
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        <KpiCard label="Open tickets" value={metrics.open.toString()} icon={<Activity className="w-4 h-4" />} />
        <KpiCard label="Resolved" value={metrics.resolved.toString()} icon={<CheckCircle2 className="w-4 h-4" />} accent="text-status-resolved" />
        <KpiCard label="Avg first response" value={metrics.avgFirstResp ? durationStr(metrics.avgFirstResp) : "—"} icon={<TrendingUp className="w-4 h-4" />} />
        <KpiCard label="Avg resolution" value={metrics.avgResolution ? durationStr(metrics.avgResolution) : "—"} icon={<TrendingUp className="w-4 h-4" />} />
        <KpiCard
          label={`CSAT · ${metrics.csatCount} ratings`}
          value={metrics.avgCsat ? `${metrics.avgCsat.toFixed(2)}/5` : "—"}
          icon={<Star className="w-4 h-4" />}
          accent="text-status-pending"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-[15px] text-fg">Tickets · last 7 days</h3>
            <div className="flex items-center gap-3 text-[11px] text-fg-muted">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: ACCENT }} />
                Created
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: RESOLVED }} />
                Resolved
              </span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.days}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={RESOLVED} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={RESOLVED} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(var(--border))" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="label" stroke="oklch(var(--fg-muted))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="oklch(var(--fg-muted))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ background: "oklch(var(--bg-elevated))", border: "1px solid oklch(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="created" stroke={ACCENT} fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" stroke={RESOLVED} fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-medium text-[15px] text-fg mb-3">By status</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metrics.byStatus} dataKey="value" innerRadius={56} outerRadius={88} paddingAngle={3}>
                  {metrics.byStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="oklch(var(--bg))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(var(--bg-elevated))", border: "1px solid oklch(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-medium text-[15px] text-fg mb-3">By category</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.byCat} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke="oklch(var(--border))" strokeDasharray="3 4" horizontal={false} />
                <XAxis type="number" stroke="oklch(var(--fg-muted))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="oklch(var(--fg-muted))" tick={{ fontSize: 11 }} width={130} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "oklch(var(--bg-elevated))", border: "1px solid oklch(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {metrics.byCat.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-medium text-[15px] text-fg mb-3">CSAT distribution</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.csatBuckets}>
                <CartesianGrid stroke="oklch(var(--border))" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="rating" stroke="oklch(var(--fg-muted))" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="oklch(var(--fg-muted))" tick={{ fontSize: 11 }} width={28} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "oklch(var(--bg-elevated))", border: "1px solid oklch(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {metrics.csatBuckets.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: string }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 text-fg-muted text-[11px] uppercase tracking-wider font-medium">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className={`mt-2 font-display text-[34px] tabnum leading-tight ${accent ?? "text-fg"}`}>{value}</div>
    </GlassCard>
  );
}
