import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable LoadingState component with customizable spinner, text, and card wrapper.
 */
export function LoadingState({
  message = 'Loading data...',
  description,
  inline = false,
  className = '',
}) {
  if (inline) {
    return (
      <div className={`flex items-center gap-2 text-xs text-[#5C4A42] ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-[#D4A373]" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className={`p-12 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] border border-[#E8E0D5] flex items-center justify-center shadow-sm">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4A373]" />
      </div>
      <div>
        <p className="text-sm font-bold text-[#2C1810]">{message}</p>
        {description && (
          <p className="text-xs text-[#8C7A70] mt-1 max-w-sm mx-auto">{description}</p>
        )}
      </div>
    </div>
  );
}

export default LoadingState;
