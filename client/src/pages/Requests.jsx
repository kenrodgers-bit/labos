import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import api from '../services/api.js';
import { apiErrorMessage } from '../utils/errors.js';
import { formatDate } from '../utils/format.js';
import { isStaffRole } from '../utils/roles.js';

export default function Requests({ user }) {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isStaff = isStaffRole(user.role); // LabOS fix: only Staff can submit requests.

  async function load() {
    setLoading(true);
    try {
      const [reqRes, itemRes] = await Promise.all([api.get('/requests', { params: { mine: isStaff } }), api.get('/inventory', { params: { status: 'active', limit: 100 } })]);
      setRequests(reqRes.data);
      setItems(itemRes.data.items || []);
      setError('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Requests could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/requests', Object.fromEntries(new FormData(event.currentTarget)));
      setOpen(false);
      toast?.pushToast('Request submitted.');
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Request could not be submitted.'));
    }
  }

  return (
    <div className="space-y-5">
      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      {isStaff && <div className="flex justify-end"><button className="btn-primary" onClick={() => setOpen(true)}><Plus size={18} /> New request</button></div>}
      {/* LabOS fix: Admin can oversee requests here but cannot submit a personal inventory request. */}
      <div className="panel overflow-hidden">
        <DataTable columns={[
          { key: 'item', label: 'Item', render: (row) => row.itemId?.name },
          { key: 'requestedQuantity', label: 'Requested' },
          { key: 'approvedQuantity', label: 'Approved' },
          { key: 'department', label: 'Department', render: (row) => row.departmentId?.name },
          { key: 'urgency', label: 'Urgency', render: (row) => <StatusBadge value={row.urgency} /> },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          { key: 'reason', label: 'Adjustment', render: (row) => row.adjustmentReason || '-' },
          { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) }
        ]} rows={requests} loading={loading} empty="No requests found" />
      </div>
      {open && (
        <Modal title="Request commodity" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Item
              <select className="input mt-1" name="itemId" required>{items.map((item) => <option key={item._id} value={item._id}>{item.name} | {item.quantity} {item.unit}</option>)}</select>
            </label>
            <label className="block text-sm font-bold text-slate-700">Quantity<input className="input mt-1" type="number" min="1" name="requestedQuantity" required /></label>
            <label className="block text-sm font-bold text-slate-700">Urgency<select className="input mt-1" name="urgency"><option value="routine">Routine</option><option value="urgent">Urgent</option><option value="critical">Critical</option></select></label>
            <label className="block text-sm font-bold text-slate-700">Justification<textarea className="input mt-1" name="notes" rows="3" /></label>
            <div className="flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary">Submit request</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
