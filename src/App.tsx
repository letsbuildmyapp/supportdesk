import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Mesh } from "./components/Mesh";
import { SearchPalette } from "./components/SearchPalette";
import { Tour } from "./components/Tour";
import { useStore } from "./lib/store";

import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";

import { PortalLayout } from "./pages/portal/PortalLayout";
import { PortalLanding } from "./pages/portal/Landing";
import { KbBrowse } from "./pages/portal/KbBrowse";
import { KbArticleView } from "./pages/portal/KbArticle";
import { SubmitTicket } from "./pages/portal/Submit";
import { MyTickets } from "./pages/portal/MyTickets";
import { CustomerTicketDetail } from "./pages/portal/CustomerTicketDetail";

import { AppLayout } from "./pages/app/AppLayout";
import { Inbox } from "./pages/app/Inbox";
import { AgentTicketDetail } from "./pages/app/AgentTicketDetail";
import { TeamQueue } from "./pages/app/TeamQueue";
import { Workload } from "./pages/app/Workload";
import { Metrics } from "./pages/app/Metrics";
import { SlaMonitor } from "./pages/app/SlaMonitor";
import { Categories } from "./pages/app/Categories";
import { SlaPolicies } from "./pages/app/SlaPolicies";
import { CannedResponsesAdmin } from "./pages/app/CannedResponses";
import { TeamMembers } from "./pages/app/TeamMembers";
import { CustomersAdmin } from "./pages/app/Customers";
import { KbAdmin } from "./pages/app/KbAdmin";
import { OrgSettings } from "./pages/app/OrgSettings";
import { NotificationsLog } from "./pages/app/NotificationsLog";

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const currentUserId = useStore((s) => s.currentUserId);
  const me = useStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const loc = useLocation();
  const nav = useNavigate();

  // global Cmd-K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (currentUserId) setPaletteOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [currentUserId]);

  // Redirect: if logged in and on "/", route to the right surface
  useEffect(() => {
    if (currentUserId && me && loc.pathname === "/") {
      nav(me.role === "customer" ? "/portal" : "/app", { replace: true });
    }
  }, [currentUserId, me, loc.pathname, nav]);

  return (
    <>
      <Mesh />
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Customer portal */}
        <Route path="/portal" element={<PortalLayout onOpenPalette={() => setPaletteOpen(true)} />}>
          <Route index element={<PortalLanding />} />
          <Route path="articles" element={<KbBrowse />} />
          <Route path="articles/:slug" element={<KbArticleView />} />
          <Route path="new" element={<SubmitTicket />} />
          <Route path="my-tickets" element={<MyTickets />} />
          <Route path="ticket/:id" element={<CustomerTicketDetail />} />
        </Route>

        {/* Internal app */}
        <Route path="/app" element={<AppLayout onOpenPalette={() => setPaletteOpen(true)} />}>
          <Route index element={<Inbox view="my" />} />
          <Route path="unassigned" element={<Inbox view="unassigned" />} />
          <Route path="all" element={<Inbox view="all" />} />
          <Route path="mentions" element={<Inbox view="mentions" />} />
          <Route path="resolved" element={<Inbox view="resolved" />} />
          <Route path="ticket/:id" element={<AgentTicketDetail />} />
          <Route path="team-queue" element={<TeamQueue />} />
          <Route path="workload" element={<Workload />} />
          <Route path="metrics" element={<Metrics />} />
          <Route path="sla" element={<SlaMonitor />} />
          <Route path="categories" element={<Categories />} />
          <Route path="sla-policies" element={<SlaPolicies />} />
          <Route path="canned" element={<CannedResponsesAdmin />} />
          <Route path="team-members" element={<TeamMembers />} />
          <Route path="customers" element={<CustomersAdmin />} />
          <Route path="kb" element={<KbAdmin />} />
          <Route path="notifications-log" element={<NotificationsLog />} />
          <Route path="settings" element={<OrgSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <SearchPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      {me && <Tour role={me.role} />}
    </>
  );
}

export function RequireAuth({ children, role }: { children: React.ReactNode; role?: "customer" | "internal" }) {
  const me = useStore((s) => s.users.find((u) => u.id === s.currentUserId));
  if (!me) return <Navigate to="/" replace />;
  if (role === "customer" && me.role !== "customer") return <Navigate to="/app" replace />;
  if (role === "internal" && me.role === "customer") return <Navigate to="/portal" replace />;
  return <>{children}</>;
}
