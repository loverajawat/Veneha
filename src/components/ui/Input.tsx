import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[14px] font-medium text-charcoal">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full h-[44px] bg-canvas text-ink text-[15px] px-[14px] py-[10px] rounded-md border ${
            error
              ? 'border-semantic-error focus:border-semantic-error'
              : 'border-hairline-strong focus:border-primary'
          } outline-none focus:ring-1 focus:ring-primary placeholder:text-muted transition-colors ${className}`}
          {...props}
        />
        {error && (
          <p className="text-[13px] text-semantic-error font-medium flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {helperText && !error && <p className="text-[13px] text-steel mt-1">{helperText}</p>}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

export const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, error, helperText, id, className = '', children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-[14px] font-medium text-charcoal">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full h-[44px] bg-canvas text-ink text-[15px] px-[14px] py-[10px] rounded-md border appearance-none pr-10 ${
              error
                ? 'border-semantic-error focus:border-semantic-error'
                : 'border-hairline-strong focus:border-primary'
            } outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer ${className}`}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-steel">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && (
          <p className="text-[13px] text-semantic-error font-medium flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {helperText && !error && <p className="text-[13px] text-steel mt-1">{helperText}</p>}
      </div>
    );
  }
);

SelectInput.displayName = 'SelectInput';


