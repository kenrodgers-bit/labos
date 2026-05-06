import { Printer, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import api from '../services/api.js';
import { apiErrorMessage } from '../utils/errors.js';
import { formatDate } from '../utils/format.js';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ search: '', action: '', from: '', to: '', page: 1 });
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(nextFilters = filters) {
    setLoading(true);
    try {
      const { data } = await api.get('/audit-logs', { params: nextFilters });
      setLogs(data.logs || []);
      setSummary(data.summary || null);
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

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function auditDetail(row) {
    return row.details || row.after?.message || row.after?.item || row.before?.status || '-';
  }

  async function printAuditLogs() {
    const printWindow = window.open('', 'labos-audit-print');
    if (!printWindow) {
      setError('Print window could not open. Please allow pop-ups for LabOS.');
      return;
    }
    printWindow.document.write('<p style="font-family:Arial,sans-serif">Preparing LabOS audit filing register...</p>');
    try {
      const { data } = await api.get('/audit-logs', { params: { ...filters, page: 1, limit: 250 } });
      const printSummary = data.summary || summary || {};
      const facility = printSummary.facility || {};
      const rows = data.logs || logs;
      const period = [filters.from || 'Start', filters.to || 'Today'].join(' to ');
      const tableRows = rows.map((row) => `
        <tr>
          <td>${escapeHtml(row.action)}</td>
          <td>${escapeHtml(row.performedBy?.name || row.userId?.name || 'System')}</td>
          <td>${escapeHtml(row.targetUserId?.name || '-')}</td>
          <td>${escapeHtml(row.departmentId?.name || '-')}</td>
          <td>${escapeHtml(row.targetItemId?.name || row.itemId?.name || '-')}</td>
          <td>${escapeHtml(auditDetail(row))}</td>
          <td>${escapeHtml(new Date(row.timestamp).toLocaleString('en-KE'))}</td>
        </tr>
      `).join('');

      printWindow.document.open();
      printWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <title>LabOS audit filing register</title>
            <style>
              body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
              h1 { margin: 0 0 4px; font-size: 22px; }
              .meta, .summary { font-size: 12px; color: #334155; line-height: 1.6; }
              .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 18px 0; }
              .box { border: 1px solid #cbd5e1; padding: 8px; border-radius: 4px; }
              table { width: 100%; border-collapse: collapse; font-size: 10px; }
              th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; vertical-align: top; }
              th { background: #f1f5f9; }
              .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 28px; font-size: 12px; }
              .line { border-bottom: 1px solid #334155; height: 28px; }
              @media print { button { display: none; } body { margin: 12mm; } }
            </style>
          </head>
          <body>
            <button onclick="window.print()">Print</button>
            <h1>LabOS Audit Filing Register</h1>
            <div class="meta">
              <div><strong>Facility:</strong> ${escapeHtml(facility.hospitalName || 'LabOS facility')} | <strong>Code:</strong> ${escapeHtml(facility.facilityCode || '-')}</div>
              <div><strong>County/Sub-county:</strong> ${escapeHtml(facility.county || '-')} / ${escapeHtml(facility.subCounty || '-')}</div>
              <div><strong>Period:</strong> ${escapeHtml(period)} | <strong>Generated:</strong> ${escapeHtml(new Date(printSummary.generatedAt || Date.now()).toLocaleString('en-KE'))}</div>
            </div>
            <div class="summary">
              <div class="box"><strong>Stock-out movement events</strong><br />${Number(printSummary.stockOutEvents || 0)}</div>
              <div class="box"><strong>Total quantity issued</strong><br />${Number(printSummary.stockOutQuantity || 0)}</div>
              <div class="box"><strong>Current out-of-stock items</strong><br />${Number(printSummary.currentOutOfStockItems || 0)}</div>
            </div>
            <table>
              <thead><tr><th>Action</th><th>Performed by</th><th>Target user</th><th>Department</th><th>Item</th><th>Details</th><th>Time</th></tr></thead>
              <tbody>${tableRows || '<tr><td colspan="7">No audit logs matched this filing period.</td></tr>'}</tbody>
            </table>
            <div class="signatures">
              <div><div class="line"></div>Prepared by / Date</div>
              <div><div class="line"></div>Reviewed by / Date</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    } catch (err) {
      printWindow.close();
      setError(apiErrorMessage(err, 'Audit filing register could not be prepared.'));
    }
  } // LabOS fix: Admin can print an MOH-style audit filing register with stock-out counts.

  return (
    <div className="space-y-5">
      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      {summary && (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="panel p-4"><p className="text-xs font-black uppercase text-slate-500">Stock-out movement events</p><p className="mt-1 text-2xl font-black text-clinic-ink">{summary.stockOutEvents || 0}</p></div>
          <div className="panel p-4"><p className="text-xs font-black uppercase text-slate-500">Total quantity issued</p><p className="mt-1 text-2xl font-black text-clinic-ink">{summary.stockOutQuantity || 0}</p></div>
          <div className="panel p-4"><p className="text-xs font-black uppercase text-slate-500">Current out-of-stock items</p><p className="mt-1 text-2xl font-black text-clinic-ink">{summary.currentOutOfStockItems || 0}</p></div>
        </div>
      )}
      <div className="grid gap-3 lg:grid-cols-[1fr_180px_160px_160px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Search audit logs" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} />
        </div>
        <input className="input" placeholder="Filter by action" value={filters.action} onChange={(event) => updateFilter('action', event.target.value)} />
        <input className="input" type="date" value={filters.from} onChange={(event) => updateFilter('from', event.target.value)} />
        <input className="input" type="date" value={filters.to} onChange={(event) => updateFilter('to', event.target.value)} />
        <button className="btn-primary" onClick={printAuditLogs}><Printer size={16} /> Print filing copy</button>
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
            { key: 'details', label: 'Details', render: auditDetail },
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
