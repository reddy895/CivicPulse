import React from 'react';

/**
 * CivicPulse StatusBadge component mapping domain statuses (Urgency, Workflow Stages, Compliance)
 * to appropriate semantic styles.
 */
export function StatusBadge({
  status = 'default',
  showDot = true,
  className = '',
  ...props
}) {
  const normalized = String(status).toLowerCase().trim();

  let variant = 'default';
  let dotColor = '#8C7A70';
  let pulse = false;

  if (normalized.includes('critical') || normalized.includes('severe') || normalized.includes('danger') || normalized.includes('action required')) {
    variant = 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]';
    dotColor = '#B54A4A';
    pulse = true;
  } else if (normalized.includes('high') || normalized.includes('warning') || normalized.includes('underfunded') || normalized.includes('in progress')) {
    variant = 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]';
    dotColor = '#C78D3F';
  } else if (normalized.includes('verified') || normalized.includes('resolved') || normalized.includes('dispatched') || normalized.includes('compliant') || normalized.includes('healthy')) {
    variant = 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]';
    dotColor = '#5A8F6E';
  } else if (normalized.includes('info') || normalized.includes('clustered') || normalized.includes('transmitted')) {
    variant = 'bg-[#F0F4F8] text-[#1E3A8A] border-[#BAE6FD]';
    dotColor = '#5A7D9A';
  } else {
    variant = 'bg-[#FAF6F0] text-[#5C4A42] border-[#E8E0D5]';
    dotColor = '#A67B5B';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${variant} ${className}`}
      {...props}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${pulse ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: dotColor }}
        />
      )}
      <span>{status}</span>
    </span>
  );
}

export default StatusBadge;
