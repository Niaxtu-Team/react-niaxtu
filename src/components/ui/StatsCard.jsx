import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  trend,
  trendValue,
  subtitle,
  className = '',
  onClick
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-gradient-to-br from-green-500 to-green-600',
          text: 'text-green-100',
          icon: 'text-green-200'
        };
      case 'red':
        return {
          bg: 'bg-gradient-to-br from-red-500 to-red-600',
          text: 'text-red-100',
          icon: 'text-red-200'
        };
      case 'yellow':
        return {
          bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
          text: 'text-yellow-100',
          icon: 'text-yellow-200'
        };
      case 'purple':
        return {
          bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
          text: 'text-purple-100',
          icon: 'text-purple-200'
        };
      case 'indigo':
        return {
          bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
          text: 'text-indigo-100',
          icon: 'text-indigo-200'
        };
      case 'pink':
        return {
          bg: 'bg-gradient-to-br from-pink-500 to-pink-600',
          text: 'text-pink-100',
          icon: 'text-pink-200'
        };
      case 'orange':
        return {
          bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
          text: 'text-orange-100',
          icon: 'text-orange-200'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          text: 'text-blue-100',
          icon: 'text-blue-200'
        };
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const colors = getColorClasses();
  const TrendIcon = getTrendIcon();

  return (
    <div 
      className={`
        ${colors.bg} p-6 rounded-2xl text-white shadow-lg 
        hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${colors.text} text-sm font-medium mb-1`}>{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold">{value}</p>
            {trendValue && (
              <div className={`flex items-center text-sm ${getTrendColor()}`}>
                <TrendIcon className="w-4 h-4 mr-1" />
                {trendValue}
              </div>
            )}
          </div>
          {subtitle && (
            <p className={`${colors.text} text-xs mt-1`}>{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="ml-4">
            <Icon className={`w-8 h-8 ${colors.icon}`} />
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pour un groupe de statistiques
export const StatsGrid = ({ stats, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          {...stat}
          style={{ 
            animationDelay: `${index * 100}ms`,
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        />
      ))}
    </div>
  );
};

// Composant de statistique simple (version blanche)
export const SimpleStatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'indigo',
  subtitle,
  className = '',
  onClick
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'text-green-600 bg-green-100';
      case 'red':
        return 'text-red-600 bg-red-100';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-100';
      case 'purple':
        return 'text-purple-600 bg-purple-100';
      case 'blue':
        return 'text-blue-600 bg-blue-100';
      case 'pink':
        return 'text-pink-600 bg-pink-100';
      case 'orange':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-indigo-600 bg-indigo-100';
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div 
      className={`
        bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 
        hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorClasses}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

// Composant de statistique avec graphique (placeholder)
export const ChartStatsCard = ({ 
  title, 
  value, 
  chartData = [],
  color = 'blue',
  className = ''
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'from-green-500 to-green-600';
      case 'red':
        return 'from-red-500 to-red-600';
      case 'yellow':
        return 'from-yellow-500 to-yellow-600';
      case 'purple':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      
      {/* Mini graphique placeholder */}
      <div className="h-16 flex items-end space-x-1">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className={`flex-1 bg-gradient-to-t ${getColorClasses()} rounded-t opacity-70`}
            style={{ 
              height: `${Math.random() * 100}%`,
              minHeight: '4px'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default StatsCard; 