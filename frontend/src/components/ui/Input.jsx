import React, { forwardRef } from 'react';

/**
 * Reusable Form Input component with label, error state, and icon integration.
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    fullWidth = true,
    className = '',
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-[#2C1810]"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-[#8C7A70]">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full text-xs rounded-xl border bg-[#FFFFFF] text-[#2C1810] placeholder-[#9C8C84] transition-all duration-150 outline-none ${
            Icon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5'
          } ${
            error
              ? 'border-[#F87171] focus:ring-2 focus:ring-[#F87171]/40 bg-[#FDF2F2]/20'
              : 'border-[#E8E0D5] focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/30'
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[11px] text-[#B54A4A] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#8C7A70]">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
