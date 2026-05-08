import { Command } from "cmdk";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, FileText, Users, BookOpen, Inbox, Briefcase, Activity, Settings, RotateCcw, Sun, Moon } from "lucide-react";
import { useStore } from "@/lib/store";
import { search as searchData } from "@/lib/search";
import { applyTheme, getTheme } from "@/lib/theme";
import { StatusPill } from "./StatusPill";
import { cn } from "@/lib/utils";

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const me = store.users.find((u) => u.id === store.currentUserId);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const data = useMemo(
    () => ({
      users: store.users,
      tickets: store.tickets,
      kbArticles: store.kbArticles,
      categories: store.categories,
      slaPolicies: store.slaPolicies,
      cannedResponses: store.cannedResponses,
      outbox: store.outbox,
      notifications: store.notifications,
      orgSettings: store.orgSettings,
    }),
    [store]
  );
  const hits = useMemo(() => searchData(data, q), [data, q]);

  const recent = store.tickets.slice(0, 4);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-md flex items-start justify-center pt-[10vh] px-4" onClick={onClose}>
      <div className="w-full max-w-2xl glass-strong rounded-2xl shadow-glass-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <Command label="SupportDesk command palette" className="flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
            <Search className="w-4 h-4 text-fg-muted shrink-0" />
            <Command.Input
              autoFocus
              value={q}
              onValueChange={setQ}
              placeholder="Search tickets, articles, customers… or type a command"
              className="flex-1 bg-transparent border-0 outline-none text-[15px] text-fg placeholder:text-fg-subtle"
            />
            <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-bg-elevated/60 text-fg-muted font-mono">esc</kbd>
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto py-2">
            <Command.Empty className="py-10 text-center text-[13px] text-fg-muted">No results.</Command.Empty>

            {!q && (
              <Command.Group heading="Recent tickets" className="px-1">
                {recent.map((t) => (
                  <Command.Item
                    key={t.id}
                    value={`recent ${t.id} ${t.subject}`}
                    onSelect={() => {
                      nav(me?.role === "customer" ? `/portal/ticket/${t.id}` : `/app/ticket/${t.id}`);
                      onClose();
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-bg-elevated/60 mx-1"
                  >
                    <FileText className="w-4 h-4 text-fg-muted" />
                    <span className="text-[14px] text-fg truncate flex-1">{t.subject}</span>
                    <StatusPill status={t.status} />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {hits.length > 0 && (
              <Command.Group heading="Results" className="px-1">
                {hits.map((h) => {
                  if (h.kind === "ticket") {
                    return (
                      <Command.Item
                        key={`t-${h.ticket.id}`}
                        value={`ticket ${h.ticket.id} ${h.ticket.subject}`}
                        onSelect={() => {
                          nav(me?.role === "customer" ? `/portal/ticket/${h.ticket.id}` : `/app/ticket/${h.ticket.id}`);
                          onClose();
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-bg-elevated/60 mx-1"
                      >
                        <FileText className="w-4 h-4 text-fg-muted" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] text-fg truncate">{h.ticket.subject}</div>
                          <div className="text-[12px] text-fg-muted">{h.ticket.id}</div>
                        </div>
                        <StatusPill status={h.ticket.status} />
                      </Command.Item>
                    );
                  }
                  if (h.kind === "article") {
                    return (
                      <Command.Item
                        key={`a-${h.article.id}`}
                        value={`article ${h.article.title} ${h.article.tags.join(" ")}`}
                        onSelect={() => {
                          nav(`/portal/articles/${h.article.slug}`);
                          onClose();
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-bg-elevated/60 mx-1"
                      >
                        <BookOpen className="w-4 h-4 text-fg-muted" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] text-fg truncate">{h.article.title}</div>
                          <div className="text-[12px] text-fg-muted truncate">{h.article.excerpt}</div>
                        </div>
                      </Command.Item>
                    );
                  }
                  if (h.kind === "customer" || h.kind === "agent") {
                    return (
                      <Command.Item
                        key={`u-${h.user.id}`}
                        value={`user ${h.user.name} ${h.user.email}`}
                        onSelect={() => {
                          if (h.kind === "customer") nav(`/app/customers?q=${encodeURIComponent(h.user.name)}`);
                          else nav(`/app/team-members?q=${encodeURIComponent(h.user.name)}`);
                          onClose();
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-bg-elevated/60 mx-1"
                      >
                        <Users className="w-4 h-4 text-fg-muted" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] text-fg truncate">{h.user.name}</div>
                          <div className="text-[12px] text-fg-muted truncate">
                            {h.user.email} · {h.user.role}
                          </div>
                        </div>
                      </Command.Item>
                    );
                  }
                  return null;
                })}
              </Command.Group>
            )}

            <Command.Group heading="Navigate" className="px-1">
              {me?.role !== "customer" && (
                <>
                  <PaletteCmd label="Go to Inbox" icon={Inbox} onSelect={() => { nav("/app"); onClose(); }} />
                  <PaletteCmd label="Go to Team queue" icon={Briefcase} onSelect={() => { nav("/app/team-queue"); onClose(); }} />
                  <PaletteCmd label="Go to Metrics" icon={Activity} onSelect={() => { nav("/app/metrics"); onClose(); }} />
                  <PaletteCmd label="Go to Settings" icon={Settings} onSelect={() => { nav("/app/settings"); onClose(); }} />
                </>
              )}
              {me?.role === "customer" && (
                <>
                  <PaletteCmd label="Go to My tickets" icon={Inbox} onSelect={() => { nav("/portal/my-tickets"); onClose(); }} />
                  <PaletteCmd label="Browse Knowledge base" icon={BookOpen} onSelect={() => { nav("/portal/articles"); onClose(); }} />
                  <PaletteCmd label="Submit a new ticket" icon={ArrowRight} onSelect={() => { nav("/portal/new"); onClose(); }} />
                </>
              )}
            </Command.Group>

            <Command.Group heading="Demo" className="px-1">
              <PaletteCmd
                label={`Theme · ${getTheme()}`}
                icon={getTheme() === "dark" ? Moon : Sun}
                onSelect={() => {
                  const cur = getTheme();
                  applyTheme(cur === "dark" ? "light" : cur === "light" ? "system" : "dark");
                }}
              />
              <PaletteCmd label="Reset demo data" icon={RotateCcw} onSelect={() => store.resetDemo()} />
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function PaletteCmd({
  label,
  icon: Icon,
  onSelect,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={`nav ${label}`}
      onSelect={onSelect}
      className={cn("flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-bg-elevated/60 mx-1")}
    >
      <Icon className="w-4 h-4 text-fg-muted" />
      <span className="text-[14px] text-fg flex-1">{label}</span>
      <ArrowRight className="w-3.5 h-3.5 text-fg-subtle" />
    </Command.Item>
  );
}
