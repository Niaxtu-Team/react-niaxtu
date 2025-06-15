import { useState } from 'react';
import { Filter, ChevronDown, X, RefreshCw } from 'lucide-react';

const FilterPanel = ({ 
  filters = {}, 
  onFiltersChange, 
  onReset,
  filterOptions = {},
  showPanel = false,
  onTogglePanel,
  className = ""
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleReset = () => {
    const resetFilters = Object.keys(localFilters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    setLocalFilters(resetFilters);
    if (onReset) {
      onReset();
    }
    if (onFiltersChange) {
      onFiltersChange(resetFilters);
    }
  };

  const hasActiveFilters = Object.values(localFilters).some(value => value !== '' && value !== null && value !== undefined);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* En-tête du panneau de filtres */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={onTogglePanel}
      >
        <div className="flex items-center space-x-3">
          <div className={`
            p-2 rounded-lg transition-colors duration-200
            ${hasActiveFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
          `}>
            <Filter className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Filtres
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                {Object.values(localFilters).filter(v => v !== '' && v !== null).length}
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
              title="Réinitialiser les filtres"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={`
            w-5 h-5 text-gray-400 transition-transform duration-200
            ${showPanel ? 'rotate-180' : ''}
          `} />
        </div>
      </div>

      {/* Contenu du panneau de filtres */}
      {showPanel && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(filterOptions).map(([key, options]) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {options.label || key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                
                {options.type === 'select' ? (
                  <select
                    value={localFilters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Tous</option>
                    {options.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : options.type === 'date' ? (
                  <input
                    type="date"
                    value={localFilters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                ) : options.type === 'daterange' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      placeholder="Du"
                      value={localFilters[`${key}_start`] || ''}
                      onChange={(e) => handleFilterChange(`${key}_start`, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                    <input
                      type="date"
                      placeholder="Au"
                      value={localFilters[`${key}_end`] || ''}
                      onChange={(e) => handleFilterChange(`${key}_end`, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder={`Filtrer par ${options.label || key}`}
                    value={localFilters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                )}
              </div>
            ))}
          </div>
          
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500">Filtres actifs:</span>
              {Object.entries(localFilters)
                .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
                .map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {filterOptions[key]?.label || key}: {value}
                    <button
                      onClick={() => handleFilterChange(key, '')}
                      className="ml-2 p-0.5 hover:bg-blue-200 rounded-full transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel; 