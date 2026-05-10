import { ChevronDown } from 'lucide-react';
import { Fragment } from 'react';

export default function MohDataGrid({ category, entries, validationErrors, onCellChange, onCellKeyDown }) {
  let lastGroup = '';
  let cellIndex = 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
      <div className="table-scroll max-h-[58vh] overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-20 bg-slate-50 text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-200">
            <tr>
              <th className="sticky left-0 z-30 min-w-[18rem] bg-slate-50 px-4 py-3 text-left text-xs font-black uppercase tracking-wide dark:bg-slate-800">
                Test / indicator
              </th>
              {category.columns.map((field) => (
                <th key={field.key} className="min-w-[8.5rem] border-l border-slate-200 px-3 py-3 text-left text-xs font-black uppercase tracking-wide dark:border-slate-700">
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const showGroup = entry.group !== lastGroup;
              lastGroup = entry.group;
              return (
                <Fragment key={entry.testKey}>
                  {showGroup && (
                    <tr key={`${entry.group}-group`}>
                      <td colSpan={category.columns.length + 1} className="border-t border-slate-200 bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                        <span className="inline-flex items-center gap-2"><ChevronDown size={14} />{entry.group}</span>
                      </td>
                    </tr>
                  )}
                  <tr key={entry.testKey} className="group hover:bg-blue-50/40 dark:hover:bg-slate-800">
                    <td className="sticky left-0 z-10 border-t border-slate-100 bg-white px-4 py-3 font-semibold text-slate-800 group-hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:group-hover:bg-slate-800">
                      {entry.testName}
                    </td>
                    {category.columns.map((field) => {
                      const index = cellIndex;
                      cellIndex += 1;
                      const errorKey = `${entry.categoryKey}:${entry.testKey}:${field.key}`;
                      return (
                        <td key={field.key} className="border-l border-t border-slate-100 px-2 py-2 dark:border-slate-800">
                          <input
                            aria-label={`${entry.testName} ${field.label}`}
                            data-cell-index={index}
                            className={`w-full rounded-lg border bg-white px-3 py-2 text-right text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-900/40 ${validationErrors[errorKey] ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 dark:border-slate-700'}`}
                            min="0"
                            inputMode="numeric"
                            type="number"
                            value={entry.values?.[field.key] ?? 0}
                            onChange={(event) => onCellChange(entry, field.key, event.target.value)}
                            onKeyDown={onCellKeyDown}
                          />
                        </td>
                      );
                    })}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
