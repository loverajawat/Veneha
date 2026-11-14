'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-canvas border border-hairline rounded-lg shadow-level3 text-ink text-[14px] font-medium animate-fade-in"
    >
      {type === 'success' && <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0" />}
      {type === 'error' && <AlertCircle className="w-4 h-4 text-semantic-error shrink-0" />}
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 -mr-1 text-steel hover:text-ink rounded transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default Toast;
