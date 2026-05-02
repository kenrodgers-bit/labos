import { Download } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api.js';

const reports = [
  ['Inventory report', '/reports/inventory', 'labos-inventory-report', 'Current stock, thresholds, expiry, suppliers, and locations.'],
  ['Low stock report', '/reports/low-stock', 'labos-low-stock-report', 'Items at or below configured minimum thresholds.'],
  ['Expiry report', '/reports/expiry', 'labos-expiry-report', 'Expired and soon-expiring laboratory commodities.'],
  ['Request report', '/reports/requests', 'labos-request-report', 'Requested, approved, rejected, and partial approval history.'],
  ['Usage report', '/reports/usage', 'labos-usage-report', 'Stock in, stock out, and adjustment movement register.'],
  ['Department usage report', '/reports/department-usage', 'labos-department-usage-report', 'Department-level commodity usage for internal review.'],
  ['Audit logs', '/reports/audit', 'labos-audit-log', 'Traceable system activity and approval changes.'],
  ['MOH 706 monthly', '/reports/moh706', 'labos-moh-706-monthly-report', 'Monthly test counts, commodities used, stock balances, and totals.']
];

export default function Reports() {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function downloadReport(path, format, filename) {
    const key = `${filename}-${format}`;
    setBusy(key);
    setError('');
    try {
      const { data, headers } = await api.get(path, { params: { format }, responseType: 'blob' });
      const type = headers['content-type'] || (format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const url = URL.createObjectURL(new Blob([data], { type }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Report export failed. Please try again.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map(([title, path, filename, description]) => (
          <div key={title} className="panel p-5">
            <h2 className="text-lg font-black text-clinic-ink">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
            <div className="mt-5 flex gap-3">
              <button className="btn-primary" onClick={() => downloadReport(path, 'pdf', filename)} disabled={busy === `${filename}-pdf`}><Download size={16} /> PDF</button>
              {path !== '/reports/moh706' && <button className="btn-secondary" onClick={() => downloadReport(path, 'excel', filename)} disabled={busy === `${filename}-excel`}><Download size={16} /> Excel</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
