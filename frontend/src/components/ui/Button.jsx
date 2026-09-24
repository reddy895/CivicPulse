import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * CivicPulse Button component with consistent variant and size styling.
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-xl';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2.5 gap-2',
    lg: 'text-sm px-6 py-3 gap-2.5',
  }[size] || 'text-xs px-4 py-2.5 gap-2';

  const variantStyles = {
    primary: 'bg-[#6F4E37] text-white hover:bg-[#5C402E] active:scale-[0.98] shadow-sm',
    secondary: 'bg-[#FAF6F0] text-[#5C4A42] border border-[#E8E0D5] hover:bg-[#F5EBE0] hover:text-[#2C1810] active:scale-[0.98]',
    accent: 'bg-[#D4A373] text-[#2C1810] hover:bg-[#C59261] active:scale-[0.98] shadow-sm',
    outline: 'bg-transparent text-[#2C1810] border border-[#D4A373] hover:bg-[#FAF6F0] active:scale-[0.98]',
    ghost: 'bg-transparent text-[#5C4A42] hover:bg-[#FAF6F0] hover:text-[#2C1810]',
    danger: 'bg-[#B54A4A] text-white hover:bg-[#9E3E3E] active:scale-[0.98] shadow-sm',
  }[variant] || 'bg-[#6F4E37] text-white';

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}

export default Button;
