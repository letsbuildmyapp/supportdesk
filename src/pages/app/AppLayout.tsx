import { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { useStore } from "@/lib/store";

export function AppLayout({ onOpenPalette }: { onOpenPalette: () => void }) {
  const me = useStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const loc = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [loc.pathname]);

  // Lock body scroll while drawer open (mobile only)
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [drawerOpen]);

  if (!me) return <Navigate to="/" replace />;
  if (me.role === "customer") return <Navigate to="/portal" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader onOpenPalette={onOpenPalette} onToggleNav={() => setDrawerOpen((o) => !o)} />
      <div className="flex flex-1 min-h-0">
        <AppSidebar drawerOpen={drawerOpen} onCloseDrawer={() => setDrawerOpen(false)} />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
