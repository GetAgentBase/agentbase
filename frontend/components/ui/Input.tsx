import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  label,
  error,
  icon,
  helperText,
  required,
  ...props
}, ref) => {
  const inputClasses = `
    block w-full px-4 py-2 rounded-md shadow-sm 
    placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-error focus:ring-error focus:border-error' : 'border-input-border'} 
    ${icon ? 'pl-10' : ''}
    bg-input-bg text-text-primary
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={inputClasses}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${props.id}-error`} className="mt-1 text-sm text-error">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 