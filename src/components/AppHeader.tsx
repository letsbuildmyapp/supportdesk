import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "./NotificationBell";
import { useStore } from "@/lib/store";
import { Logo } from "./Logo";

export function AppHeader({ onOpenPalette, onToggleNav }: { onOpenPalette: () => void; onToggleNav?: () => void }) {
  const orgName = useStore((s) => s.orgSettings.name);
  const loc = useLocation();
  const nav = useNavigate();
  const isOnPortal = loc.pathname.startsWith("/portal");

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-border/50 px-2 sm:px-5 h-14 flex items-center gap-2">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onToggleNav}
        className="lg:hidden p-2 rounded-xl text-fg-muted hover:text-fg hover:bg-bg-elevated/40 -ml-1"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Link to="/app" className="flex items-center gap-2 group min-w-0">
        <Logo />
        <div className="hidden sm:block min-w-0">
          <div className="text-[13px] font-semibold text-fg leading-tight truncate">SupportDesk</div>
          <div className="text-[10px] text-fg-muted leading-tight truncate">{orgName}</div>
        </div>
      </Link>

      {/* Desktop: full search bar */}
      <button
        onClick={onOpenPalette}
        className="hidden md:flex ml-3 items-center gap-2 px-3 py-1.5 rounded-xl glass border border-border-strong/40 text-fg-muted hover:text-fg hover:bg-bg-elevated/40 transition-all w-full max-w-md"
        data-tour="search"
      >
        <Search className="w-4 h-4" />
        <span className="text-[13px]">Search tickets, customers, articles…</span>
        <span className="ml-auto inline-flex items-center gap-0.5">
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-bg-elevated/60 text-fg-muted font-mono">⌘</kbd>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-bg-elevated/60 text-fg-muted font-mono">K</kbd>
        </span>
      </button>
      {/* Mobile: search icon */}
      <button
        onClick={onOpenPalette}
        aria-label="Search"
        className="md:hidden p-2 rounded-xl text-fg-muted hover:text-fg hover:bg-bg-elevated/40 ml-auto"
      >
        <Search className="w-[18px] h-[18px]" />
      </button>

      <div className="ml-auto md:ml-auto flex items-center gap-1 shrink-0">
        {!isOnPortal && (
          <button
            onClick={() => nav("/portal")}
            className="hidden xl:inline-flex text-[12px] text-fg-muted hover:text-fg px-3 py-1.5 rounded-lg hover:bg-bg-elevated/40"
          >
            Customer portal ↗
          </button>
        )}
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
