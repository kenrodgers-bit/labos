import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import api from '../services/api.js';
import { formatDate } from '../utils/format.js';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  async function load() {
    const { data } = await api.get('/audit-logs', { params: { search } });
    setLogs(data);
  }
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-5">
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        <input className="input pl-10" placeholder="Search audit logs" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
      </div>
      <div className="panel overflow-hidden">
        <DataTable columns={[
          { key: 'action', label: 'Action' },
          { key: 'user', label: 'User', render: (row) => row.userId?.name || '-' },
          { key: 'department', label: 'Department', render: (row) => row.departmentId?.name || '-' },
          { key: 'item', label: 'Item', render: (row) => row.itemId?.name || '-' },
          { key: 'request', label: 'Request', render: (row) => row.requestId?._id?.slice(-6) || '-' },
          { key: 'timestamp', label: 'Time', render: (row) => formatDate(row.timestamp) }
        ]} rows={logs} />
      </div>
    </div>
  );
}
