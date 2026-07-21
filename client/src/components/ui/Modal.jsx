import { useEffect, useRef } from 'react';
import { classNames } from '../../utils';

const Modal = ({ isOpen, onClose, title, children, size = 'md', showClose = true }) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modalRef = useRef(null);
  const titleId = title ? 'modal-title' : undefined;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => modalRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={modalRef}
          tabIndex={-1}
          className={classNames(
            'relative bg-white rounded-xl shadow-modal w-full',
            'transform transition-all duration-200 ease-out',
            'outline-none',
            sizes[size]
          )}
        >
          {(title || showClose) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
              {title && (
                <h3 id={titleId} className="text-lg font-semibold text-navy-900">
                  {title}
                </h3>
              )}
              {showClose && (
                <button
                  onClick={onClose}
                  className={classNames(
                    'text-navy-300 hover:text-navy-600 hover:bg-navy-50',
                    'p-1.5 rounded-lg transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                  )}
                  aria-label="Close dialog"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
