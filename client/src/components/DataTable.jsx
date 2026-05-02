import EmptyState from './EmptyState.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function DataTable({ columns, rows, empty = 'No records found', loading = false, pagination, onPageChange }) {
  return (
    <div>
      <div className="table-scroll overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading && (
              <tr><td colSpan={columns.length}><LoadingSpinner label="Loading records" /></td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={columns.length}><EmptyState title={empty} /></td></tr>
            )}
            {!loading && rows.map((row, index) => (
              <tr key={row._id || index} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-4 py-3 text-slate-700">{column.render ? column.render(row) : row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3 text-sm">
          <span className="font-semibold text-slate-500">Page {pagination.page} of {pagination.pages}</span>
          <div className="flex gap-2">
            <button className="btn-secondary !py-1.5" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>Previous</button>
            <button className="btn-secondary !py-1.5" disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
