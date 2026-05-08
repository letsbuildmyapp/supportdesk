import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "subtle";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "secondary", size = "md", loading, children, disabled, ...rest },
  ref
) {
  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-[13px] gap-1.5 rounded-xl",
    md: "h-10 px-4 text-[14px] gap-2 rounded-xl",
    lg: "h-12 px-5 text-[15px] gap-2 rounded-2xl",
    icon: "h-10 w-10 rounded-xl",
  };
  const variants: Record<Variant, string> = {
    primary:
      "bg-accent text-accent-fg hover:brightness-110 active:brightness-95 shadow-[0_4px_18px_-6px_oklch(var(--accent)/0.55)] border border-accent/40 font-medium",
    secondary:
      "glass border-border-strong/50 text-fg hover:bg-bg-elevated/40 active:scale-[0.98] font-medium",
    ghost:
      "text-fg hover:bg-bg-elevated/40 active:bg-bg-elevated/60 border border-transparent font-medium",
    outline:
      "bg-transparent border border-border-strong text-fg hover:bg-bg-elevated/40 font-medium",
    subtle:
      "bg-bg-elevated/50 text-fg-muted hover:text-fg hover:bg-bg-elevated/80 border border-transparent font-medium",
    danger:
      "bg-status-breach text-white hover:brightness-105 active:brightness-95 border border-status-breach/40 font-medium",
  };
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center transition-all whitespace-nowrap",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:opacity-50 disabled:pointer-events-none",
        sizes[size],
        variants[variant],
        className
      )}
      {...rest}
    >
      {loading && (
        <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
});
