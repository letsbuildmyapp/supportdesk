import { useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Search, ArrowRight, ArrowLeft, X, Inbox, Plus, LayoutGrid, BarChart3, Tag, MessageSquare, Lock, UserPlus, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const KEY_PREFIX = 'supportdesk:tutorial_seen:';
const MOBILE = 768;

type Step = {
  icon: LucideIcon;
  title: string;
  body: React.ReactNode;
  target?: string;
  placement?: 'right' | 'left' | 'top' | 'bottom';
};

const CUSTOMER_STEPS: Step[] = [
  { icon: Sparkles, title: 'Welcome to SupportDesk', body: 'Submit and track support tickets with your team. 30-second tour.' },
  { icon: Inbox, title: 'Your tickets, all here', body: (<>Every ticket you've opened lives in <span className="font-medium text-fg">My tickets</span> — sorted by latest activity, with status and priority at a glance.</>), target: 'nav', placement: 'bottom' },
  { icon: Plus, title: 'New ticket in seconds', body: 'Click "New ticket" to open one — describe the issue, set priority, attach files. We email you the moment an agent replies.', target: 'nav', placement: 'bottom' },
  { icon: Search, title: 'Press ⌘K to jump anywhere', body: 'Search tickets, navigate, toggle theme — keyboard-first by default.', target: 'search', placement: 'bottom' },
  { icon: Sparkles, title: "You're set.", body: (<>Open any ticket to see the full reply thread. Built by <a href="https://letsbuildmyapp.com" className="text-accent hover:underline">letsbuildmyapp.com</a>.</>) },
];

const AGENT_STEPS: Step[] = [
  { icon: Sparkles, title: 'Welcome, agent.', body: 'Your queue, your tools. Quick orientation before you dive in.' },
  { icon: LayoutGrid, title: 'Filterable queue', body: (<>Filter by <span className="text-fg font-medium">Assigned to me</span>, <span className="text-fg font-medium">Unassigned</span>, or <span className="text-fg font-medium">All open</span>. Triage at a glance.</>), target: 'nav', placement: 'bottom' },
  { icon: MessageSquare, title: 'Reply or take a note', body: 'In any ticket, toggle between a public reply and a private internal note — teammates see notes, customers do not.', target: 'search', placement: 'bottom' },
  { icon: UserPlus, title: 'Status, priority, assignee', body: 'Right column has the full toolkit — change status, bump priority, hand off to a teammate. Every change is logged in the timeline.', target: 'account', placement: 'bottom' },
  { icon: Sparkles, title: "Let's go.", body: (<>Press ⌘K from anywhere. Built by <a href="https://letsbuildmyapp.com" className="text-accent hover:underline">letsbuildmyapp.com</a>.</>) },
];

const ADMIN_STEPS: Step[] = [
  { icon: Sparkles, title: 'Welcome, admin.', body: 'Oversight, reports, and configuration in one place.' },
  { icon: BarChart3, title: 'Dashboard', body: 'Live counts, average first-response time, ticket volume by category, and an agent leaderboard.', target: 'nav', placement: 'bottom' },
  { icon: Tag, title: 'Categories', body: 'Add or rename ticket categories. Customers pick from this list when opening a ticket.', target: 'nav', placement: 'bottom' },
  { icon: Lock, title: 'SLA reminders', body: 'Configure response-time thresholds and SLA reminder cadence — agents get a nudge when a ticket goes cold.', target: 'nav', placement: 'bottom' },
  { icon: Sparkles, title: "All yours.", body: (<>You can also work the queue alongside agents. Built by <a href="https://letsbuildmyapp.com" className="text-accent hover:underline">letsbuildmyapp.com</a>.</>) },
];

type Rect = { top: number; left: number; width: number; height: number };

export function Tutorial() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.innerWidth < MOBILE,
  );

  const role = user?.role;
  const STEPS = useMemo<Step[]>(() => {
    if (role === 'agent') return AGENT_STEPS;
    if (role === 'admin') return ADMIN_STEPS;
    return CUSTOMER_STEPS;
  }, [role]);

  useEffect(() => { setStep(0); }, [STEPS]);

  useEffect(() => {
    if (!role) { setOpen(false); return; }
    const seen = localStorage.getItem(KEY_PREFIX + role);
    setOpen(!seen);
    setStep(0);
  }, [role]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  const close = useCallback(() => {
    if (role) localStorage.setItem(KEY_PREFIX + role, '1');
    setOpen(false);
  }, [role]);

  const next = useCallback(() => {
    setStep((s) => {
      if (s < STEPS.length - 1) return s + 1;
      close();
      return s;
    });
  }, [close, STEPS.length]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close, next, back]);

  const currentStep = STEPS[step];
  const targetSel = currentStep.target;

  useLayoutEffect(() => {
    if (!open || isMobile || !targetSel) { setRect(null); return; }
    const compute = () => {
      const el = document.querySelector(`[data-tour="${targetSel}"]`) as HTMLElement | null;
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    compute();
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, isMobile, targetSel, step]);

  if (!open) return null;

  const hasTarget = !!rect && !!targetSel;
  if (isMobile || !hasTarget) {
    return <CenteredModal steps={STEPS} step={step} onClose={close} onNext={next} onBack={back} onJump={setStep} />;
  }

  const Icon = currentStep.icon;
  const isLast = step === STEPS.length - 1;

  const PAD = 16;
  const TIP_W = 360;
  const TIP_H = 280;
  let top = 0, left = 0;
  if (rect) {
    const placement = currentStep.placement ?? 'bottom';
    if (placement === 'right')      { left = rect.left + rect.width + PAD; top = rect.top; }
    else if (placement === 'left')  { left = rect.left - TIP_W - PAD; top = rect.top; }
    else if (placement === 'bottom'){ left = rect.left; top = rect.top + rect.height + PAD; }
    else                            { left = rect.left; top = rect.top - TIP_H - PAD; }
    if (left + TIP_W > window.innerWidth - PAD) left = window.innerWidth - TIP_W - PAD;
    if (top + TIP_H > window.innerHeight - PAD) top = window.innerHeight - TIP_H - PAD;
    left = Math.max(PAD, left);
    top = Math.max(PAD, top);
  }

  return (
    <AnimatePresence>
      <motion.div
        key="spot-bg"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]" onClick={close}
      >
        {hasTarget && rect && (
          <motion.div
            initial={false}
            animate={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className="absolute rounded-xl pointer-events-none"
            style={{ boxShadow: '0 0 0 9999px rgba(15,23,42,0.72), 0 0 0 2px rgb(var(--accent))' }}
          />
        )}
      </motion.div>

      <motion.div
        key={`tip-${step}`}
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18 }}
        role="dialog" aria-modal="true"
        className="fixed z-[101] w-[360px] rounded-2xl border border-line bg-bg-panel shadow-panel overflow-hidden"
        style={{ top, left }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 h-11 border-b border-line">
          <span className="eyebrow">Tour · <span className="tnum">{step + 1}</span> of <span className="tnum">{STEPS.length}</span></span>
          <button onClick={close} className="text-fg-subtle hover:text-fg p-1.5 rounded-lg hover:bg-bg-hover" aria-label="Close tour">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <div className="h-10 w-10 rounded-xl bg-accent/10 grid place-items-center mb-4">
            <Icon size={18} className="text-accent" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{currentStep.title}</h2>
          <div className="text-sm text-fg-muted mt-2 leading-relaxed">{currentStep.body}</div>
        </div>
        <Footer step={step} steps={STEPS} onJump={setStep} onClose={close} onBack={back} onNext={next} isLast={isLast} />
      </motion.div>
    </AnimatePresence>
  );
}

function CenteredModal({
  steps, step, onClose, onNext, onBack, onJump,
}: {
  steps: Step[]; step: number; onClose: () => void; onNext: () => void; onBack: () => void; onJump: (i: number) => void;
}) {
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;
  return (
    <AnimatePresence>
      <motion.div
        key="bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] grid place-items-center px-4 py-8 bg-black/72 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key={`s-${step}`}
          initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md rounded-2xl border border-line bg-bg-panel shadow-panel overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 h-12 border-b border-line">
            <span className="eyebrow">Tour · <span className="tnum">{step + 1}</span> of <span className="tnum">{steps.length}</span></span>
            <button onClick={onClose} className="text-fg-subtle hover:text-fg p-1.5 rounded-lg hover:bg-bg-hover" aria-label="Close tour">
              <X size={16} />
            </button>
          </div>
          <div className="p-7">
            <div className="h-12 w-12 rounded-xl bg-accent/10 grid place-items-center mb-4">
              <Icon size={20} className="text-accent" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">{current.title}</h2>
            <div className="text-base text-fg-muted mt-3 leading-relaxed">{current.body}</div>
          </div>
          <Footer step={step} steps={steps} onJump={onJump} onClose={onClose} onBack={onBack} onNext={onNext} isLast={isLast} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Footer({ step, steps, onJump, onClose, onBack, onNext, isLast }: {
  step: number; steps: Step[]; onJump: (i: number) => void; onClose: () => void; onBack: () => void; onNext: () => void; isLast: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 h-14 border-t border-line bg-bg-subtle/40">
      <div className="flex items-center gap-1.5">
        {steps.map((_, i) => (
          <button
            key={i} onClick={() => onJump(i)} aria-label={`Go to step ${i + 1}`}
            className={i === step ? 'h-1.5 w-6 rounded-full bg-accent transition-all' : 'h-1.5 w-1.5 rounded-full bg-line-strong hover:bg-fg-subtle transition-all'}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        {step > 0 ? (
          <button onClick={onBack} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm text-fg-muted hover:text-fg hover:bg-bg-hover transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
        ) : (
          <button onClick={onClose} className="inline-flex items-center h-9 px-3 rounded-lg text-sm text-fg-subtle hover:text-fg transition-colors">Skip</button>
        )}
        <button onClick={onNext} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold bg-accent hover:bg-accent-hover text-white transition-colors">
          {isLast ? 'Done' : 'Next'} {!isLast && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}
