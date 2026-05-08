import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  // Render via portal so the modal escapes any ancestor stacking context.
  // (backdrop-filter on the AppHeader/sidebar creates a containing block for
  // position: fixed descendants, which would otherwise clip the modal.)
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, filter: "blur(8px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.96, opacity: 0, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full bg-bg-elevated border border-border-strong/60 rounded-2xl shadow-[0_24px_64px_-16px_oklch(0_0_0/0.4)] max-h-[88vh] overflow-hidden flex flex-col",
              sizes[size]
            )}
          >
            {(title || description) && (
              <div className="flex items-start gap-3 px-5 pt-5">
                <div className="flex-1 min-w-0">
                  {title && <h2 className="font-display text-[26px] leading-tight text-fg">{title}</h2>}
                  {description && <p className="mt-1 text-[14px] text-fg-muted">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-bg-elevated/50"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
            {footer && <div className="px-5 py-3.5 border-t border-border/60 flex items-center justify-end gap-2 bg-bg-elevated/20">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
