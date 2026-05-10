import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const colors = ['#2563eb', '#0f766e', '#7c3aed', '#dc2626', '#0891b2', '#9333ea', '#059669', '#f59e0b', '#0f172a'];

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #dbe5f0',
  borderRadius: 12,
  boxShadow: '0 16px 36px rgba(15, 23, 42, 0.12)'
};

export default function MohAnalytics({ analytics, categoryTotals }) {
  const workload = analytics?.trends || [];
  const stats = categoryTotals?.length ? categoryTotals : analytics?.categoryStats || [];

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-clinic-ink dark:text-white">Positive cases trend</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monthly positives, abnormal results, and resistance signals.</p>
          </div>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={workload}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="positives" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="resistant" stroke="#dc2626" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-black text-clinic-ink dark:text-white">Monthly lab workload</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tests and specimens processed per reporting month.</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workload}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="workload" fill="#0f766e" radius={[10, 10, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900 xl:col-span-2">
        <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <h3 className="text-lg font-black text-clinic-ink dark:text-white">Test category statistics</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">MOH 706/705 categories remain intact while totals are calculated digitally.</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {stats.slice(0, 6).map((item, index) => (
                <div key={item.key || item.name} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.title || item.name}</p>
                  <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{item.workload || 0} tests</p>
                  <span className="mt-1 block h-1.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                </div>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats} dataKey="workload" nameKey="title" innerRadius={72} outerRadius={118} paddingAngle={2}>
                  {stats.map((entry, index) => <Cell key={entry.key || entry.name} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
