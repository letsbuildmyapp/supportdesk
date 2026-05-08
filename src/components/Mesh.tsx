// Animated gradient mesh background. Glassy archetype's signature surface —
// large blurred organic blobs in low-saturation pastels (light) or deep saturated
// jewels (dark), drifting slowly. Sits at z-index -1 behind every page.

import { motion } from "framer-motion";

interface MeshProps {
  variant?: "default" | "soft" | "intense";
}

export function Mesh({ variant = "default" }: MeshProps) {
  const blobs =
    variant === "intense"
      ? [
          { size: 720, x: -10, y: -15, color: "var(--mesh-1)", op: 0.85, dur: 32 },
          { size: 640, x: 65, y: 5, color: "var(--mesh-2)", op: 0.75, dur: 28 },
          { size: 580, x: 20, y: 70, color: "var(--mesh-3)", op: 0.7, dur: 36 },
          { size: 520, x: 75, y: 65, color: "var(--mesh-4)", op: 0.7, dur: 30 },
        ]
      : variant === "soft"
      ? [
          { size: 540, x: -8, y: 0, color: "var(--mesh-1)", op: 0.5, dur: 38 },
          { size: 600, x: 70, y: 10, color: "var(--mesh-2)", op: 0.45, dur: 34 },
          { size: 520, x: 30, y: 75, color: "var(--mesh-3)", op: 0.45, dur: 40 },
        ]
      : [
          { size: 640, x: -5, y: -10, color: "var(--mesh-1)", op: 0.65, dur: 32 },
          { size: 580, x: 60, y: 5, color: "var(--mesh-2)", op: 0.55, dur: 28 },
          { size: 520, x: 25, y: 70, color: "var(--mesh-3)", op: 0.55, dur: 36 },
          { size: 480, x: 75, y: 60, color: "var(--mesh-4)", op: 0.5, dur: 34 },
        ];

  return (
    <div className="mesh-bg" aria-hidden>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="mesh-blob"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.x}%`,
            top: `${b.y}%`,
            background: `oklch(${b.color} / ${b.op})`,
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.08, 0.94, 1.04, 1],
          }}
          transition={{
            duration: b.dur,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* subtle grain to break up the gradients */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.05] mix-blend-overlay pointer-events-none"
        aria-hidden
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}
