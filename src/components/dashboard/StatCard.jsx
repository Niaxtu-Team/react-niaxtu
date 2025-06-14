import React from 'react';

const StatCard = ({ 
  icon, 
  color = 'blue', 
  title, 
  value, 
  trend = 'up', 
  change, 
  isHovering = false,
  onMouseEnter,
  onMouseLeave,
  className = ''
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-500',
    green: 'bg-green-100 text-green-500',
    red: 'bg-red-100 text-red-500',
    yellow: 'bg-yellow-100 text-yellow-500',
    indigo: 'bg-indigo-100 text-indigo-500',
    purple: 'bg-purple-100 text-purple-500',
    amber: 'bg-amber-100 text-amber-500'
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm p-5 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${
        isHovering ? 'ring-2 ring-blue-500' : ''
      } ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-between">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <i className={`fas ${icon} text-xl`}></i>
        </div>
        <div className={`text-xs font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change} {trend === 'up' ? '↑' : '↓'}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default StatCard; 
