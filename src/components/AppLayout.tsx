import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { Avatar } from './Avatar';
import { Inbox, Plus, LayoutGrid, BarChart3, Tag, Settings, LogOut, Search, Sun, Moon, Headphones, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function AppLayout() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const role = user.role;

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="sticky top-0 z-30 h-16 border-b border-line bg-bg-panel/85 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center gap-6">
          <Link to="/home" className="flex items-center gap-2.5" data-tour="brand">
            <div className="h-9 w-9 rounded-xl bg-accent grid place-items-center shadow-soft">
              <Headphones size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="font-semibold tracking-tight text-[17px]">SupportDesk</div>
          </Link>

          <nav className="hidden md:flex items-center gap-1" data-tour="nav">
            {role === 'customer' && (
              <>
                <NavItem to="/tickets" icon={Inbox}>My tickets</NavItem>
                <NavItem to="/new" icon={Plus} accent>New ticket</NavItem>
              </>
            )}
            {(role === 'agent' || role === 'admin') && (
              <NavItem to="/queue" icon={LayoutGrid}>Queue</NavItem>
            )}
            {role === 'admin' && (
              <>
                <NavItem to="/admin" icon={BarChart3}>Dashboard</NavItem>
                <NavItem to="/admin/categories" icon={Tag}>Categories</NavItem>
                <NavItem to="/admin/settings" icon={Settings}>SLA</NavItem>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('cmdk-open'))}
              data-tour="search"
              className="hidden sm:inline-flex items-center gap-2 h-10 pl-3 pr-2 rounded-xl border border-line bg-bg-subtle hover:bg-bg-hover text-sm text-fg-muted transition-colors"
            >
              <Search size={15} />
              <span>Search</span>
              <span className="ml-2 flex items-center gap-0.5">
                <kbd className="kbd">⌘</kbd><kbd className="kbd">K</kbd>
              </span>
            </button>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-10 w-10 grid place-items-center rounded-xl border border-line bg-bg-panel hover:bg-bg-subtle text-fg-muted transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="relative" data-tour="account">
              <button
                onClick={() => setMenuOpen(o => !o)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="flex items-center gap-2.5 h-10 pl-1 pr-3 rounded-xl border border-line bg-bg-panel hover:bg-bg-subtle transition-colors"
              >
                <Avatar name={user.name} size={28} />
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-sm font-medium">{user.name.split(' ')[0]}</div>
                  <div className="text-[11px] text-fg-subtle uppercase tracking-wider">{user.role}</div>
                </div>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-line bg-bg-panel shadow-panel overflow-hidden">
                  <div className="px-4 py-3 border-b border-line">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-fg-subtle truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={async () => { await signOut(); toast.success('Signed out'); nav('/login'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-fg-muted hover:bg-bg-subtle hover:text-fg transition-colors"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Mobile nav row */}
        <div className="md:hidden border-t border-line bg-bg-panel">
          <div className="max-w-[1400px] mx-auto px-3 py-2 flex items-center gap-1 overflow-x-auto">
            {role === 'customer' && (<>
              <NavItem to="/tickets" icon={Inbox} compact>Tickets</NavItem>
              <NavItem to="/new" icon={Plus} compact accent>New</NavItem>
            </>)}
            {(role === 'agent' || role === 'admin') && <NavItem to="/queue" icon={LayoutGrid} compact>Queue</NavItem>}
            {role === 'admin' && (<>
              <NavItem to="/admin" icon={BarChart3} compact>Dash</NavItem>
              <NavItem to="/admin/categories" icon={Tag} compact>Categories</NavItem>
              <NavItem to="/admin/settings" icon={Settings} compact>SLA</NavItem>
            </>)}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-bg-panel/50 py-6 px-6">
        <div className="max-w-[1400px] mx-auto text-xs text-fg-subtle text-center">
          Built by <a href="https://letsbuildmyapp.com" className="text-accent hover:underline">letsbuildmyapp.com</a>
        </div>
      </footer>
    </div>
  );
}

function NavItem({
  to, icon: Icon, children, accent, compact,
}: {
  to: string; icon: LucideIcon;
  children: React.ReactNode; accent?: boolean; compact?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'inline-flex items-center gap-2 rounded-xl text-sm font-medium transition-colors',
          compact ? 'h-9 px-3' : 'h-10 px-3.5',
          accent
            ? 'bg-accent text-white hover:bg-accent-hover'
            : isActive
              ? 'bg-bg-subtle text-fg'
              : 'text-fg-muted hover:bg-bg-subtle hover:text-fg',
        )
      }
    >
      <Icon size={15} />
      <span>{children}</span>
    </NavLink>
  );
}
