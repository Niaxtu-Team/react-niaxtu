import { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ 
  placeholder = "Rechercher...", 
  value = "", 
  onChange, 
  onClear,
  className = "",
  size = "medium",
  disabled = false,
  showClearButton = true
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const sizeClasses = {
    small: "py-2 px-3 text-sm",
    medium: "py-3 px-4 text-base",
    large: "py-4 px-5 text-lg"
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`
        relative flex items-center bg-white border rounded-xl shadow-sm transition-all duration-200
        ${isFocused ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        <Search className={`
          absolute left-3 text-gray-400 transition-colors duration-200
          ${isFocused ? 'text-blue-500' : ''}
          ${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-5 h-5'}
        `} />
        
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full bg-transparent border-none outline-none pl-10 pr-10
            placeholder-gray-400 text-gray-900
            ${sizeClasses[size]}
          `}
        />
        
        {showClearButton && value && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100"
            type="button"
          >
            <X className={`${size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'}`} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar; 