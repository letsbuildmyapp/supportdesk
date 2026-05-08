// SupportDesk onboarding tour — built to STACK.md spec.
// Per-role storage keys, spotlight on ≥768px, centered modal fallback otherwise,
// keyboard nav (Esc/arrows/enter), click-outside, body scroll lock, clickable step dots.
// Visual: glassy / Apple-esque. Newsreader display title, Geist body,
// rounded-2xl frosted card, accent ring around spotlight cutout.

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { TUTORIAL_KEY, clamp, cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

interface TourStep {
  icon?: ReactNode;
  title: string;
  body: ReactNode;
  target?: string; // data-tour value
  placement?: "top" | "bottom" | "left" | "right";
  // Optional route to navigate to before showing
  route?: string;
}

const CUSTOMER_STEPS: TourStep[] = [
  {
    title: "Welcome to the help center",
    body: (
      <>
        This is the customer portal — where you submit tickets, track their status, and find answers in the knowledge base. We'll take you through the four main surfaces.
      </>
    ),
  },
  {
    title: "Search the knowledge base",
    body: <>Most questions have an answer here. Type anything — billing, integrations, deployment errors — and we'll surface the most relevant articles first.</>,
    target: "portal-search",
    placement: "bottom",
    route: "/portal",
  },
  {
    title: "Submit a ticket",
    body: <>Couldn't find what you needed? <em>Submit a ticket</em> opens a form with category, priority, description, and file attachments. The agent picks it up from there.</>,
    target: "portal-submit",
    placement: "bottom",
  },
  {
    title: "My tickets",
    body: <>Every ticket you've ever submitted, with status, last activity, and an unread badge when an agent has replied since you last opened it.</>,
    target: "portal-nav-mine",
    placement: "bottom",
    route: "/portal",
  },
  {
    title: "That's it",
    body: <>Open a ticket detail to see the full thread, reply with markdown and attachments, or rate the resolution. You can re-take this tour from the help menu any time.</>,
  },
];

const AGENT_STEPS: TourStep[] = [
  {
    title: "Welcome to the inbox",
    body: <>This is your agent workspace. Triage incoming tickets, reply to customers, add internal notes, and track everything you own.</>,
  },
  {
    title: "Your queue",
    body: <>Filters live in the sidebar. Switch between <em>My tickets</em>, <em>Unassigned</em>, the team-wide <em>All open</em>, and <em>Mentions</em> where teammates have @-mentioned you.</>,
    target: "nav-my",
    placement: "right",
    route: "/app",
  },
  {
    title: "Open a ticket",
    body: <>Click any row to open the full thread. The composer below supports markdown, file attachments, canned responses, and @mentions.</>,
    target: "inbox-list",
    placement: "right",
  },
  {
    title: "Public reply vs internal note",
    body: <>The composer has two modes. <em>Public reply</em> is sent to the customer (and emailed). <em>Internal note</em> is visible only to your team — perfect for handoffs.</>,
  },
  {
    title: "Search across everything",
    body: <>Press <kbd className="px-1.5 py-0.5 rounded border border-border bg-bg-elevated/60 font-mono text-[11px]">⌘K</kbd> anywhere to open the command palette. Search tickets, articles, customers; jump straight to admin pages.</>,
    target: "search",
    placement: "bottom",
  },
  {
    title: "You're set",
    body: <>Your role icon top-right has a switcher — handy for stepping into a manager or admin view during the demo without resetting.</>,
  },
];

const MANAGER_STEPS: TourStep[] = [
  {
    title: "Manager view",
    body: <>You can do everything an agent can, plus the team-level surfaces in the sidebar.</>,
  },
  {
    title: "Team queue",
    body: <>Every ticket assigned across your agents, in one view. Drag a ticket between agents to reassign — or use the menu on the row.</>,
    target: "nav-team-queue",
    placement: "right",
    route: "/app/team-queue",
  },
  {
    title: "Workload",
    body: <>Who's online, who has too many open tickets, who's responding fast. Useful before you escalate or rebalance the queue.</>,
    target: "nav-workload",
    placement: "right",
  },
  {
    title: "Metrics",
    body: <>First-response time, resolution time, CSAT, breach count. The dashboard everyone asks for in their MBR.</>,
    target: "nav-metrics",
    placement: "right",
  },
  {
    title: "SLA monitor",
    body: <>Tickets approaching or breaching SLA, sorted by urgency. The page to keep open during a busy morning.</>,
    target: "nav-sla",
    placement: "right",
  },
  {
    title: "All set",
    body: <>Switch into an admin view from the user menu when you need to change categories, SLA policies, or canned responses.</>,
  },
];

const ADMIN_STEPS: TourStep[] = [
  {
    title: "Admin view",
    body: <>You manage the configuration: categories, SLA, canned responses, team, customers, and the knowledge base.</>,
  },
  {
    title: "Categories",
    body: <>Each category has a description, default priority, default SLA, and a colour that flows through the UI.</>,
    target: "nav-categories",
    placement: "right",
    route: "/app/categories",
  },
  {
    title: "SLA policies",
    body: <>Define first-response and resolution targets. Tickets pick up the policy from their category — escalate by tightening the policy, not chasing each ticket.</>,
    target: "nav-sla-policies",
    placement: "right",
  },
  {
    title: "Canned responses",
    body: <>Templates with variables (<code>{`{{customer.name}}`}</code>, <code>{`{{ticket.id}}`}</code>) that agents pick from the composer. The fastest lever for response-time consistency.</>,
    target: "nav-canned",
    placement: "right",
  },
  {
    title: "Knowledge base",
    body: <>Markdown editor with publish toggle. KB articles are searchable from the customer portal — every published article is one fewer ticket.</>,
    target: "nav-kb",
    placement: "right",
  },
  {
    title: "Notifications log",
    body: <>Every email the system has sent, with full template preview. The "did the customer get my reply?" answer.</>,
    target: "nav-notifications-log",
    placement: "right",
  },
  {
    title: "You've seen the whole thing",
    body: <>Reset demo data from your user menu (or via <kbd className="px-1.5 py-0.5 rounded border border-border bg-bg-elevated/60 font-mono text-[11px]">⌘K</kbd>) any time you want a fresh slate for a sales call.</>,
  },
];

const STEPS_BY_ROLE: Record<Role, TourStep[]> = {
  customer: CUSTOMER_STEPS,
  agent: AGENT_STEPS,
  manager: MANAGER_STEPS,
  admin: ADMIN_STEPS,
};

export function Tour({ role }: { role: Role }) {
  const key = TUTORIAL_KEY(role);
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const nav = useNavigate();
  const loc = useLocation();

  const steps = STEPS_BY_ROLE[role];
  const step = steps[stepIdx];

  // Open on mount only if not seen
  useEffect(() => {
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [key]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Resize listener
  useEffect(() => {
    function onResize() {
      setVw(window.innerWidth);
      // recompute rect on next frame
      requestAnimationFrame(updateRect);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  // Route-jump per step
  useEffect(() => {
    if (!open || !step?.route) return;
    if (loc.pathname !== step.route) nav(step.route);
  }, [open, step?.route, loc.pathname, nav]);

  function updateRect() {
    if (!step?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) setRect((el as HTMLElement).getBoundingClientRect());
    else setRect(null);
  }

  useLayoutEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(updateRect);
    return () => cancelAnimationFrame(id);
  }, [open, stepIdx, loc.pathname]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  function next() {
    if (stepIdx >= steps.length - 1) finish();
    else setStepIdx((i) => i + 1);
  }
  function prev() {
    setStepIdx((i) => Math.max(0, i - 1));
  }
  function finish() {
    localStorage.setItem(key, "1");
    setOpen(false);
  }

  if (!open || !step) return null;
  const useSpotlight = vw >= 768 && rect && rect.width > 4 && rect.height > 4;

  // Tooltip placement clamping for spotlight
  let tipStyle: React.CSSProperties = {};
  if (useSpotlight && rect) {
    const placement = step.placement ?? (rect.left + rect.width / 2 < vw / 2 ? "right" : "left");
    const TIP_W = 380;
    const TIP_H = 240;
    const GAP = 16;
    let top = rect.top + rect.height / 2 - TIP_H / 2;
    let left = rect.right + GAP;
    if (placement === "right") {
      left = rect.right + GAP;
      top = rect.top + rect.height / 2 - TIP_H / 2;
      if (left + TIP_W > vw - 16) left = rect.left - TIP_W - GAP;
    } else if (placement === "left") {
      left = rect.left - TIP_W - GAP;
      top = rect.top + rect.height / 2 - TIP_H / 2;
      if (left < 16) left = rect.right + GAP;
    } else if (placement === "bottom") {
      top = rect.bottom + GAP;
      left = rect.left + rect.width / 2 - TIP_W / 2;
      if (top + TIP_H > window.innerHeight - 16) top = rect.top - TIP_H - GAP;
    } else if (placement === "top") {
      top = rect.top - TIP_H - GAP;
      left = rect.left + rect.width / 2 - TIP_W / 2;
      if (top < 16) top = rect.bottom + GAP;
    }
    top = clamp(top, 16, window.innerHeight - TIP_H - 16);
    left = clamp(left, 16, vw - TIP_W - 16);
    tipStyle = { top, left, width: TIP_W };
  }

  return (
    <AnimatePresence>
      <motion.div
        key="tour"
        className="fixed inset-0 z-[150]"
        onClick={finish}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Spotlight cutout: a transparent rect with a giant box-shadow that dims everything else */}
        {useSpotlight && rect ? (
          <motion.div
            initial={false}
            animate={{
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
              borderRadius: 14,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="absolute pointer-events-none"
            style={{
              boxShadow: "0 0 0 9999px oklch(0 0 0 / 0.62), 0 0 0 2px oklch(var(--accent)), 0 0 24px 6px oklch(var(--accent) / 0.45)",
            }}
            aria-hidden
          />
        ) : (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-md" aria-hidden />
        )}

        {/* Tooltip card — spotlight uses absolute positioning, fallback centers in viewport */}
        {useSpotlight ? (
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bg-bg-elevated border border-border-strong/70 rounded-2xl shadow-[0_24px_64px_-16px_oklch(0_0_0/0.45)] p-5"
            style={tipStyle}
          >
            <TourCardBody
              stepIdx={stepIdx}
              total={steps.length}
              title={step.title}
              body={step.body}
              onSkip={finish}
              onPrev={prev}
              onNext={next}
              onJump={(i) => setStepIdx(i)}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-5 pointer-events-none">
            <motion.div
              key={stepIdx}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto bg-bg-elevated border border-border-strong/70 rounded-2xl shadow-[0_24px_64px_-16px_oklch(0_0_0/0.45)] p-6 w-full max-w-md"
            >
              <TourCardBody
                stepIdx={stepIdx}
                total={steps.length}
                title={step.title}
                body={step.body}
                onSkip={finish}
                onPrev={prev}
                onNext={next}
                onJump={(i) => setStepIdx(i)}
              />
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function TourCardBody({
  stepIdx,
  total,
  title,
  body,
  onSkip,
  onPrev,
  onNext,
  onJump,
}: {
  stepIdx: number;
  total: number;
  title: string;
  body: ReactNode;
  onSkip: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-3.5">
        <span className="eyebrow flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-accent" />
          Tour · {stepIdx + 1} of {total}
        </span>
        <button
          type="button"
          onClick={onSkip}
          className="p-1 rounded-md text-fg-muted hover:text-fg hover:bg-bg-elevated/50"
          aria-label="Skip tour"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <h3 className="font-display text-[26px] leading-tight text-fg">{title}</h3>
      <div className="mt-2.5 text-[14.5px] text-fg-muted leading-relaxed">{body}</div>

      <div className="mt-5 flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onJump(i)}
              className={cn(
                "rounded-full transition-all",
                i === stepIdx ? "w-5 h-1.5 bg-accent" : "w-1.5 h-1.5 bg-fg-subtle/40 hover:bg-fg-subtle/80"
              )}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>
        <span className="ml-auto" />
        <button
          type="button"
          onClick={onPrev}
          disabled={stepIdx === 0}
          className="p-1.5 rounded-lg text-fg-muted hover:text-fg disabled:opacity-30"
          aria-label="Previous"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent text-accent-fg text-[13px] font-medium hover:brightness-110"
        >
          {stepIdx >= total - 1 ? "Done" : "Next"}
          {stepIdx < total - 1 && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </>
  );
}
