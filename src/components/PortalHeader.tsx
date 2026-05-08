import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { Search, MessageSquarePlus, Menu, X, Inbox, BookOpen, HelpCircle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export function PortalHeader({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const org = useStore((s) => s.orgSettings);
  const nav = useNavigate();
  const loc = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [loc.pathname]);

  // Click outside
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-border/50 px-3 sm:px-6 h-16 flex items-center gap-2 sm:gap-3">
      <Link to="/portal" className="flex items-center gap-2.5 min-w-0">
        <Logo size={36} />
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-fg leading-tight truncate">{org.name}</div>
          <div className="text-[11px] text-fg-muted leading-tight truncate">Support Center</div>
        </div>
      </Link>

      {/* Desktop nav */}
      <nav className="ml-6 hidden md:flex items-center gap-1">
        <PortalNavLink to="/portal" end label="Help" tour="portal-nav-help" />
        <PortalNavLink to="/portal/articles" label="Knowledge base" tour="portal-nav-kb" />
        <PortalNavLink to="/portal/my-tickets" label="My tickets" tour="portal-nav-mine" />
      </nav>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            aria-label="Search"
            className="p-2 rounded-xl text-fg-muted hover:text-fg hover:bg-bg-elevated/40"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>
        )}
        <Button
          size="sm"
          variant="primary"
          onClick={() => nav("/portal/new")}
          data-tour="portal-submit"
          className="!h-9 !px-3"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Submit a ticket</span>
        </Button>
        <UserMenu />
        {/* Mobile hamburger */}
        <div className="relative md:hidden" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-xl text-fg-muted hover:text-fg hover:bg-bg-elevated/40"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-bg-elevated border border-border-strong/70 rounded-2xl shadow-[0_16px_48px_-16px_oklch(0_0_0/0.4)] overflow-hidden z-50 animate-fade-up">
              <MobileLink to="/portal" label="Help" icon={<HelpCircle className="w-4 h-4" />} />
              <MobileLink to="/portal/articles" label="Knowledge base" icon={<BookOpen className="w-4 h-4" />} />
              <MobileLink to="/portal/my-tickets" label="My tickets" icon={<Inbox className="w-4 h-4" />} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function PortalNavLink({ to, label, end, tour }: { to: string; label: string; end?: boolean; tour?: string }) {
  return (
    <NavLink
      to={to}
      end={end}
      data-tour={tour}
      className={({ isActive }) =>
        cn(
          "px-3 py-1.5 rounded-xl text-[14px] font-medium",
          isActive ? "text-accent bg-accent/10" : "text-fg-muted hover:text-fg hover:bg-bg-elevated/40"
        )
      }
    >
      {label}
    </NavLink>
  );
}

function MobileLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === "/portal"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 px-4 py-3 text-[14px] font-medium border-b border-border/40 last:border-b-0 min-h-[44px]",
          isActive ? "text-accent bg-accent/8" : "text-fg hover:bg-bg-elevated/60"
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
