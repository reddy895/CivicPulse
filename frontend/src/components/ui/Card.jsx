import React from 'react';

/**
 * Reusable Card components aligned with CivicPulse Coffee & Crème design.
 */
export function Card({
  children,
  interactive = false,
  className = '',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#FFFFFF] border border-[#E8E0D5] rounded-2xl shadow-[0_1px_3px_rgba(44,24,16,0.04),0_4px_12px_rgba(44,24,16,0.02)] transition-all duration-200 ${
        interactive ? 'hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(44,24,16,0.08)] hover:border-[#D4A373] cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-base font-bold text-[#2C1810] tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-[#5C4A42] mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-3 border-t border-[#E8E0D5] flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
