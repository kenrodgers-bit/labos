import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal.jsx';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import api from '../services/api.js';
import { apiErrorMessage } from '../utils/errors.js';
import { formatDate } from '../utils/format.js';

const emptyItem = { name: '', category: '', unit: '', quantity: 0, minThreshold: 0, expiryDate: '', supplier: '', location: '', departmentId: '', status: 'active' };

export default function Inventory({ user }) {
  const toast = useToast();
  const [data, setData] = useState({ items: [], categories: [], page: 1, pages: 1, total: 0 });
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', departmentId: '', status: 'active', stockStatus: '', page: 1 });
  const [editing, setEditing] = useState(null);
  const [deactivating, setDeactivating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(nextFilters = filters) {
    setLoading(true);
    try {
      const [itemsRes, deptRes] = await Promise.all([api.get('/inventory', { params: nextFilters }), api.get('/departments')]);
      setData(itemsRes.data);
      setDepartments(deptRes.data);
      setError('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Inventory could not be loaded.'));
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

  function changePage(page) {
    const next = { ...filters, page };
    setFilters(next);
    load(next);
  }

  async function save(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    if (!payload.departmentId) delete payload.departmentId;
    try {
      if (editing?._id) await api.put(`/inventory/${editing._id}`, payload);
      else await api.post('/inventory', payload);
      setEditing(null);
      toast?.pushToast(editing?._id ? 'Inventory item updated.' : 'Inventory item added.');
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Inventory item could not be saved.'));
    }
  }

  async function deactivateItem() {
    try {
      await api.delete(`/inventory/${deactivating._id}`);
      setDeactivating(null);
      toast?.pushToast('Inventory item deactivated.');
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Inventory item could not be deactivated.'));
    }
  }

  const canEdit = user.role === 'admin';
  const pagination = { page: data.page, pages: data.pages, total: data.total };
  return (
    <div className="space-y-5">
      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      <div className="grid gap-3 xl:grid-cols-[1fr_160px_190px_170px_170px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Search item, supplier, location" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} />
        </div>
        <select className="input" value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
          <option value="">All categories</option>
          {(data.categories || []).map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <select className="input" value={filters.departmentId} onChange={(event) => updateFilter('departmentId', event.target.value)}>
          <option value="">All departments</option>
          {departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}
        </select>
        <select className="input" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="input" value={filters.stockStatus} onChange={(event) => updateFilter('stockStatus', event.target.value)}>
          <option value="">All stock states</option>
          <option value="available">Available</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
          <option value="expired">Expired</option>
        </select>
        {canEdit && <button className="btn-primary" onClick={() => setEditing(emptyItem)}><Plus size={18} /> Add item</button>}
      </div>
      <div className="panel overflow-hidden">
        <DataTable
          loading={loading}
          pagination={pagination}
          onPageChange={changePage}
          columns={[
            { key: 'name', label: 'Item' },
            { key: 'category', label: 'Category' },
            { key: 'quantity', label: 'Qty', render: (row) => <span className={row.quantity <= row.minThreshold ? 'font-black text-rose-600' : 'font-bold text-slate-800'}>{row.quantity} {row.unit}</span> },
            { key: 'stockStatus', label: 'Stock status', render: (row) => <StatusBadge value={row.stockStatus} /> },
            { key: 'expiryDate', label: 'Expiry', render: (row) => formatDate(row.expiryDate) },
            { key: 'department', label: 'Department', render: (row) => row.departmentId?.name || 'Central Store' },
            { key: 'supplier', label: 'Supplier' },
            { key: 'location', label: 'Location' },
            { key: 'actions', label: '', render: (row) => canEdit && (
              <div className="flex gap-2">
                <button className="btn-secondary !p-2" onClick={() => setEditing({ ...row, expiryDate: row.expiryDate?.slice(0, 10), departmentId: row.departmentId?._id || '' })}><Edit size={15} /></button>
                {row.status !== 'inactive' && <button className="btn-secondary !p-2 text-rose-600" onClick={() => setDeactivating(row)}><Trash2 size={15} /></button>}
              </div>
            ) }
          ]}
          rows={data.items || []}
          empty="No inventory items match these filters"
        />
      </div>
      {editing && (
        <Modal title={editing._id ? 'Edit inventory item' : 'Add inventory item'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            {['name', 'category', 'unit', 'quantity', 'minThreshold', 'expiryDate', 'supplier', 'location'].map((field) => (
              <label key={field} className="text-sm font-bold text-slate-700">{field}
                <input className="input mt-1" name={field} type={field.includes('Date') ? 'date' : ['quantity', 'minThreshold'].includes(field) ? 'number' : 'text'} min={['quantity', 'minThreshold'].includes(field) ? 0 : undefined} defaultValue={editing[field] || ''} required={['name', 'category', 'unit', 'expiryDate'].includes(field)} />
              </label>
            ))}
            <label className="text-sm font-bold text-slate-700">Status
              <select className="input mt-1" name="status" defaultValue={editing.status || 'active'}><option value="active">Active</option><option value="inactive">Inactive</option></select>
            </label>
            <label className="text-sm font-bold text-slate-700">Department
              <select className="input mt-1" name="departmentId" defaultValue={editing.departmentId || ''}>
                <option value="">Central Store</option>
                {departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary">Save item</button></div>
          </form>
        </Modal>
      )}
      {deactivating && (
        <ConfirmModal
          title="Deactivate inventory item"
          message={`Deactivate ${deactivating.name}? It will remain in reports and audit logs but will no longer be available for requests.`}
          confirmLabel="Deactivate"
          onCancel={() => setDeactivating(null)}
          onConfirm={deactivateItem}
        />
      )}
    </div>
  );
}
