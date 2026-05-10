import { useEffect, useMemo, useState } from 'react';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleBasedRoute from './components/RoleBasedRoute.jsx';
import { ToastProvider } from './components/ToastProvider.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import api from './services/api.js';
import Approvals from './pages/Approvals.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Departments from './pages/Departments.jsx';
import Inventory from './pages/Inventory.jsx';
import LabReports from './pages/LabReports.jsx';
import Login from './pages/Login.jsx';
import Reports from './pages/Reports.jsx';
import Requests from './pages/Requests.jsx';
import Settings from './pages/Settings.jsx';
import Users from './pages/Users.jsx';

function Shell() {
  const { isAuthenticated, user } = useAuth();
  const [active, setActive] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);

  async function loadDashboard() {
    if (!isAuthenticated) return;
    const { data } = await api.get('/dashboard');
    setDashboard(data);
  }

  useEffect(() => { loadDashboard().catch(() => {}); }, [isAuthenticated, active]);

  const page = useMemo(() => {
    if (active === 'inventory') return <Inventory user={user} />;
    if (active === 'lab-reports') return <LabReports user={user} />;
    if (active === 'requests') return <Requests user={user} />;
    if (active === 'approvals') return <RoleBasedRoute roles={['admin']}><Approvals /></RoleBasedRoute>;
    if (active === 'reports') return <RoleBasedRoute roles={['admin']}><Reports /></RoleBasedRoute>;
    if (active === 'audit') return <RoleBasedRoute roles={['admin']}><AuditLogs /></RoleBasedRoute>; // LabOS fix: privileged pages are Admin-only in the client router.
    if (active === 'departments') return <RoleBasedRoute roles={['admin']}><Departments /></RoleBasedRoute>;
    if (active === 'users') return <RoleBasedRoute roles={['admin']}><Users /></RoleBasedRoute>;
    if (active === 'settings') return <Settings />;
    return <Dashboard data={dashboard} user={user} onNavigate={setActive} onRefresh={loadDashboard} />; // LabOS fix: dashboard quick actions now use the real app router instead of static UI.
  }, [active, dashboard, user]);

  return (
    <ProtectedRoute>
      <Layout active={active} setActive={setActive} alerts={dashboard?.alerts?.length || 0}>{page}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ToastProvider>
  );
}
