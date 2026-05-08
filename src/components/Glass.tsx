import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "panel" | "strong";
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "card", interactive = false, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl",
          variant === "card" && "glass-card",
          variant === "panel" && "glass",
          variant === "strong" && "glass-strong",
          interactive && "transition-shadow hover:shadow-glass-lg",
          className
        )}
        {...rest}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";
