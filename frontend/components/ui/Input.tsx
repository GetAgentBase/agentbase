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
    block w-full px-4 py-2 text-gray-900 bg-white border rounded-md shadow-sm 
    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'} 
    ${icon ? 'pl-10' : ''}
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
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
        <p id={`${props.id}-error`} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 