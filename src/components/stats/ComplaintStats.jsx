import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  FileText
} from 'lucide-react';

const ComplaintStats = ({
  stats,
  showTrends = true,
  className = ""
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'en-attente':
        return Clock;
      case 'en-traitement':
        return AlertTriangle;
      case 'resolue':
        return CheckCircle;
      case 'rejetee':
        return XCircle;
      case 'urgente':
        return Zap;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en-attente':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'en-traitement':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'resolue':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'rejetee':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'urgente':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'total':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTrendIcon = (trend) => {
    if (!trend || trend === 0) return null;
    return trend > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend) => {
    if (!trend || trend === 0) return 'text-gray-500';
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatTrend = (trend) => {
    if (!trend || trend === 0) return null;
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend}%`;
  };

  const defaultStats = [
    {
      key: 'total',
      label: 'Total des plaintes',
      value: stats?.total || 0,
      trend: stats?.trends?.total || null
    },
    {
      key: 'en-attente',
      label: 'En attente',
      value: stats?.enAttente || 0,
      trend: stats?.trends?.enAttente || null
    },
    {
      key: 'en-traitement',
      label: 'En traitement',
      value: stats?.enTraitement || 0,
      trend: stats?.trends?.enTraitement || null
    },
    {
      key: 'resolue',
      label: 'Résolues',
      value: stats?.resolues || 0,
      trend: stats?.trends?.resolues || null
    },
    {
      key: 'rejetee',
      label: 'Rejetées',
      value: stats?.rejetees || 0,
      trend: stats?.trends?.rejetees || null
    },
    {
      key: 'urgente',
      label: 'Urgentes',
      value: stats?.urgentes || 0,
      trend: stats?.trends?.urgentes || null
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
      {defaultStats.map((stat) => {
        const StatusIcon = getStatusIcon(stat.key);
        const TrendIcon = getTrendIcon(stat.trend);
        const colorClass = getStatusColor(stat.key);
        const trendColor = getTrendColor(stat.trend);

        return (
          <div
            key={stat.key}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg border ${colorClass}`}>
                <StatusIcon className="w-5 h-5" />
              </div>
              {showTrends && TrendIcon && (
                <div className={`flex items-center text-xs ${trendColor}`}>
                  <TrendIcon className="w-3 h-3 mr-1" />
                  <span>{formatTrend(stat.trend)}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {stat.label}
              </p>
            </div>

            {/* Barre de progression pour les pourcentages */}
            {stat.key !== 'total' && stat.key !== 'urgente' && stats?.total > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      stat.key === 'resolue' ? 'bg-green-500' :
                      stat.key === 'en-traitement' ? 'bg-blue-500' :
                      stat.key === 'en-attente' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((stat.value / stats.total) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((stat.value / stats.total) * 100).toFixed(1)}% du total
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintStats; 