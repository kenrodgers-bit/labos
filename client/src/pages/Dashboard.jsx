import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  Boxes,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileText,
  FlaskConical,
  Hourglass,
  PackageX,
  ScrollText,
  ShieldCheck,
  Users
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate } from '../utils/format.js';

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #dbe5f0',
  borderRadius: 16,
  boxShadow: '0 18px 42px rgba(15, 23, 42, 0.12)'
};

const kpiMeta = {
  itemCount: { label: 'Total commodities', icon: FlaskConical, iconWrap: 'bg-indigo-50 text-indigo-600' },
  lowStock: { label: 'Low stock alerts', icon: AlertTriangle, iconWrap: 'bg-rose-50 text-rose-600' },
  pending: { label: 'Pending requests', icon: ClipboardList, iconWrap: 'bg-amber-50 text-amber-600' },
  activeStaff: { label: 'Total staff', icon: Users, iconWrap: 'bg-teal-50 text-teal-600' },
  totalUsers: { label: 'Total accounts', icon: ShieldCheck, iconWrap: 'bg-blue-50 text-blue-600' },
  stockTotal: { label: 'Total stock units', icon: Boxes, iconWrap: 'bg-sky-50 text-sky-600' },
  expired: { label: 'Expired items', icon: PackageX, iconWrap: 'bg-fuchsia-50 text-fuchsia-600' },
  outOfStock: { label: 'Stock outs', icon: BellRing, iconWrap: 'bg-slate-100 text-slate-700' },
  pendingApprovals: { label: 'Pending approvals', icon: Hourglass, iconWrap: 'bg-amber-50 text-amber-600' },
  recentDecisions: { label: 'Recent decisions', icon: ClipboardCheck, iconWrap: 'bg-emerald-50 text-emerald-600' },
  stockMovements: { label: 'Stock movements', icon: Boxes, iconWrap: 'bg-sky-50 text-sky-600' },
  myRequests: { label: 'My requests', icon: ClipboardList, iconWrap: 'bg-blue-50 text-blue-600' },
  pendingRequests: { label: 'Pending', icon: Hourglass, iconWrap: 'bg-amber-50 text-amber-600' },
  approvedRequests: { label: 'Approved', icon: ShieldCheck, iconWrap: 'bg-emerald-50 text-emerald-600' },
  rejectedRequests: { label: 'Rejected', icon: PackageX, iconWrap: 'bg-rose-50 text-rose-600' },
  partialRequests: { label: 'Partial releases', icon: Clock3, iconWrap: 'bg-violet-50 text-violet-600' }
};

const kpiOrder = [
  'itemCount',
  'lowStock',
  'pending',
  'activeStaff',
  'totalUsers',
  'stockTotal',
  'outOfStock',
  'expired',
  'myRequests',
  'pendingRequests',
  'approvedRequests',
  'partialRequests',
  'rejectedRequests',
  'pendingApprovals',
  'recentDecisions',
  'stockMovements'
];

const chartColors = ['#0f766e', '#2563eb', '#f59e0b', '#e11d48', '#7c3aed'];

const roleQuickActions = {
  admin: [
    { label: 'Add commodity', hint: 'Create or restock a lab item.', target: 'inventory', icon: FlaskConical, iconWrap: 'bg-indigo-50 text-indigo-600' },
    { label: 'Add staff', hint: 'Create or maintain user accounts.', target: 'users', icon: Users, iconWrap: 'bg-teal-50 text-teal-600' },
    { label: 'Review requests', hint: 'Approve, partially release, or reject.', target: 'approvals', icon: ClipboardCheck, iconWrap: 'bg-amber-50 text-amber-600' },
    { label: 'View reports', hint: 'Open exports and filing reports.', target: 'reports', icon: FileText, iconWrap: 'bg-blue-50 text-blue-600' },
    { label: 'Open audit logs', hint: 'Trace system actions and stock events.', target: 'audit', icon: ScrollText, iconWrap: 'bg-slate-100 text-slate-700' }
  ],
  staff: [
    { label: 'Request commodity', hint: 'Submit a new laboratory request.', target: 'requests', icon: ClipboardCheck, iconWrap: 'bg-amber-50 text-amber-600' },
    { label: 'View inventory', hint: 'Check stock availability by item.', target: 'inventory', icon: Boxes, iconWrap: 'bg-blue-50 text-blue-600' },
    { label: 'Track my requests', hint: 'Review pending and released items.', target: 'requests', icon: ClipboardList, iconWrap: 'bg-teal-50 text-teal-600' },
    { label: 'Update settings', hint: 'Change your name or password.', target: 'settings', icon: ShieldCheck, iconWrap: 'bg-indigo-50 text-indigo-600' }
  ]
};

function toDateValue(value) {
  return value ? new Date(value).getTime() : 0;
}

