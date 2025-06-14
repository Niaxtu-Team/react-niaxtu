import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'indigo', 
  text = 'Chargement...', 
  fullScreen = false,
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-6 w-6';
      case 'lg':
        return 'h-16 w-16';
      case 'xl':
        return 'h-24 w-24';
      default:
        return 'h-10 w-10';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'border-blue-600';
      case 'green':
        return 'border-green-600';
      case 'red':
        return 'border-red-600';
      case 'yellow':
        return 'border-yellow-600';
      case 'purple':
        return 'border-purple-600';
      default:
        return 'border-indigo-600';
    }
  };

  const spinner = (
    <div className="relative">
      <div className={`animate-spin rounded-full border-4 border-gray-200 ${getSizeClasses()}`}></div>
      <div className={`animate-spin rounded-full border-t-4 ${getColorClasses()} ${getSizeClasses()} absolute top-0`}></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className={`animate-spin rounded-full h-32 w-32 border-t-4 ${getColorClasses()} mx-auto absolute top-0`}></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">{text}</p>
            <p className="text-sm text-gray-500">Veuillez patienter</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {spinner}
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

// Composant de chargement pour les boutons
export const ButtonSpinner = ({ size = 'sm', className = '' }) => {
  return (
    <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${
      size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    } ${className}`}></div>
  );
};

// Composant de chargement pour les cartes
export const CardSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className="h-3 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="flex space-x-2 mt-4">
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    </div>
  );
};

// Composant de chargement pour les tableaux
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20 ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-8 py-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-8 py-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoadingSpinner; 