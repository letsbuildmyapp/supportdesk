import { NavLink, useLocation } from "react-router-dom";
import {
  Inbox,
  UserCog,
  Mail,
  AtSign,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Users,
  BookOpen,
  Settings,
  MessageCircle,
  Folder,
  TimerReset,
  Briefcase,
  CircleUser,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: () => number;
  tour?: string;
}

interface AppSidebarProps {
  drawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

export function AppSidebar({ drawerOpen = false, onCloseDrawer }: AppSidebarProps) {
  const store = useStore();
  const loc = useLocation();
  const me = store.users.find((u) => u.id === store.currentUserId);
  if (!me) return null;
  const role: Role = me.role;

  const all = store.tickets;
  const myAssigned = all.filter((t) => t.assigneeId === me.id && t.status !== "closed");
  const unassigned = all.filter((t) => !t.assigneeId && t.status !== "closed");
  const allOpen = all.filter((t) => t.status === "open" || t.status === "pending");
  const mentions = store.notifications.filter((n) => n.userId === me.id && n.kind === "mention" && !n.read);
  const recentlyResolved = all.filter((t) => t.status === "resolved").slice(0, 999);

  const inboxItems: NavItem[] = [
    { to: "/app", label: "My tickets", icon: Inbox, count: () => myAssigned.length, tour: "nav-my" },
    { to: "/app/unassigned", label: "Unassigned", icon: Mail, count: () => unassigned.length, tour: "nav-unassigned" },
    { to: "/app/all", label: "All open", icon: Activity, count: () => allOpen.length },
    { to: "/app/mentions", label: "Mentions", icon: AtSign, count: () => mentions.length },
    { to: "/app/resolved", label: "Resolved", icon: CheckCircle2, count: () => recentlyResolved.length },
  ];
  const managerItems: NavItem[] =
    role === "manager" || role === "admin"
      ? [
          { to: "/app/team-queue", label: "Team queue", icon: Briefcase, tour: "nav-team-queue" },
          { to: "/app/workload", label: "Workload", icon: Users, tour: "nav-workload" },
          { to: "/app/metrics", label: "Metrics", icon: Activity, tour: "nav-metrics" },
          { to: "/app/sla", label: "SLA monitor", icon: AlertTriangle, tour: "nav-sla" },
        ]
      : [];
  const adminItems: NavItem[] =
    role === "admin"
      ? [
          { to: "/app/categories", label: "Categories", icon: Folder, tour: "nav-categories" },
          { to: "/app/sla-policies", label: "SLA policies", icon: TimerReset, tour: "nav-sla-policies" },
          { to: "/app/canned", label: "Canned responses", icon: MessageCircle, tour: "nav-canned" },
          { to: "/app/team-members", label: "Team members", icon: UserCog, tour: "nav-team-members" },
          { to: "/app/customers", label: "Customers", icon: CircleUser },
          { to: "/app/kb", label: "Knowledge base", icon: BookOpen, tour: "nav-kb" },
          { to: "/app/notifications-log", label: "Notifications log", icon: Mail, tour: "nav-notifications-log" },
          { to: "/app/settings", label: "Org settings", icon: Settings },
        ]
      : [];

  const sidebarBody = (
    <>
      <SectionLabel>Inbox</SectionLabel>
      {inboxItems.map((it) => (
        <SidebarItem key={it.to} item={it} active={loc.pathname === it.to} onClick={onCloseDrawer} />
      ))}

      {managerItems.length > 0 && (
        <>
          <SectionLabel className="mt-5">Team</SectionLabel>
          {managerItems.map((it) => (
            <SidebarItem key={it.to} item={it} active={loc.pathname === it.to} onClick={onCloseDrawer} />
          ))}
        </>
      )}

      {adminItems.length > 0 && (
        <>
          <SectionLabel className="mt-5">Admin</SectionLabel>
          {adminItems.map((it) => (
            <SidebarItem key={it.to} item={it} active={loc.pathname === it.to} onClick={onCloseDrawer} />
          ))}
        </>
      )}

      <div className="mt-auto pt-4">
        <div className="rounded-xl glass-card p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-resolved" />
            <span className="text-[11px] uppercase tracking-wider text-fg-muted">Status</span>
          </div>
          <div className="text-[13px] text-fg leading-snug">All systems operational</div>
          <div className="text-[11px] text-fg-muted mt-0.5">No active incidents</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile drawer backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition-opacity",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onCloseDrawer}
        aria-hidden
      />
      {/* Sidebar — drawer on mobile, sticky aside on lg+ */}
      <aside
        className={cn(
          "flex flex-col w-64 shrink-0 px-3 py-4 gap-1 overflow-y-auto",
          // Mobile drawer
          "fixed inset-y-0 left-0 z-50 bg-bg-elevated border-r border-border-strong/60 transition-transform shadow-2xl",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop sticky
          "lg:translate-x-0 lg:static lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:w-60 lg:bg-transparent lg:shadow-none lg:glass lg:border-r lg:border-border/50"
        )}
      >
        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseDrawer}
          className="lg:hidden absolute top-2 right-2 p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-bg-elevated/60"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
        {sidebarBody}
      </aside>
    </>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-2 pt-1 pb-1 text-[10px] uppercase tracking-[0.12em] font-medium text-fg-subtle", className)}>
      {children}
    </div>
  );
}

function SidebarItem({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  const Icon = item.icon;
  const count = item.count?.() ?? 0;
  return (
    <NavLink
      to={item.to}
      end
      data-tour={item.tour}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-colors min-h-[44px] lg:min-h-0",
          (isActive || active) ? "bg-accent/12 text-accent" : "text-fg-muted hover:text-fg hover:bg-bg-elevated/40"
        )
      }
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{item.label}</span>
      {count > 0 && (
        <span className="ml-auto text-[11px] tabnum px-1.5 py-0.5 rounded-md bg-bg-elevated/60 text-fg-muted">
          {count}
        </span>
      )}
    </NavLink>
  );
}
