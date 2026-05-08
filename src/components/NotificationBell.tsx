import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, AtSign, MessageCircle, AlertTriangle, Star, UserPlus } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";

export function NotificationBell() {
  const store = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const myId = store.currentUserId;
  const myNotifications = store.notifications.filter((n) => n.userId === myId).slice(0, 14);
  const unread = myNotifications.filter((n) => !n.read).length;

  function iconFor(kind: string) {
    if (kind === "mention") return <AtSign className="w-3.5 h-3.5" />;
    if (kind === "reply") return <MessageCircle className="w-3.5 h-3.5" />;
    if (kind === "sla_warning") return <AlertTriangle className="w-3.5 h-3.5" />;
    if (kind === "csat") return <Star className="w-3.5 h-3.5" />;
    return <UserPlus className="w-3.5 h-3.5" />;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl text-fg-muted hover:text-fg hover:bg-bg-elevated/40 transition-colors"
        aria-label="Notifications"
        data-tour="notifications"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-status-breach text-white text-[10px] tabnum font-medium flex items-center justify-center border-2 border-bg">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(360px,calc(100vw-1.5rem))] bg-bg-elevated border border-border-strong/70 rounded-2xl shadow-[0_16px_48px_-16px_oklch(0_0_0/0.4)] overflow-hidden z-50 animate-fade-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <h3 className="font-medium text-[14px] text-fg">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={() => myId && store.markAllNotificationsRead(myId)}
                className="text-[12px] text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {myNotifications.length === 0 && (
              <div className="px-4 py-10 text-center text-[13px] text-fg-muted">No notifications.</div>
            )}
            {myNotifications.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  store.markNotificationRead(n.id);
                  if (n.ticketId) {
                    setOpen(false);
                    nav(`/app/ticket/${n.ticketId}`);
                  }
                }}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left border-b border-border/40 last:border-b-0 hover:bg-bg-elevated/40",
                  !n.read && "bg-accent/[0.04]"
                )}
              >
                <div className={cn("mt-0.5 p-1.5 rounded-lg", !n.read ? "bg-accent/15 text-accent" : "bg-bg-elevated/60 text-fg-muted")}>
                  {iconFor(n.kind)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-fg leading-snug">{n.message}</div>
                  <div className="text-[11px] text-fg-subtle mt-0.5">{timeAgo(n.createdAt)}</div>
                </div>
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
