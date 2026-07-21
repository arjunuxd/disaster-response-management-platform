import Modal from '../ui/Modal';
import { classNames } from '../../utils';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  danger = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-navy-500 leading-relaxed mb-6">{message}</p>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className={classNames(
            'btn-ghost px-4 py-2.5 text-sm font-medium',
            'text-navy-600 hover:text-navy-800 hover:bg-navy-50',
            'rounded-lg transition-colors duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={classNames(
            'px-5 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            danger
              ? 'bg-danger-600 hover:bg-danger-700 text-white'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          )}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
