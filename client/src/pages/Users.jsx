import { KeyRound, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal.jsx';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import api from '../services/api.js';
import { apiErrorMessage } from '../utils/errors.js';
import { formatDate, roleLabel } from '../utils/format.js';

const emptyStaff = { role: 'staff', status: 'active', departmentId: '' }; // LabOS fix: new accounts default to the Staff role.

export default function Users() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filters, setFilters] = useState({ search: '', role: '', status: '', page: 1 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(nextFilters = filters) {
    setLoading(true);
    try {
      const [usersRes, deptRes] = await Promise.all([api.get('/users', { params: nextFilters }), api.get('/departments')]);
      setUsers(usersRes.data.users || []);
      setPagination({ page: usersRes.data.page, pages: usersRes.data.pages, total: usersRes.data.total });
      setDepartments(deptRes.data);
      setError('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Staff accounts could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function updateFilter(field, value) {
    const next = { ...filters, [field]: value, page: 1 };
    setFilters(next);
    load(next);
  }

  async function save(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    if (payload.role === 'admin') delete payload.departmentId; // LabOS fix: admin accounts never submit department assignments.
    if (!payload.departmentId) delete payload.departmentId;
    try {
      if (editing?._id) await api.put(`/users/${editing._id}`, payload);
      else await api.post('/users', payload);
      setEditing(null);
      toast?.pushToast(editing?._id ? 'Staff account updated.' : 'Staff account created.');
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Staff account could not be saved.'));
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    if (payload.password !== payload.confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }
    try {
      await api.patch(`/users/${resetting._id}/password`, { password: payload.password });
      setResetting(null);
      toast?.pushToast('Staff password reset.');
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Password could not be reset.'));
    }
  }

  async function deleteStaffAccount() {
    try {
      await api.delete(`/users/${deleting._id}`);
      setDeleting(null);
      toast?.pushToast('Staff account deleted.');
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Staff account could not be deleted.'));
    }
  } // LabOS fix: Admin delete action calls the protected staff-delete API.

  function changePage(page) {
    const next = { ...filters, page };
    setFilters(next);
    load(next);
  }

  function openEditor(row = emptyStaff) {
    const role = row.role === 'admin' ? 'admin' : 'staff';
    setEditing({ ...row, role, departmentId: role === 'admin' ? '' : row.departmentId?._id || row.departmentId || '' });
  } // LabOS fix: edit forms normalize admin departments away and keep Staff department ids editable.

  return (
    <div className="space-y-5">
      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Search staff by name or email" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} />
        </div>
        <select className="input" value={filters.role} onChange={(event) => updateFilter('role', event.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
        <select className="input" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="btn-primary" onClick={() => openEditor()}><Plus size={18} /> Staff account</button>
      </div>
      <div className="panel overflow-hidden">
        <DataTable
          loading={loading}
          pagination={pagination}
          onPageChange={changePage}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role', render: (row) => roleLabel(row.role) },
            { key: 'department', label: 'Department', render: (row) => row.role === 'admin' ? '-' : row.departmentId?.name || '-' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
            { key: 'actions', label: '', render: (row) => (
              <div className="flex gap-2">
                <button className="btn-secondary !py-1.5" onClick={() => openEditor(row)}>Edit</button>
                <button className="btn-secondary !py-1.5" onClick={() => setResetting(row)}><KeyRound size={15} /> Reset</button>
                {row.role === 'staff' && <button className="btn-secondary !py-1.5 text-rose-600" onClick={() => setDeleting(row)}><Trash2 size={15} /> Delete</button>}
                {/* LabOS fix: only Staff rows expose delete; Admin rows cannot be deleted here. */}
              </div>
            ) }
          ]}
          rows={users}
          empty="No staff accounts match these filters"
        />
      </div>
      {editing && (
        <Modal title={editing._id ? 'Edit staff account' : 'Create staff account'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Name<input className="input mt-1" name="name" defaultValue={editing.name || ''} required /></label>
            <label className="text-sm font-bold text-slate-700">Email<input className="input mt-1" name="email" type="email" defaultValue={editing.email || ''} required /></label>
            <label className="text-sm font-bold text-slate-700">Role<select className="input mt-1" name="role" value={editing.role} onChange={(event) => setEditing((current) => ({ ...current, role: event.target.value, departmentId: event.target.value === 'admin' ? '' : current.departmentId }))}><option value="admin">Admin</option><option value="staff">Staff</option></select></label>
            {editing.role !== 'admin' && <label className="text-sm font-bold text-slate-700">Department<select className="input mt-1" name="departmentId" value={editing.departmentId || ''} onChange={(event) => setEditing((current) => ({ ...current, departmentId: event.target.value }))}><option value="">Unassigned</option>{departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}</select></label>}
            {/* LabOS fix: department input is hidden whenever the selected role is Admin. */}
            <label className="text-sm font-bold text-slate-700">Status<select className="input mt-1" name="status" defaultValue={editing.status || 'active'}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
            {!editing._id && <label className="text-sm font-bold text-slate-700">Temporary password<input className="input mt-1" name="password" type="password" minLength={8} required /></label>}
            <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary">Save account</button></div>
          </form>
        </Modal>
      )}
      {resetting && (
        <Modal title={`Reset password: ${resetting.name}`} onClose={() => setResetting(null)}>
          <form onSubmit={resetPassword} className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">New temporary password<input className="input mt-1" name="password" type="password" minLength={8} required /></label>
            <label className="block text-sm font-bold text-slate-700">Confirm password<input className="input mt-1" name="confirmPassword" type="password" minLength={8} required /></label>
            <div className="flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={() => setResetting(null)}>Cancel</button><button className="btn-primary">Reset password</button></div>
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmModal
          title="Delete staff account"
          message={`Delete ${deleting.name}? The account will be removed from staff management and blocked from signing in, while historical requests and audit logs remain intact.`}
          confirmLabel="Delete account"
          onCancel={() => setDeleting(null)}
          onConfirm={deleteStaffAccount}
        />
      )}
    </div>
  );
}
