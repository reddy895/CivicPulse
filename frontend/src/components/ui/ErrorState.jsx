import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

/**
 * Reusable ErrorState component with alert message and optional retry callback.
 */
export function ErrorState({
  title = 'Failed to load content',
  message = 'An unexpected error occurred while fetching information.',
  onRetry,
  retryLabel = 'Retry',
  className = '',
}) {
  return (
    <div className={`p-8 text-center rounded-2xl bg-[#FDF2F2]/70 border border-[#FCA5A5] flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#FCA5A5] flex items-center justify-center text-[#B54A4A] shadow-sm">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#991B1B]">{title}</h4>
        {message && (
          <p className="text-xs text-[#B54A4A] mt-1 max-w-md mx-auto">{message}</p>
        )}
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button
            size="sm"
            variant="danger"
            onClick={onRetry}
            icon={RefreshCw}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorState;
