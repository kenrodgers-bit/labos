import { createContext, useContext, useMemo, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function pushToast(message, type = 'success') {
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  }

  const value = useMemo(() => ({ pushToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[70] w-[calc(100vw-2rem)] max-w-sm space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-soft ${toast.type === 'error' ? 'border-rose-100 bg-rose-50 text-rose-800' : 'border-emerald-100 bg-emerald-50 text-emerald-800'}`}>
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p className="min-w-0 flex-1 text-sm font-semibold">{toast.message}</p>
            <button onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Dismiss notification">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
