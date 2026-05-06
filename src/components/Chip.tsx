import { cn, priorityClasses, priorityLabel, statusClasses, statusLabel } from '@/lib/utils';
import type { Priority, Status } from '@/lib/types';

export function PriorityChip({ p, className }: { p: Priority; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[11px] font-semibold uppercase tracking-wider border', priorityClasses(p), className)}>
      {priorityLabel(p)}
    </span>
  );
}

export function StatusChip({ s, className }: { s: Status; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[11px] font-semibold uppercase tracking-wider border', statusClasses(s), className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(s)}
    </span>
  );
}
