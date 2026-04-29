import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import api from '../services/api.js';
import { roleLabel, statusTone } from '../utils/format.js';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(null);
  async function load() {
    const [usersRes, deptRes] = await Promise.all([api.get('/users'), api.get('/departments')]);
    setUsers(usersRes.data);
    setDepartments(deptRes.data);
  }
  useEffect(() => { load(); }, []);
  async function save(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    if (!payload.password) delete payload.password;
    if (editing?._id) await api.put(`/users/${editing._id}`, payload);
    else await api.post('/users', payload);
    setEditing(null);
    load();
  }
  return (
    <div className="space-y-5">
      <div className="flex justify-end"><button className="btn-primary" onClick={() => setEditing({ role: 'lab_staff', status: 'active' })}><Plus size={18} /> Staff account</button></div>
      <div className="panel overflow-hidden">
        <DataTable columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: (row) => roleLabel(row.role) },
          { key: 'department', label: 'Department', render: (row) => row.departmentId?.name || '-' },
          { key: 'status', label: 'Status', render: (row) => <span className={`badge ${statusTone(row.status)}`}>{row.status}</span> },
          { key: 'actions', label: '', render: (row) => <button className="btn-secondary" onClick={() => setEditing({ ...row, departmentId: row.departmentId?._id || '' })}>Edit</button> }
        ]} rows={users} />
      </div>
      {editing && (
        <Modal title={editing._id ? 'Edit staff account' : 'Create staff account'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Name<input className="input mt-1" name="name" defaultValue={editing.name || ''} required /></label>
            <label className="text-sm font-bold text-slate-700">Email<input className="input mt-1" name="email" type="email" defaultValue={editing.email || ''} required /></label>
            <label className="text-sm font-bold text-slate-700">Role<select className="input mt-1" name="role" defaultValue={editing.role}><option value="admin">Admin</option><option value="commodity_manager">Commodity Manager</option><option value="lab_staff">Lab Staff</option></select></label>
            <label className="text-sm font-bold text-slate-700">Department<select className="input mt-1" name="departmentId" defaultValue={editing.departmentId || ''}>{departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-700">Status<select className="input mt-1" name="status" defaultValue={editing.status || 'active'}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
            <label className="text-sm font-bold text-slate-700">Password<input className="input mt-1" name="password" type="password" placeholder={editing._id ? 'Leave blank to keep' : 'Minimum 8 characters'} required={!editing._id} /></label>
            <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary">Save account</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
