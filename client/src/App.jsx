import { useEffect, useMemo, useState } from 'react';
import Layout from './components/Layout.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import api from './services/api.js';
import Approvals from './pages/Approvals.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Departments from './pages/Departments.jsx';
import Inventory from './pages/Inventory.jsx';
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
    if (active === 'requests') return <Requests user={user} />;
    if (active === 'approvals') return <Approvals />;
    if (active === 'reports') return <Reports />;
    if (active === 'audit') return <AuditLogs />;
    if (active === 'departments') return <Departments />;
    if (active === 'users') return <Users />;
    if (active === 'settings') return <Settings />;
    return <Dashboard data={dashboard} />;
  }, [active, dashboard, user]);

  if (!isAuthenticated) return <Login />;
  return <Layout active={active} setActive={setActive} alerts={dashboard?.alerts?.length || 0}>{page}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
