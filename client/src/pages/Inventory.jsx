import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import api from '../services/api.js';
import { apiErrorMessage } from '../utils/errors.js';
import { formatDate } from '../utils/format.js';

const emptyItem = { name: '', category: '', unit: '', quantity: 0, minThreshold: 0, expiryDate: '', supplier: '', location: '', departmentId: '' };

export default function Inventory({ user }) {
  const [data, setData] = useState({ items: [] });
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [itemsRes, deptRes] = await Promise.all([api.get('/inventory', { params: { search } }), api.get('/departments')]);
      setData(itemsRes.data);
      setDepartments(deptRes.data);
      setError('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Inventory could not be loaded.'));
    }
  }
  useEffect(() => { load(); }, []);

  async function save(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (editing?._id) await api.put(`/inventory/${editing._id}`, payload);
      else await api.post('/inventory', payload);
      setEditing(null);
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Inventory item could not be saved.'));
    }
  }

  async function remove(id) {
    if (confirm('Delete this inventory item?')) {
      try {
        await api.delete(`/inventory/${id}`);
        load();
      } catch (err) {
        setError(apiErrorMessage(err, 'Inventory item could not be deleted.'));
      }
    }
  }

  const canEdit = user.role === 'admin';
  return (
    <div className="space-y-5">
      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-lg flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Search item, supplier, location" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
        </div>
        {canEdit && <button className="btn-primary" onClick={() => setEditing(emptyItem)}><Plus size={18} /> Add item</button>}
      </div>
      <div className="panel overflow-hidden">
        <DataTable columns={[
          { key: 'name', label: 'Item' },
          { key: 'category', label: 'Category' },
          { key: 'quantity', label: 'Qty', render: (row) => <span className={row.quantity <= row.minThreshold ? 'font-black text-rose-600' : 'font-bold text-slate-800'}>{row.quantity} {row.unit}</span> },
          { key: 'minThreshold', label: 'Min' },
          { key: 'expiryDate', label: 'Expiry', render: (row) => formatDate(row.expiryDate) },
          { key: 'supplier', label: 'Supplier' },
          { key: 'location', label: 'Location' },
          { key: 'actions', label: '', render: (row) => canEdit && <div className="flex gap-2"><button className="btn-secondary !p-2" onClick={() => setEditing({ ...row, expiryDate: row.expiryDate?.slice(0, 10), departmentId: row.departmentId?._id || '' })}><Edit size={15} /></button><button className="btn-secondary !p-2 text-rose-600" onClick={() => remove(row._id)}><Trash2 size={15} /></button></div> }
        ]} rows={data.items || []} />
      </div>
      {editing && (
        <Modal title={editing._id ? 'Edit item' : 'Add inventory item'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            {['name', 'category', 'unit', 'quantity', 'minThreshold', 'expiryDate', 'supplier', 'location'].map((field) => (
              <label key={field} className="text-sm font-bold text-slate-700">{field}
                <input className="input mt-1" name={field} type={field.includes('Date') ? 'date' : ['quantity', 'minThreshold'].includes(field) ? 'number' : 'text'} defaultValue={editing[field] || ''} required={['name', 'category', 'unit', 'expiryDate'].includes(field)} />
              </label>
            ))}
            <label className="text-sm font-bold text-slate-700 sm:col-span-2">Department
              <select className="input mt-1" name="departmentId" defaultValue={editing.departmentId || ''}>
                <option value="">Central Store</option>
                {departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary">Save item</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
