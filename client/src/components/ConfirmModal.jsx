import Modal from './Modal.jsx';

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', tone = 'danger', onCancel, onConfirm, busy }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
        <button
          type="button"
          className={tone === 'danger' ? 'inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50' : 'btn-primary'}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Working...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
