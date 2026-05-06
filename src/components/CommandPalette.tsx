import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { subscribeAllTickets, subscribeMyTickets } from '@/lib/queries';
import type { Ticket } from '@/lib/types';
import { Search, Inbox, Plus, LayoutGrid, BarChart3, Sun, Moon, LogOut, Hash, type LucideIcon } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('cmdk-open', onOpen);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('cmdk-open', onOpen);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const sub = user.role === 'customer'
      ? subscribeMyTickets(user.uid, setTickets)
      : subscribeAllTickets(setTickets);
    return sub;
  }, [user]);

  if (!open || !user) return null;

  const go = (path: string) => { setOpen(false); nav(path); };

  return (
    <div className="fixed inset-0 z-[150] grid place-items-start pt-[12vh] px-4 bg-black/40 backdrop-blur-[2px]" onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl rounded-2xl border border-line bg-bg-panel shadow-panel overflow-hidden">
        <Command label="Command palette" loop>
          <div className="flex items-center gap-3 h-14 px-4 border-b border-line">
            <Search size={16} className="text-fg-subtle" />
            <Command.Input
              placeholder="Search tickets, jump to a page…"
              className="flex-1 bg-transparent outline-none text-base placeholder:text-fg-subtle"
            />
            <kbd className="kbd">esc</kbd>
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-sm text-fg-subtle text-center">No matches.</Command.Empty>

            <Command.Group heading="Navigate">
              {user.role === 'customer' && <>
                <Item onSelect={() => go('/tickets')} icon={Inbox} label="My tickets" />
                <Item onSelect={() => go('/new')} icon={Plus} label="New ticket" />
              </>}
              {(user.role === 'agent' || user.role === 'admin') && <Item onSelect={() => go('/queue')} icon={LayoutGrid} label="Ticket queue" />}
              {user.role === 'admin' && <>
                <Item onSelect={() => go('/admin')} icon={BarChart3} label="Admin dashboard" />
              </>}
            </Command.Group>

            <Command.Group heading="Tickets">
              {tickets.slice(0, 10).map((t) => (
                <Command.Item key={t.id} value={`${t.subject} ${t.id} ${t.customerName}`} onSelect={() => go(`/t/${t.id}`)}
                  className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm cursor-pointer aria-selected:bg-bg-subtle">
                  <Hash size={14} className="text-fg-subtle" />
                  <span className="font-mono text-xs text-fg-subtle tnum">{t.id.slice(-4)}</span>
                  <span className="truncate flex-1">{t.subject}</span>
                  <span className="text-xs text-fg-subtle hidden sm:inline truncate max-w-[120px]">{t.customerName}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Settings">
              <Item onSelect={() => { toggle(); setOpen(false); }} icon={theme === 'dark' ? Sun : Moon} label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} />
              <Item onSelect={async () => { await signOut(); setOpen(false); nav('/login'); }} icon={LogOut} label="Sign out" />
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function Item({ onSelect, icon: Icon, label }: { onSelect: () => void; icon: LucideIcon; label: string }) {
  return (
    <Command.Item onSelect={onSelect} className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm cursor-pointer aria-selected:bg-bg-subtle">
      <Icon size={14} className="text-fg-subtle" />
      <span>{label}</span>
    </Command.Item>
  );
}
