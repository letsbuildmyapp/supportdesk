import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ConfirmProvider } from '@/components/ConfirmModal';
import { Login } from '@/pages/Login';
import { Landing } from '@/pages/Landing';
import { AppLayout } from '@/components/AppLayout';
import { CustomerHome } from '@/pages/customer/CustomerHome';
import { CustomerNewTicket } from '@/pages/customer/CustomerNewTicket';
import { TicketDetail } from '@/pages/TicketDetail';
import { AgentQueue } from '@/pages/agent/AgentQueue';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminCategories } from '@/pages/admin/AdminCategories';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { NotFound } from '@/pages/NotFound';
import { ServerError } from '@/pages/ServerError';
import { Tutorial } from '@/components/Tutorial';
import { CommandPalette } from '@/components/CommandPalette';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'agent') return <Navigate to="/queue" replace />;
  return <Navigate to="/tickets" replace />;
}

function RequireAuth({ roles, children }: { roles?: ('customer' | 'agent' | 'admin')[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/error" element={<ServerError />} />
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/home" element={<HomeRedirect />} />
            <Route path="/tickets" element={<RequireAuth roles={['customer']}><CustomerHome /></RequireAuth>} />
            <Route path="/new" element={<RequireAuth roles={['customer']}><CustomerNewTicket /></RequireAuth>} />
            <Route path="/queue" element={<RequireAuth roles={['agent', 'admin']}><AgentQueue /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth roles={['admin']}><AdminDashboard /></RequireAuth>} />
            <Route path="/admin/categories" element={<RequireAuth roles={['admin']}><AdminCategories /></RequireAuth>} />
            <Route path="/admin/settings" element={<RequireAuth roles={['admin']}><AdminSettings /></RequireAuth>} />
            <Route path="/t/:id" element={<TicketDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Tutorial />
        <CommandPalette />
      </ConfirmProvider>
    </AuthProvider>
  );
}
