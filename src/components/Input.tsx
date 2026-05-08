import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const baseField =
  "block w-full rounded-xl bg-bg-elevated/60 backdrop-blur-md border border-border-strong/60 px-3.5 py-2.5 text-[15px] text-fg placeholder:text-fg-subtle font-normal transition-shadow focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent/60 disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref
) {
  return <input ref={ref} className={cn(baseField, className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...rest },
  ref
) {
  return <textarea ref={ref} className={cn(baseField, "min-h-[120px] py-3 leading-relaxed font-mono-display", className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref
) {
  return (
    <span className="relative block">
      <select
        ref={ref}
        className={cn(baseField, "appearance-none pr-10 cursor-pointer", className)}
        {...rest}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="5 8 10 13 15 8" />
      </svg>
    </span>
  );
});

export function Field({
  label,
  hint,
  error,
  children,
  required,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[13px] font-medium text-fg">
        {label}
        {required && <span className="text-status-breach ml-0.5">*</span>}
      </span>
      {children}
      {hint && !error && <span className="text-[12px] text-fg-muted">{hint}</span>}
      {error && <span className="text-[12px] text-status-breach">{error}</span>}
    </label>
  );
}
