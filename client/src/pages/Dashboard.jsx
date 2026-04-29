import { AlertTriangle, Boxes, ClipboardList, Hourglass, PackageX } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { statusTone } from '../utils/format.js';

const kpiIcons = { stockTotal: Boxes, itemCount: ClipboardList, lowStock: AlertTriangle, expired: PackageX, pending: Hourglass };
const kpiLabels = { stockTotal: 'Total stock', itemCount: 'Commodities', lowStock: 'Low stock', expired: 'Expired', pending: 'Pending approvals' };

export default function Dashboard({ data }) {
  const kpis = data?.kpis || {};
  const statusRows = Object.entries(data?.statusCounts || {}).map(([name, value]) => ({ name, value }));
  const colors = ['#0f766e', '#2563eb', '#f59e0b', '#e11d48'];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(kpiLabels).map(([key, label]) => {
          const Icon = kpiIcons[key];
          return (
            <div key={key} className="panel p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-500">{label}</p>
                <Icon className="text-teal-700" size={19} />
              </div>
              <p className="mt-3 text-3xl font-black text-clinic-ink">{kpis[key] ?? 0}</p>
            </div>
          );
        })}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="panel p-5">
          <h2 className="font-black text-clinic-ink">Stock by department</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.stockByDepartment || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-black text-clinic-ink">Request decisions</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusRows} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88}>
                  {statusRows.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
      <section className="panel p-5">
        <h2 className="font-black text-clinic-ink">Live alerts</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(data?.alerts || []).slice(0, 8).map((alert, index) => (
            <div key={index} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className={`badge ${statusTone(alert.type === 'pending' ? 'pending' : alert.type === 'expired' ? 'rejected' : 'urgent')}`}>{alert.type.replace('_', ' ')}</span>
              <p className="mt-2 text-sm font-semibold text-slate-700">{alert.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
