import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

let toastListeners = [];

export const toast = {
  success: (message, options) => emitToast({ message, type: 'success', ...options }),
  error: (message, options) => emitToast({ message, type: 'error', ...options }),
  info: (message, options) => emitToast({ message, type: 'info', ...options }),
  warning: (message, options) => emitToast({ message, type: 'warning', ...options }),
};

function emitToast(toastData) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast = { id, duration: 4000, ...toastData };
  toastListeners.forEach(listener => listener(newToast));
  return id;
}

/**
 * ToastContainer component mounted once (e.g. in App or main view) to display toasts.
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleAddToast = (t) => {
      setToasts(prev => [...prev, t]);
      if (t.duration) {
        setTimeout(() => {
          setToasts(prev => prev.filter(item => item.id !== t.id));
        }, t.duration);
      }
    };

    toastListeners.push(handleAddToast);
    return () => {
      toastListeners = toastListeners.filter(l => l !== handleAddToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-[#92400E] shrink-0" />,
          info: <Info className="w-4 h-4 text-[#1E3A8A] shrink-0" />,
        };

        const variantStyles = {
          success: 'bg-[#F0F6F2] border-[#A5D6A7] text-[#2C1810]',
          error: 'bg-[#FDF2F2] border-[#FCA5A5] text-[#2C1810]',
          warning: 'bg-[#FDF8F0] border-[#FCD34D] text-[#2C1810]',
          info: 'bg-[#F0F4F8] border-[#BAE6FD] text-[#2C1810]',
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-lg transition-all animate-in slide-in-from-bottom-2 duration-200 ${variantStyles[t.type] || variantStyles.info}`}
          >
            {icons[t.type] || icons.info}
            <div className="flex-1 text-xs font-medium leading-relaxed">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#8C7A70] hover:text-[#2C1810] p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
