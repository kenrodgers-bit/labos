import { Download } from 'lucide-react';
import { exportUrl } from '../services/api.js';

const reports = [
  ['Inventory report', '/reports/inventory', 'Current stock, thresholds, expiry, suppliers, and locations.'],
  ['Request report', '/reports/requests', 'Requested, approved, rejected, and partial approval history.'],
  ['Usage report', '/reports/usage', 'Stock in, stock out, and adjustment movement register.'],
  ['Department report', '/reports/usage', 'Department-level commodity usage for internal review.'],
  ['Audit logs', '/reports/audit', 'Traceable system activity and approval changes.'],
  ['MOH 706 monthly', '/reports/moh706', 'Monthly test counts, commodities used, stock balances, and totals.']
];

export default function Reports() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {reports.map(([title, path, description]) => (
        <div key={title} className="panel p-5">
          <h2 className="text-lg font-black text-clinic-ink">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
          <div className="mt-5 flex gap-3">
            <a className="btn-primary" href={exportUrl(path, 'pdf')} target="_blank" rel="noreferrer"><Download size={16} /> PDF</a>
            {path !== '/reports/moh706' && <a className="btn-secondary" href={exportUrl(path, 'excel')} target="_blank" rel="noreferrer"><Download size={16} /> Excel</a>}
          </div>
        </div>
      ))}
    </div>
  );
}
