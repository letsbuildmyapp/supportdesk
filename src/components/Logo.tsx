import { useStore } from "@/lib/store";

export function Logo({ size = 32 }: { size?: number }) {
  const orgChar = useStore((s) => s.orgSettings.logoChar);
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl font-display"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, oklch(var(--accent)) 0%, oklch(var(--mesh-2)) 100%)",
        color: "white",
        fontSize: size * 0.55,
        boxShadow: "0 4px 14px -4px oklch(var(--accent) / 0.55), 0 1px 0 0 oklch(1 0 0 / 0.20) inset",
      }}
    >
      {orgChar}
    </span>
  );
}
