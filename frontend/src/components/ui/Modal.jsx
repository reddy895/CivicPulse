import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable accessible Modal dialog with backdrop blur and escape key handling.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-xl',
  footer,
  className = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C1810]/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidth} bg-[#FFFFFF] border border-[#E8E0D5] rounded-3xl shadow-[0_20px_25px_-5px_rgba(44,24,16,0.1),0_10px_10px_-5px_rgba(44,24,16,0.04)] overflow-hidden z-10 animate-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#E8E0D5] flex items-start justify-between gap-4 bg-[#FDFBF7]">
          <div>
            {title && (
              <h2 className="text-lg font-bold text-[#2C1810] tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-[#5C4A42] mt-1">{description}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8C7A70] hover:text-[#2C1810] hover:bg-[#FAF6F0] transition cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[calc(85vh-130px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 px-6 bg-[#FAF6F0] border-t border-[#E8E0D5] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
