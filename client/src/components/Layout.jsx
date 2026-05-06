import { motion } from 'framer-motion';
import { Bell, Boxes, Building2, ClipboardCheck, FileText, LayoutDashboard, LogOut, Menu, ScrollText, Settings, Shield, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { roleLabel } from '../utils/format.js';
import LabOSAssist from './LabOSAssist.jsx';

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'requests', label: 'Requests', icon: ClipboardCheck },
  { id: 'approvals', label: 'Approvals', icon: Shield, roles: ['admin'] },
  { id: 'reports', label: 'Reports', icon: FileText, roles: ['admin'] },
  { id: 'audit', label: 'Audit Logs', icon: ScrollText, roles: ['admin'] },
  // LabOS fix: Staff navigation excludes approvals, reports, audit logs, departments, and account management.
  { id: 'departments', label: 'Departments', icon: Building2, roles: ['admin'] },
  { id: 'users', label: 'Staff', icon: Users, roles: ['admin'] },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function Layout({ active, setActive, alerts, children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const visibleNav = nav.filter((item) => !item.roles || item.roles.includes(user.role));

  const Sidebar = () => (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-5">
        <img src="/labos-mark.png" alt="LabOS mark" className="h-11 w-11 rounded-xl object-cover shadow-sm" />
        {/* LabOS fix: replace the placeholder sidebar badge with the supplied LabOS brand mark. */}
        <div>
          <p className="text-xl font-black tracking-tight text-clinic-ink">LabOS</p>
          <p className="text-xs font-semibold text-slate-500">Laboratory inventory</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActive(item.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${selected ? 'bg-teal-50 text-clinic-teal' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <p className="text-sm font-bold text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-500">{roleLabel(user.role)} | {user.role === 'admin' ? '-' : user.departmentId?.name || 'Unassigned'}</p>
        {/* LabOS fix: admin accounts show no department in the shell. */}
        <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <div className="hidden lg:block"><Sidebar /></div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} aria-label="Close menu" />
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} className="relative h-full"><Sidebar /></motion.div>
        </div>
      )}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu"><Menu /></button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Kenyan hospital laboratory</p>
              <h1 className="text-lg font-black text-clinic-ink sm:text-2xl">{nav.find((item) => item.id === active)?.label || 'Dashboard'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative rounded-lg bg-slate-100 p-2 text-slate-600">
              <Bell size={18} />
              {alerts > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{alerts}</span>}
            </div>
          </div>
        </header>
        <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="p-4 lg:p-8">
          {children}
        </motion.div>
      </main>
      <LabOSAssist />
    </div>
  );
}
