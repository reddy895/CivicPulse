import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable EmptyState component with icon, title, description, and optional action button.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching the current filter criteria.',
  action,
  className = '',
}) {
  return (
    <div className={`p-12 text-center rounded-2xl bg-[#FAF6F0]/60 border border-[#E8E0D5] flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#E8E0D5] flex items-center justify-center text-[#8C7A70] shadow-sm">
        <Icon className="w-6 h-6 text-[#A67B5B]" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#2C1810]">{title}</h4>
        {description && (
          <p className="text-xs text-[#5C4A42] mt-1 max-w-md mx-auto">{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
