import { cn } from "@/lib/utils";
import type { TicketPriority, TicketStatus } from "@/lib/types";

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

export function StatusPill({ status, className, dot = false }: { status: TicketStatus; className?: string; dot?: boolean }) {
  const colors: Record<TicketStatus, string> = {
    open: "bg-status-open/15 text-status-open border-status-open/35",
    pending: "bg-status-pending/15 text-status-pending border-status-pending/40",
    resolved: "bg-status-resolved/15 text-status-resolved border-status-resolved/35",
    closed: "bg-status-closed/15 text-fg-muted border-border-strong",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[12px] font-medium tracking-wide",
        colors[status],
        className
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", `bg-status-${status}`)} />}
      {STATUS_LABEL[status]}
    </span>
  );
}

const PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export function PriorityPill({ priority, className }: { priority: TicketPriority; className?: string }) {
  const colors: Record<TicketPriority, string> = {
    low: "text-fg-muted border-border-strong",
    normal: "text-fg border-border-strong",
    high: "text-status-pending border-status-pending/50 bg-status-pending/10",
    urgent: "text-status-breach border-status-breach/55 bg-status-breach/12",
  };
  const dotClass: Record<TicketPriority, string> = {
    low: "bg-fg-subtle",
    normal: "bg-fg-muted",
    high: "bg-status-pending",
    urgent: "bg-status-breach animate-pulse",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[12px] font-medium tracking-wide",
        colors[priority],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotClass[priority])} />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function SlaPill({ status, className }: { status: "ok" | "approaching" | "breached" | "n/a"; className?: string }) {
  if (status === "n/a") return null;
  const map = {
    ok: "text-status-resolved border-status-resolved/40 bg-status-resolved/10",
    approaching: "text-status-pending border-status-pending/50 bg-status-pending/12",
    breached: "text-status-breach border-status-breach/55 bg-status-breach/12 animate-pulse",
  } as const;
  const labels = {
    ok: "On track",
    approaching: "SLA close",
    breached: "SLA breach",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        map[status],
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "ok" && "bg-status-resolved",
          status === "approaching" && "bg-status-pending",
          status === "breached" && "bg-status-breach"
        )}
      />
      {labels[status]}
    </span>
  );
}
