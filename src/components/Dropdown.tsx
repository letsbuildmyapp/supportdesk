// Lightweight dropdown — used for status / priority / assignee pickers.
// Menu is portaled to document.body so it escapes parent stacking contexts
// (glass cards have backdrop-filter which traps z-index).

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export function Dropdown<T extends string | undefined>({
  value,
  options,
  onChange,
  placeholder = "Select…",
  trigger,
  disabled,
  className,
  align = "left",
  width = "w-56",
}: {
  value: T;
  options: DropdownOption<T>[];
  onChange: (v: T) => void;
  placeholder?: string;
  trigger?: ReactNode;
  disabled?: boolean;
  className?: string;
  align?: "left" | "right";
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; minWidth: number } | null>(null);
  const cur = options.find((o) => o.value === value);

  // Position the menu relative to the trigger (in viewport coordinates, since portaled).
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    function reposition() {
      const t = triggerRef.current;
      if (!t) return;
      const r = t.getBoundingClientRect();
      const top = r.bottom + 6 + window.scrollY;
      const left = align === "right"
        ? r.right - 224 + window.scrollX // approx menu width fallback
        : r.left + window.scrollX;
      setPos({ top, left, minWidth: r.width });
    }
    reposition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, align]);

  // Click-outside / Escape
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={cn("inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-strong/60 bg-bg-elevated text-[13px] text-fg hover:bg-bg-elevated/85 transition-colors disabled:opacity-50 whitespace-nowrap",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        )}
      >
        {trigger ?? (
          <>
            {cur?.icon}
            <span className="truncate">{cur?.label ?? placeholder}</span>
          </>
        )}
        <ChevronDown className={cn("w-3.5 h-3.5 text-fg-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && pos
        ? createPortal(
            <div
              ref={menuRef}
              className={cn(
                "fixed z-[200] rounded-xl overflow-hidden bg-bg-elevated border border-border-strong/70 shadow-[0_16px_48px_-16px_oklch(0_0_0/0.4)] animate-fade-up",
                width
              )}
              style={{ top: pos.top, left: pos.left, minWidth: pos.minWidth }}
            >
              <div className="max-h-[320px] overflow-y-auto py-1">
                {options.map((o) => (
                  <button
                    key={String(o.value)}
                    type="button"
                    disabled={o.disabled}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 w-full text-left px-3 py-2 text-[13px] hover:bg-accent/10 hover:text-accent disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
                      o.value === value && "text-accent"
                    )}
                  >
                    {o.icon}
                    <div className="flex-1 min-w-0">
                      <div className="text-fg truncate">{o.label}</div>
                      {o.description && <div className="text-[11px] text-fg-muted truncate">{o.description}</div>}
                    </div>
                    {o.value === value && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                  </button>
                ))}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
