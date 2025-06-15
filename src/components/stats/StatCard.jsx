import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  onClick,
  loading = false,
  className = ""
}) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      text: 'text-blue-100',
      light: 'text-blue-200'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      text: 'text-green-100',
      light: 'text-green-200'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      text: 'text-red-100',
      light: 'text-red-200'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      text: 'text-orange-100',
      light: 'text-orange-200'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      text: 'text-purple-100',
      light: 'text-purple-200'
    },
    gray: {
      bg: 'from-gray-500 to-gray-600',
      text: 'text-gray-100',
      light: 'text-gray-200'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      case 'stable': return Minus;
      default: return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'stable': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString('fr-FR');
    }
    return val;
  };

  const TrendIcon = getTrendIcon();

  if (loading) {
    return (
      <div className={`bg-gradient-to-br ${colors.bg} p-6 rounded-2xl shadow-lg ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
            <div className="w-4 h-4 bg-white/20 rounded"></div>
          </div>
          <div className="w-16 h-8 bg-white/20 rounded mb-2"></div>
          <div className="w-24 h-4 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        bg-gradient-to-br ${colors.bg} p-6 rounded-2xl text-white shadow-lg 
        ${onClick ? 'cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200' : ''} 
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          {subtitle && (
            <p className={`text-sm font-medium ${colors.text} mb-1`}>
              {subtitle}
            </p>
          )}
          <p className={`text-sm font-medium ${colors.light}`}>
            {title}
          </p>
        </div>
        
        {Icon && (
          <div className={`${colors.light}`}>
            <Icon className="w-8 h-8" />
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-white mb-1">
            {formatValue(value)}
          </p>
          
          {(trend && trendValue) && (
            <div className="flex items-center space-x-1">
              {TrendIcon && (
                <TrendIcon className={`w-4 h-4 ${getTrendColor()}`} />
              )}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour un groupe de statistiques
const StatCardGrid = ({ 
  stats = [], 
  loading = false, 
  className = "",
  columns = { sm: 1, md: 2, lg: 4 }
}) => {
  const getGridClasses = () => {
    return `grid gap-6 grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg}`;
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {stats.map((stat, index) => (
        <StatCard
          key={stat.key || index}
          {...stat}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default StatCard;
export { StatCardGrid }; 