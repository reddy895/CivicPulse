import React, { forwardRef } from 'react';

/**
 * Reusable Textarea component with label, error handling, and character count support.
 */
export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    rows = 4,
    fullWidth = true,
    className = '',
    id,
    ...props
  },
  ref
) {
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-bold text-[#2C1810]"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`w-full text-xs rounded-xl border bg-[#FFFFFF] text-[#2C1810] placeholder-[#9C8C84] p-3.5 transition-all duration-150 outline-none resize-y ${
          error
            ? 'border-[#F87171] focus:ring-2 focus:ring-[#F87171]/40 bg-[#FDF2F2]/20'
            : 'border-[#E8E0D5] focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/30'
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-[11px] text-[#B54A4A] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#8C7A70]">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Textarea;
