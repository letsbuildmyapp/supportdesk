import { Outlet } from "react-router-dom";
import { PortalHeader } from "@/components/PortalHeader";
import { useStore } from "@/lib/store";
import { Navigate } from "react-router-dom";

export function PortalLayout({ onOpenPalette }: { onOpenPalette: () => void }) {
  const me = useStore((s) => s.users.find((u) => u.id === s.currentUserId));
  if (!me) return <Navigate to="/" replace />;
  if (me.role !== "customer") {
    // Allow internal users to view the portal too — they're "previewing the customer experience"
    // But it's still a real customer view, so we identify as the demo customer (they are switching role via menu)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PortalHeader onOpenSearch={onOpenPalette} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="px-6 py-8 mt-auto text-center text-[12px] text-fg-subtle">
        © {new Date().getFullYear()} {useStore.getState().orgSettings.name} · Powered by SupportDesk
      </footer>
    </div>
  );
}
