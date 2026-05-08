import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center px-6 py-14", className)}>
      {icon && (
        <div className="mb-4 w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-fg-muted">
          {icon}
        </div>
      )}
      <h3 className="font-display text-[28px] leading-tight text-fg">{title}</h3>
      {description && <p className="mt-2 text-[15px] text-fg-muted max-w-md leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-pulse" />
      <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-pulse [animation-delay:120ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-fg-muted animate-pulse [animation-delay:240ms]" />
    </span>
  );
}
