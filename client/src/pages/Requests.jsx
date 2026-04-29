import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import api from '../services/api.js';
import { apiErrorMessage } from '../utils/errors.js';
import { formatDate, statusTone } from '../utils/format.js';

export default function Requests({ user }) {
  const [requests, setRequests] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [reqRes, itemRes] = await Promise.all([api.get('/requests', { params: { mine: user.role === 'lab_staff' } }), api.get('/inventory')]);
      setRequests(reqRes.data);
      setItems(itemRes.data.items || []);
      setError('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Requests could not be loaded.'));
    }
  }
  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/requests', Object.fromEntries(new FormData(event.currentTarget)));
      setOpen(false);
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Request could not be submitted.'));
    }
  }

  return (
    <div className="space-y-5">
      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      <div className="flex justify-end"><button className="btn-primary" onClick={() => setOpen(true)}><Plus size={18} /> New request</button></div>
      <div className="panel overflow-hidden">
        <DataTable columns={[
          { key: 'item', label: 'Item', render: (row) => row.itemId?.name },
          { key: 'requestedQuantity', label: 'Requested' },
          { key: 'approvedQuantity', label: 'Approved' },
          { key: 'department', label: 'Department', render: (row) => row.departmentId?.name },
          { key: 'urgency', label: 'Urgency', render: (row) => <span className={`badge ${statusTone(row.urgency)}`}>{row.urgency}</span> },
          { key: 'status', label: 'Status', render: (row) => <span className={`badge ${statusTone(row.status)}`}>{row.status.replace('_', ' ')}</span> },
          { key: 'reason', label: 'Adjustment', render: (row) => row.adjustmentReason || '-' },
          { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) }
        ]} rows={requests} />
      </div>
      {open && (
        <Modal title="Request commodity" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Item
              <select className="input mt-1" name="itemId" required>{items.map((item) => <option key={item._id} value={item._id}>{item.name} | {item.quantity} {item.unit}</option>)}</select>
            </label>
            <label className="block text-sm font-bold text-slate-700">Quantity<input className="input mt-1" type="number" min="1" name="requestedQuantity" required /></label>
            <label className="block text-sm font-bold text-slate-700">Urgency<select className="input mt-1" name="urgency"><option value="routine">Routine</option><option value="urgent">Urgent</option><option value="critical">Critical</option></select></label>
            <label className="block text-sm font-bold text-slate-700">Notes<textarea className="input mt-1" name="notes" rows="3" /></label>
            <div className="flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary">Submit request</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
