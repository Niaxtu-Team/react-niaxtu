import React from 'react';

const Input = ({ 
  label,
  error,
  helperText,
  icon,
  type = 'text',
  size = 'md',
  variant = 'default',
  className = '',
  required = false,
  ...props 
}) => {
  const baseClasses = 'block w-full border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const variants = {
    default: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
  };

  const inputVariant = error ? 'error' : variant;
  const iconClasses = icon ? (size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-12' : 'pl-10') : '';

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 left-0 flex items-center ${size === 'sm' ? 'pl-2' : size === 'lg' ? 'pl-4' : 'pl-3'} pointer-events-none`}>
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        <input
          type={type}
          className={`${baseClasses} ${sizes[size]} ${variants[inputVariant]} ${iconClasses} ${className}`}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input; 