function getRequestNotification(request, role) {
  if (role === 'admin') {
    return {
      id: `request-${request._id}`,
      type: request.status,
      title: `New request from ${request.requestedBy?.name || 'Staff'}: ${request.itemId?.name || 'Laboratory item'} (Qty: ${request.requestedQuantity})`,
      detail: request.departmentId?.name || 'Department not assigned',
      timestamp: request.createdAt
    };
  }

  const statusCopy = {
    pending: 'Your request is pending review.',
    approved: `Approved at ${request.approvedQuantity || request.requestedQuantity || 0} ${request.itemId?.unit || 'units'}.`,
    rejected: request.adjustmentReason || 'Request was rejected by Admin.',
    partially_approved: request.adjustmentReason || `Partial release approved at ${request.approvedQuantity || 0} ${request.itemId?.unit || 'units'}.`
  };

  return {
    id: `request-${request._id}`,
    type: request.status,
    title: `${request.itemId?.name || 'Laboratory item'} request`,
    detail: statusCopy[request.status] || 'Request updated.',
    timestamp: request.updatedAt || request.createdAt
  };
}

function getAlertNotification(alert) {
  return {
    id: alert.request?._id ? `request-${alert.request._id}` : `alert-${alert.type}-${alert.item?._id || alert.reminder?._id || alert.message}`,
    type: alert.type,
    title: alert.message,
    detail: alert.request?.departmentId?.name || alert.reminder?.departmentId?.name || alert.item?.departmentId?.name || 'Laboratory inventory',
    timestamp: alert.request?.createdAt || alert.reminder?.createdAt || alert.item?.updatedAt
  };
}

function getAuditNotification(audit) {
  return {
    id: `audit-${audit._id}`,
    type: 'audit',
    title: audit.action,
    detail: audit.performedBy?.name || audit.userId?.name || 'System action',
    timestamp: audit.timestamp
  };
}

function buildNotifications(data, user) {
  const role = user?.role || data?.role;
  const notifications = [
    ...(data.recentRequests || []).map((request) => getRequestNotification(request, role)),
    ...(data.alerts || []).map(getAlertNotification),
    ...(role === 'admin' ? (data.recentAudits || []).map(getAuditNotification) : [])
  ];

  const deduped = notifications.filter((item, index, list) => list.findIndex((entry) => entry.id === item.id) === index);
  return deduped.sort((a, b) => toDateValue(b.timestamp) - toDateValue(a.timestamp)).slice(0, 6);
} // LabOS fix: dashboard notifications now surface real requests, alerts, and audit activity in one live panel.

function getNotificationIcon(type) {
  if (['low_stock', 'out_of_stock', 'expired', 'expiry'].includes(type)) {
    return { icon: AlertTriangle, iconWrap: 'bg-rose-50 text-rose-600' };
  }
  if (['pending', 'approved', 'rejected', 'partially_approved'].includes(type)) {
    return { icon: ClipboardCheck, iconWrap: 'bg-amber-50 text-amber-600' };
  }
  if (type === 'audit') {
    return { icon: ScrollText, iconWrap: 'bg-slate-100 text-slate-700' };
  }
  if (type === 'stock_refill_reminder') {
    return { icon: BellRing, iconWrap: 'bg-blue-50 text-blue-600' };
  }
  return { icon: ShieldCheck, iconWrap: 'bg-teal-50 text-teal-600' };
}

function buildActivityRows(data, user) {
  if (user?.role === 'admin') {
    return (data.recentAudits || []).map((audit) => ({
      id: audit._id,
      title: audit.action,
      meta: audit.performedBy?.name || audit.userId?.name || 'System',
      detail: audit.details || audit.targetRequestId?.itemId?.name || audit.targetItemId?.name || 'Sensitive system activity',
      timestamp: audit.timestamp,
      status: 'audit'
    }));
  }

  return (data.recentRequests || []).map((request) => ({
    id: request._id,
    title: request.itemId?.name || 'Laboratory item',
    meta: request.departmentId?.name || 'Department not assigned',
    detail: request.adjustmentReason || request.notes || 'Request recorded successfully.',
    timestamp: request.updatedAt || request.createdAt,
    status: request.status
  }));
} // LabOS fix: the supporting activity panel stays role-aware without exposing admin-only oversight to Staff.

