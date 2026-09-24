import React from 'react';

/**
 * Reusable Badge component for metadata, labels, and tags.
 */
export function Badge({
  children,
  variant = 'default', // 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'accent'
  size = 'md',        // 'sm' | 'md'
  className = '',
  ...props
}) {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold',
  }[size] || 'text-xs px-2.5 py-1';

  const variantStyles = {
    default: 'bg-[#FAF6F0] text-[#5C4A42] border border-[#E8E0D5]',
    success: 'bg-[#F0F6F2] text-[#2E7D32] border border-[#A5D6A7]',
    warning: 'bg-[#FDF8F0] text-[#92400E] border border-[#FCD34D]',
    danger: 'bg-[#FDF2F2] text-[#991B1B] border border-[#FCA5A5]',
    info: 'bg-[#F0F4F8] text-[#1E3A8A] border border-[#BAE6FD]',
    outline: 'bg-transparent text-[#2C1810] border border-[#D4A373]',
    accent: 'bg-[#D4A373]/20 text-[#6F4E37] border border-[#D4A373]/40',
  }[variant] || 'bg-[#FAF6F0] text-[#5C4A42] border border-[#E8E0D5]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
