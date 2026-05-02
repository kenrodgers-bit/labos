import { statusTone } from '../utils/format.js';

export default function StatusBadge({ value }) {
  if (!value) return <span className="text-slate-400">-</span>;
  return <span className={`badge ${statusTone(value)}`}>{String(value).replaceAll('_', ' ')}</span>;
}
