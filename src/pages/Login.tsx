import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CircleUser, Headphones, Briefcase, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/Logo";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RoleTile {
  role: Role;
  userId: string;
  title: string;
  blurb: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

const TILES: RoleTile[] = [
  {
    role: "customer",
    userId: "c_aisha",
    title: "Customer",
    blurb: "Submit a ticket, track its status, browse the knowledge base.",
    icon: CircleUser,
    accent: "from-status-open/40 to-mesh-2/30",
  },
  {
    role: "agent",
    userId: "u_priya",
    title: "Agent",
    blurb: "Triage your queue, reply to customers, add internal notes.",
    icon: Headphones,
    accent: "from-status-resolved/40 to-mesh-3/30",
  },
  {
    role: "manager",
    userId: "u_manager",
    title: "Manager",
    blurb: "See the whole team queue, monitor SLA, watch the metrics.",
    icon: Briefcase,
    accent: "from-status-pending/40 to-mesh-4/30",
  },
  {
    role: "admin",
    userId: "u_admin",
    title: "Admin",
    blurb: "Configure categories, SLA, canned responses, and the team.",
    icon: ShieldCheck,
    accent: "from-accent/45 to-mesh-1/30",
  },
];

export function Login() {
  const store = useStore();
  const nav = useNavigate();
  const org = store.orgSettings;

  function enter(tile: RoleTile) {
    const target = store.users.find((u) => u.id === tile.userId);
    if (!target) return;
    store.setCurrentUser(target.id);
    if (tile.role === "customer") nav("/portal");
    else nav("/app");
  }

  return (
    <main className="relative min-h-screen flex flex-col">
      <header className="px-5 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <div>
            <div className="text-[14px] font-semibold text-fg leading-tight">SupportDesk</div>
            <div className="text-[11px] text-fg-muted leading-tight">{org.name}</div>
          </div>
        </div>
        <a
          href="https://letsbuildmyapp.com"
          target="_blank"
          rel="noreferrer"
          className="text-[12px] text-fg-muted hover:text-fg flex items-center gap-1"
        >
          <span className="hidden sm:inline">A portfolio piece by</span>
          <span className="font-medium text-fg">letsbuildmyapp.com</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 pb-16">
        <div className="max-w-3xl w-full text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-border-strong/40 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-[12px] text-fg-muted">Live demo · click any tile to enter</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-[44px] sm:text-[64px] leading-[1.05] tracking-tight text-fg text-balance"
          >
            <span className="italic">Help,</span> refined.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 text-[16px] sm:text-[18px] text-fg-muted max-w-2xl mx-auto leading-relaxed"
          >
            A customer support portal for SaaS teams who treat support like a product.
            Pick a role to step inside the demo.
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl"
        >
          {TILES.map((tile) => {
            const user = store.users.find((u) => u.id === tile.userId);
            const Icon = tile.icon;
            return (
              <motion.button
                key={tile.role}
                variants={{ hidden: { opacity: 0, y: 18, filter: "blur(6px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)" } }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                onClick={() => enter(tile)}
                className="group relative text-left rounded-2xl glass-card p-5 hover:shadow-glass-lg transition-all overflow-hidden flex flex-col min-h-[280px]"
              >
                <div
                  className={cn(
                    "absolute -inset-x-8 -top-12 h-32 rounded-full blur-3xl opacity-50 group-hover:opacity-90 transition-opacity bg-gradient-to-r pointer-events-none",
                    tile.accent
                  )}
                  aria-hidden
                />
                <div className="relative flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl glass border border-border-strong/40 text-fg">
                      <Icon className="w-5 h-5" />
                    </span>
                    <ArrowRight className="w-4 h-4 text-fg-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h2 className="font-display text-[28px] leading-tight text-fg">{tile.title}</h2>
                  <p className="text-[14px] text-fg-muted leading-relaxed mt-1.5">{tile.blurb}</p>

                  {user && (
                    <div className="mt-auto pt-4 border-t border-border/60 flex items-center gap-2.5">
                      <img src={user.avatar} alt="" className="w-7 h-7 rounded-full shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-fg truncate">{user.name}</div>
                        <div className="text-[10.5px] text-fg-muted truncate">{user.title ?? user.company}</div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 text-[12px] text-fg-subtle text-center max-w-xl"
        >
          Every action persists locally for your session. Click <span className="text-fg-muted">Reset demo</span> in the user menu (or the
          command palette via <kbd className="px-1.5 py-0.5 rounded border border-border bg-bg-elevated/60 font-mono text-[11px]">⌘K</kbd>) to start fresh.
        </motion.div>
      </div>
    </main>
  );
}