function StatCard({ label, value, Icon, iconWrap }) {
  return (
    <div className="rounded-[26px] border border-slate-200/90 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="max-w-[12rem] text-sm font-semibold leading-6 text-slate-700">{label}</p>
          <p className="mt-6 text-5xl font-black tracking-tight text-clinic-ink">{value ?? 0}</p>
        </div>
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${iconWrap}`}>
          <Icon size={30} strokeWidth={2.1} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ data, user, onNavigate }) {
  if (!data) return <LoadingSpinner label="Loading dashboard" />;

  const kpis = kpiOrder
    .map((key) => [key, data.kpis?.[key]])
    .filter(([, value]) => value !== undefined);
  const statusRows = Object.entries(data.statusCounts || {}).map(([name, value]) => ({ name, value }));
  const notifications = buildNotifications(data, user);
  const activityRows = buildActivityRows(data, user).slice(0, 5);
  const quickActions = roleQuickActions[user?.role || 'staff'] || [];
  const summaryCards = user?.role === 'admin'
    ? [
        { label: 'Open alerts', value: data.alerts?.length || 0 },
        { label: 'Pending requests', value: data.kpis?.pending || 0 },
        { label: 'Low stock items', value: data.kpis?.lowStock || 0 }
      ]
    : [
        { label: 'Pending requests', value: data.kpis?.pendingRequests || 0 },
        { label: 'Approved requests', value: data.kpis?.approvedRequests || 0 },
        { label: 'Partial releases', value: data.kpis?.partialRequests || 0 }
      ];
  const activityTitle = user?.role === 'admin' ? 'Recent oversight activity' : 'My latest request updates';

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        {kpis.map(([key, value]) => {
          const meta = kpiMeta[key] || { label: key, icon: ClipboardList, iconWrap: 'bg-slate-100 text-slate-700' };
          return <StatCard key={key} label={meta.label} value={value} Icon={meta.icon} iconWrap={meta.iconWrap} />;
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_360px]">
        <div className="rounded-[30px] border border-slate-200/90 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-teal-700">Live Operations</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-clinic-ink sm:text-[2.5rem]">Recent notifications</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Real-time laboratory request activity, stock signals, and system oversight presented in one calm operational view.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Active queue</p>
              <p className="mt-3 text-3xl font-black text-clinic-ink">{notifications.length}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {notifications.length === 0 && (
              <EmptyState
                title="No notifications yet"
                message="Requests, stock alerts, and oversight actions will appear here as the system becomes active."
              />
            )}

            {notifications.map((item) => {
              const { icon: Icon, iconWrap } = getNotificationIcon(item.type);
              return (
                <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 px-5 py-4 shadow-[0_12px_30px_rgba(148,163,184,0.12)]">
                  <div className="flex gap-4">
                    <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconWrap}`}>
                      <Icon size={22} strokeWidth={2.1} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold leading-7 text-clinic-ink">{item.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span>{item.detail}</span>
                        <span className="hidden text-slate-300 sm:inline">•</span>
                        <span>{item.timestamp ? formatDate(item.timestamp) : 'Awaiting timestamp'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200/90 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-clinic-ink">Quick actions</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Move directly into the next task that keeps the laboratory running smoothly.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => onNavigate?.(action.target)}
                  className="flex w-full items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50/40"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.iconWrap}`}>
                      <Icon size={22} strokeWidth={2.1} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-clinic-ink">{action.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{action.hint}</p>
                    </div>
                  </div>
                  <ArrowRight className="shrink-0 text-slate-400" size={18} />
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#effcf9_0%,#f8fbff_100%)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">Today&apos;s focus</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {summaryCards.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-clinic-ink">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="grid gap-6">
          <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-[0_20px_52px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Inventory map</p>
                <h2 className="mt-2 text-2xl font-black text-clinic-ink">Stock by department</h2>
              </div>
              <div className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {data.stockByDepartment?.length || 0} active areas
              </div>
            </div>
            <div className="mt-5 h-80">
              {(data.stockByDepartment || []).length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.stockByDepartment} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(20, 184, 166, 0.08)' }} contentStyle={tooltipStyle} />
                    <Bar dataKey="quantity" fill="#0f766e" radius={[12, 12, 4, 4]} isAnimationActive={false} /> {/* LabOS fix: disable chart animation so dashboard visuals render consistently on first load and in browser captures. */}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No stock data" message="Inventory quantities will be visualized here once commodities are entered." />
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-[0_20px_52px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Usage trends</p>
                <h2 className="mt-2 text-2xl font-black text-clinic-ink">Most requested commodities</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {(data.frequentlyRequestedItems || []).length === 0 && (
                <EmptyState title="No request trends yet" message="The most requested commodities will appear here after requests are submitted." />
              )}
              {(data.frequentlyRequestedItems || []).slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-sm font-black text-teal-700">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-clinic-ink">{item.name}</p>
                      <p className="text-sm text-slate-500">Repeated laboratory demand</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-700 shadow-sm">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-[0_20px_52px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Request mix</p>
                <h2 className="mt-2 text-2xl font-black text-clinic-ink">{user?.role === 'admin' ? 'Request decisions' : 'My request outcomes'}</h2>
              </div>
            </div>
            <div className="mt-5 h-72">
              {statusRows.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusRows} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3} isAnimationActive={false}>
                      {statusRows.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No request decisions" message="Request outcomes will appear here when the workflow becomes active." />
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 shadow-[0_20px_52px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Activity feed</p>
                <h2 className="mt-2 text-2xl font-black text-clinic-ink">{activityTitle}</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {activityRows.length === 0 && (
                <EmptyState
                  title="No recent activity"
                  message={user?.role === 'admin' ? 'Approval and audit activity will appear here.' : 'Your latest request updates will appear here.'}
                />
              )}

              {activityRows.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-clinic-ink">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{formatDate(item.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
