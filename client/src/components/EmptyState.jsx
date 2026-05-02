import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No records found', message = 'Try adjusting the search or filters.' }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Inbox size={20} />
      </div>
      <p className="mt-3 text-sm font-black text-slate-800">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
    </div>
  );
}
