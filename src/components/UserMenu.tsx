import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Sun, Moon, Laptop, RotateCcw, Users, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { applyTheme, getTheme } from "@/lib/theme";
import { Avatar } from "./Avatar";
import { useConfirm } from "./ConfirmDialog";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const store = useStore();
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(getTheme());
  const user = store.users.find((u) => u.id === store.currentUserId);
  const { confirm, node: confirmNode } = useConfirm();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  function setT(t: "light" | "dark" | "system") {
    applyTheme(t);
    setTheme(t);
  }

  function switchToRole(role: "customer" | "agent" | "manager" | "admin") {
    const target = store.users.find((u) => u.role === role && (role === "customer" ? u.id === "c_aisha" : true));
    if (!target) return;
    store.setCurrentUser(target.id);
    setOpen(false);
    if (role === "customer") nav("/portal");
    else nav("/app");
  }

  return (
    <div className="relative" ref={ref}>
      {confirmNode}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-bg-elevated/40 transition-colors"
        data-tour="user-menu"
      >
        <Avatar user={user} size="sm" showStatus />
        <div className="hidden md:block text-left">
          <div className="text-[13px] font-medium text-fg leading-tight">{user.name.split(" ")[0]}</div>
          <div className="text-[11px] text-fg-muted leading-tight capitalize">{user.role}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-fg-muted" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(288px,calc(100vw-1.5rem))] bg-bg-elevated border border-border-strong/70 rounded-2xl shadow-[0_16px_48px_-16px_oklch(0_0_0/0.4)] overflow-hidden z-50 animate-fade-up">
          <div className="px-3.5 py-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <Avatar user={user} size="md" />
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-fg truncate">{user.name}</div>
                <div className="text-[12px] text-fg-muted truncate">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="px-2 py-2">
            <div className="px-2 py-1 text-[11px] font-medium text-fg-subtle uppercase tracking-wider">Switch role (demo)</div>
            {(["customer", "agent", "manager", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => switchToRole(r)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] hover:bg-bg-elevated/50 text-left",
                  user.role === r && "text-accent"
                )}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="capitalize">{r}</span>
                {user.role === r && <span className="ml-auto text-[11px] text-fg-subtle">current</span>}
              </button>
            ))}
          </div>

          <div className="px-2 py-2 border-t border-border/50">
            <div className="px-2 py-1 text-[11px] font-medium text-fg-subtle uppercase tracking-wider">Theme</div>
            <div className="flex p-1 rounded-lg bg-bg-elevated/40">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setT(t)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[12px] capitalize",
                    theme === t ? "bg-bg-elevated text-fg" : "text-fg-muted hover:text-fg"
                  )}
                >
                  {t === "light" && <Sun className="w-3 h-3" />}
                  {t === "dark" && <Moon className="w-3 h-3" />}
                  {t === "system" && <Laptop className="w-3 h-3" />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50">
            <button
              onClick={async () => {
                setOpen(false);
                const ok = await confirm({
                  title: "Reset the demo?",
                  description: "This wipes every ticket, reply, and customisation you've made in this browser, and reloads to the original seeded data. Useful before a sales call.",
                  confirmLabel: "Reset demo",
                  danger: true,
                });
                if (ok) store.resetDemo();
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[13px] text-fg-muted hover:text-fg hover:bg-bg-elevated/50 text-left"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset demo
            </button>
            <button
              onClick={() => {
                store.setCurrentUser(null);
                nav("/");
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[13px] text-fg-muted hover:text-fg hover:bg-bg-elevated/50 text-left border-t border-border/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              Exit demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
