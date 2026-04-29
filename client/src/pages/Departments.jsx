import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import api from '../services/api.js';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(null);
  async function load() {
    const { data } = await api.get('/departments');
    setDepartments(data);
  }
  useEffect(() => { load(); }, []);
  async function save(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    if (editing?._id) await api.put(`/departments/${editing._id}`, payload);
    else await api.post('/departments', payload);
    setEditing(null);
    load();
  }
  return (
    <div className="space-y-5">
      <div className="flex justify-end"><button className="btn-primary" onClick={() => setEditing({})}><Plus size={18} /> Department</button></div>
      <div className="panel overflow-hidden">
        <DataTable columns={[
          { key: 'name', label: 'Department' },
          { key: 'description', label: 'Description' },
          { key: 'permissions', label: 'Permissions', render: (row) => row.permissions?.join(', ') || 'Role default' },
          { key: 'actions', label: '', render: (row) => <button className="btn-secondary" onClick={() => setEditing(row)}>Edit</button> }
        ]} rows={departments} />
      </div>
      {editing && (
        <Modal title={editing._id ? 'Edit department' : 'Create department'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Name<input className="input mt-1" name="name" defaultValue={editing.name || ''} required /></label>
            <label className="block text-sm font-bold text-slate-700">Description<textarea className="input mt-1" name="description" defaultValue={editing.description || ''} rows="3" /></label>
            <label className="block text-sm font-bold text-slate-700">Department permissions<textarea className="input mt-1" name="permissions" defaultValue={editing.permissions?.join(',') || ''} placeholder="inventory:read,requests:create" /></label>
            <div className="flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary">Save</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
