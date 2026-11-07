import React from 'react';

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
          className={`w-full h-[44px] bg-canvas text-ink text-[16px] px-[16px] py-[12px] rounded-md border ${
            error
              ? 'border-semantic-error focus:border-semantic-error'
              : 'border-hairline-strong focus:border-primary'
          } outline-none focus:ring-0 placeholder:text-muted transition-colors ${className}`}
          {...props}
        />
        {error && <p className="text-[13px] text-semantic-error font-medium">{error}</p>}
        {helperText && !error && <p className="text-[13px] text-steel">{helperText}</p>}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

