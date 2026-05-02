import { AlertTriangle, Boxes, ClipboardList, Clock3, Hourglass, PackageX, ShieldCheck, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate } from '../utils/format.js';

const kpiMeta = {
  totalUsers: ['Total users', Users],
  activeStaff: ['Active staff', ShieldCheck],
  stockTotal: ['Total stock', Boxes],
  itemCount: ['Inventory items', ClipboardList],
  lowStock: ['Low stock', AlertTriangle],
  expired: ['Expired', PackageX],
  outOfStock: ['Out of stock', PackageX],
  pending: ['Pending requests', Hourglass],
  pendingApprovals: ['Pending approvals', Hourglass],
  recentDecisions: ['Recent decisions', ShieldCheck],
  stockMovements: ['Stock movements', Boxes],
  myRequests: ['My requests', ClipboardList],
  pendingRequests: ['Pending', Hourglass],
  approvedRequests: ['Approved', ShieldCheck],
  rejectedRequests: ['Rejected', PackageX],
  partialRequests: ['Partial', Clock3]
};

export default function Dashboard({ data }) {
  if (!data) return <LoadingSpinner label="Loading dashboard" />;
  const statusRows = Object.entries(data.statusCounts || {}).map(([name, value]) => ({ name, value }));
  const kpis = Object.entries(data.kpis || {});
  const colors = ['#0f766e', '#2563eb', '#f59e0b', '#e11d48'];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map(([key, value]) => {
          const [label, Icon] = kpiMeta[key] || [key, ClipboardList];
          return (
            <div key={key} className="panel p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-500">{label}</p>
                <Icon className="text-teal-700" size={19} />
              </div>
              <p className="mt-3 text-3xl font-black text-clinic-ink">{value ?? 0}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="panel p-5">
          <h2 className="font-black text-clinic-ink">Stock by department</h2>
          <div className="mt-4 h-72">
            {(data.stockByDepartment || []).length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stockByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState title="No stock data" message="Inventory items will appear here once created." />}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-black text-clinic-ink">Request decisions</h2>
          <div className="mt-4 h-72">
            {statusRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusRows} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88}>
                    {statusRows.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState title="No request decisions" message="Request activity will appear after staff submit requests." />}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="panel p-5">
          <h2 className="font-black text-clinic-ink">Live alerts</h2>
          <div className="mt-4 grid gap-3">
            {(data.alerts || []).length === 0 && <EmptyState title="No active alerts" message="Stock and request alerts are clear." />}
            {(data.alerts || []).slice(0, 8).map((alert, index) => (
              <div key={index} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <StatusBadge value={alert.type} />
                <p className="mt-2 text-sm font-semibold text-slate-700">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-black text-clinic-ink">Recent activity</h2>
          <div className="mt-4 space-y-3">
            {(data.recentAudits || []).length === 0 && <EmptyState title="No audit activity" message="Sensitive actions will be listed here." />}
            {(data.recentAudits || []).map((audit) => (
              <div key={audit._id} className="rounded-lg border border-slate-100 bg-white p-3 text-sm">
                <p className="font-black text-slate-800">{audit.action}</p>
                <p className="mt-1 text-slate-500">{audit.performedBy?.name || audit.userId?.name || 'System'} | {formatDate(audit.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
