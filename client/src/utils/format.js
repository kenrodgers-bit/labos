export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function roleLabel(role) {
  return {
    admin: 'Admin',
    commodity_manager: 'Commodity Manager',
    lab_staff: 'Lab Staff'
  }[role] || role;
}

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
    expired: 'bg-rose-50 text-rose-700',
    critical: 'bg-rose-50 text-rose-700',
    urgent: 'bg-amber-50 text-amber-800',
    routine: 'bg-slate-100 text-slate-600'
  }[status] || 'bg-slate-100 text-slate-600';
}
