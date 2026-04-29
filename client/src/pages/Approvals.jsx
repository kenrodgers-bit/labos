import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import api from '../services/api.js';
import { apiErrorMessage } from '../utils/errors.js';
import { statusTone } from '../utils/format.js';

export default function Approvals() {
  const [requests, setRequests] = useState([]);
  const [decision, setDecision] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const { data } = await api.get('/requests', { params: { status: 'pending' } });
      setRequests(data);
      setError('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Approvals could not be loaded.'));
    }
  }
  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.patch(`/requests/${decision._id}/decision`, Object.fromEntries(new FormData(event.currentTarget)));
      setDecision(null);
      load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Decision could not be saved.'));
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      <div className="panel overflow-hidden">
        <DataTable columns={[
          { key: 'item', label: 'Item', render: (row) => row.itemId?.name },
          { key: 'requestedBy', label: 'Requested by', render: (row) => row.requestedBy?.name },
          { key: 'department', label: 'Department', render: (row) => row.departmentId?.name },
          { key: 'requestedQuantity', label: 'Qty' },
          { key: 'urgency', label: 'Urgency', render: (row) => <span className={`badge ${statusTone(row.urgency)}`}>{row.urgency}</span> },
          { key: 'actions', label: 'Decision', render: (row) => <div className="flex gap-2"><button className="btn-primary !px-3" onClick={() => setDecision({ ...row, mode: 'approved' })}><Check size={16} /> Approve</button><button className="btn-secondary !px-3" onClick={() => setDecision({ ...row, mode: 'rejected' })}><X size={16} /> Decide</button></div> }
        ]} rows={requests} empty="No pending approvals" />
      </div>
      {decision && (
        <Modal title={`Decision: ${decision.itemId?.name}`} onClose={() => setDecision(null)}>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Decision
              <select className="input mt-1" name="decision" defaultValue={decision.mode}>
                <option value="approved">Approve full quantity</option>
                <option value="partial">Approve partial quantity</option>
                <option value="rejected">Reject request</option>
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">Approved quantity
              <input className="input mt-1" name="approvedQuantity" type="number" min="1" max={decision.requestedQuantity} defaultValue={decision.requestedQuantity} />
            </label>
            <label className="block text-sm font-bold text-slate-700">Adjustment or rejection reason
              <textarea className="input mt-1" name="adjustmentReason" rows="3" placeholder="Required for partial approvals and rejections" />
            </label>
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Requested: <b>{decision.requestedQuantity}</b>. Stock reduces only after approval.</div>
            <div className="flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={() => setDecision(null)}>Cancel</button><button className="btn-primary">Save decision</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
