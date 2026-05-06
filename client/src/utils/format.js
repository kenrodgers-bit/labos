export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function roleLabel(role) {
  return {
    admin: 'Admin',
    staff: 'Staff'
  }[role] || role;
} // LabOS fix: role labels expose only Admin and Staff.

export function statusTone(status) {
  return {
    approved: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-rose-50 text-rose-700',
    partially_approved: 'bg-amber-50 text-amber-800',
    pending: 'bg-blue-50 text-blue-700',
    active: 'bg-emerald-50 text-emerald-700',
    inactive: 'bg-slate-100 text-slate-600',
    available: 'bg-emerald-50 text-emerald-700',
    low_stock: 'bg-amber-50 text-amber-800',
    out_of_stock: 'bg-rose-50 text-rose-700',
    stock_refill_reminder: 'bg-blue-50 text-blue-700', // LabOS fix: Admin dashboard can badge Staff refill reminders.
    expired: 'bg-rose-50 text-rose-700',
    expiring_soon: 'bg-amber-50 text-amber-800', // LabOS fix: inventory can flag items expiring within 30 days.
    critical: 'bg-rose-50 text-rose-700',
    urgent: 'bg-amber-50 text-amber-800',
    routine: 'bg-slate-100 text-slate-600'
  }[status] || 'bg-slate-100 text-slate-600';
}
