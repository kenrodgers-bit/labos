import { useAuth } from '../context/AuthContext.jsx';
import { roleLabel } from '../utils/format.js';

export default function Settings() {
  const { user } = useAuth();
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="panel p-5">
        <h2 className="text-lg font-black text-clinic-ink">Profile</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Name</dt><dd>{user.name}</dd></div>
          <div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Email</dt><dd>{user.email}</dd></div>
          <div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Role</dt><dd>{roleLabel(user.role)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="font-bold text-slate-500">Department</dt><dd>{user.departmentId?.name || 'Central Store'}</dd></div>
        </dl>
      </section>
      <section className="panel p-5">
        <h2 className="text-lg font-black text-clinic-ink">Deployment readiness</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>API accepts LAN connections on `0.0.0.0` and the Vite dev server is host-enabled.</p>
          <p>Use MongoDB Atlas for cloud demos or local MongoDB for offline hospital LAN demonstrations.</p>
          <p>PWA install support is enabled for phone and desktop access.</p>
        </div>
      </section>
    </div>
  );
}
