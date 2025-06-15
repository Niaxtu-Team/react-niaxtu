import { 
  History, 
  User, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  Eye
} from 'lucide-react';
import StatusBadge from '../status/StatusBadge';
import ActionButtons from '../actions/ActionButtons';

const HistoryTimeline = ({ 
  history = [],
  onViewDetails,
  showActions = true,
  className = ""
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} jour${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''}`;
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'résolution plainte':
      case 'rejet plainte':
        return AlertTriangle;
      case 'création utilisateur':
      case 'suppression utilisateur':
        return User;
      case 'modification permissions':
        return Activity;
      case 'login':
      case 'connexion':
        return CheckCircle;
      case 'logout':
      case 'déconnexion':
        return XCircle;
      default:
        return History;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'succès':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'échec':
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'en_cours':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (history.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-gray-100 p-8 rounded-2xl w-32 h-32 mx-auto mb-6 flex items-center justify-center">
          <History className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun historique</h3>
        <p className="text-gray-500">Aucune action n'a encore été enregistrée</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {history.map((item, index) => {
        const IconComponent = getActionIcon(item.action);
        const actions = showActions ? [
          { type: 'view', onClick: () => onViewDetails?.(item) }
        ] : [];

        return (
          <div
            key={item.id || index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start space-x-4">
              {/* Icône d'action */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Contenu principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.action || 'Action inconnue'}
                    </h3>
                    
                    {item.description && (
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Métadonnées */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span className="font-medium">Admin:</span>
                        <span className="ml-1 truncate">{item.admin || item.user || 'Système'}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="font-medium">Date:</span>
                        <span className="ml-1">{formatDate(item.createdAt || item.timestamp)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="font-medium">Il y a:</span>
                        <span className="ml-1">{getTimeAgo(item.createdAt || item.timestamp)}</span>
                      </div>
                    </div>

                    {/* Détails additionnels */}
                    {(item.target || item.affectedResource) && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Cible:</span>
                          <span className="ml-2 text-gray-600">{item.target || item.affectedResource}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Statut et actions */}
                  <div className="flex items-start space-x-3 ml-4">
                    {item.status && (
                      <span className={`
                        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
                        ${getStatusColor(item.status)}
                      `}>
                        {item.status}
                      </span>
                    )}
                    
                    {showActions && (
                      <ActionButtons 
                        actions={actions}
                        size="small"
                        variant="compact"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryTimeline; 