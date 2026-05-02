import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import api from '../services/api.js';
import { apiErrorMessage } from '../utils/errors.js';
import { formatDate } from '../utils/format.js';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ search: '', action: '', page: 1 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(nextFilters = filters) {
    setLoading(true);
    try {
      const { data } = await api.get('/audit-logs', { params: nextFilters });
      setLogs(data.logs || []);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
      setError('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Audit logs could not be loaded.'));
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

  return (
    <div className="space-y-5">
      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      <div className="grid gap-3 sm:grid-cols-[1fr_240px]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Search audit logs" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} />
        </div>
        <input className="input" placeholder="Filter by action" value={filters.action} onChange={(event) => updateFilter('action', event.target.value)} />
      </div>
      <div className="panel overflow-hidden">
        <DataTable
          loading={loading}
          pagination={pagination}
          onPageChange={changePage}
          columns={[
            { key: 'action', label: 'Action' },
            { key: 'performedBy', label: 'Performed by', render: (row) => row.performedBy?.name || row.userId?.name || 'System' },
            { key: 'targetUser', label: 'Target user', render: (row) => row.targetUserId?.name || '-' },
            { key: 'department', label: 'Department', render: (row) => row.departmentId?.name || '-' },
            { key: 'item', label: 'Item', render: (row) => row.targetItemId?.name || row.itemId?.name || '-' },
            { key: 'request', label: 'Request', render: (row) => row.targetRequestId?._id?.slice(-6) || row.requestId?._id?.slice(-6) || '-' },
            { key: 'timestamp', label: 'Time', render: (row) => formatDate(row.timestamp) }
          ]}
          rows={logs}
          empty="No audit logs match these filters"
        />
      </div>
    </div>
  );
}
