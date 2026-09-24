import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable Select dropdown component.
 */
export const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    helperText,
    fullWidth = true,
    className = '',
    id,
    children,
    ...props
  },
  ref
) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-bold text-[#2C1810]"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`w-full appearance-none text-xs rounded-xl border bg-[#FFFFFF] text-[#2C1810] px-3.5 py-2.5 pr-9 transition-all duration-150 outline-none cursor-pointer ${
            error
              ? 'border-[#F87171] focus:ring-2 focus:ring-[#F87171]/40'
              : 'border-[#E8E0D5] focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/30'
          } ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C7A70]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p className="text-[11px] text-[#B54A4A] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#8C7A70]">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;
