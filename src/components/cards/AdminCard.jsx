import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Clock, 
  Activity,
  Settings,
  Crown,
  Building
} from 'lucide-react';
import StatusBadge, { RoleBadge } from '../status/StatusBadge';
import ActionButtons from '../actions/ActionButtons';

const AdminCard = ({ 
  admin,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onManagePermissions,
  showActions = true,
  showStats = false,
  className = ""
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getLastSeenText = (lastSeen) => {
    if (!lastSeen) return 'Jamais connecté';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 5) return 'En ligne';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} jour${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''}`;
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'super_admin': return Crown;
      case 'admin': return Shield;
      case 'moderator': return Settings;
      default: return User;
    }
  };

  const actions = [
    { type: 'view', onClick: () => onView?.(admin) },
    { type: 'edit', onClick: () => onEdit?.(admin) },
    ...(onManagePermissions ? [{ type: 'settings', onClick: () => onManagePermissions?.(admin), label: 'Permissions' }] : []),
    { type: 'delete', onClick: () => onDelete?.(admin) }
  ];

  const RoleIcon = getRoleIcon(admin.role);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="p-6">
        {/* En-tête avec avatar et statut */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Avatar ou icône */}
            <div className="relative">
              {admin.avatar ? (
                <img 
                  src={admin.avatar} 
                  alt={admin.nom}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {(admin.nom || admin.name)?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              )}
              
              {/* Indicateur en ligne */}
              {getLastSeenText(admin.lastSeen) === 'En ligne' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {admin.nom || admin.name || 'Nom non défini'}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{admin.email || 'Email non défini'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <RoleBadge role={admin.role} size="small" />
            <StatusBadge 
              status={admin.status === 'active' ? 'active' : 'inactive'} 
              size="small" 
            />
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <RoleIcon className="w-4 h-4 mr-2" />
            <span>{admin.role || 'Rôle non défini'}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Activity className="w-4 h-4 mr-2" />
            <span>{getLastSeenText(admin.lastSeen)}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Créé le {formatDate(admin.createdAt || admin.dateCreation)}</span>
          </div>
          
          {admin.department && (
            <div className="flex items-center text-gray-600">
              <Building className="w-4 h-4 mr-2" />
              <span className="truncate">{admin.department}</span>
            </div>
          )}
        </div>

        {/* Statistiques si demandées */}
        {showStats && admin.stats && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Statistiques</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {admin.stats.complaintsHandled && (
                <div>
                  <span className="font-medium text-gray-700">Plaintes traitées :</span>
                  <span className="ml-2 text-blue-600 font-semibold">{admin.stats.complaintsHandled}</span>
                </div>
              )}
              
              {admin.stats.averageResponseTime && (
                <div>
                  <span className="font-medium text-gray-700">Temps de réponse moyen :</span>
                  <span className="ml-2 text-green-600 font-semibold">{admin.stats.averageResponseTime}h</span>
                </div>
              )}
              
              {admin.stats.loginCount && (
                <div>
                  <span className="font-medium text-gray-700">Connexions :</span>
                  <span className="ml-2 text-purple-600 font-semibold">{admin.stats.loginCount}</span>
                </div>
              )}
              
              {admin.stats.lastActivity && (
                <div>
                  <span className="font-medium text-gray-700">Dernière activité :</span>
                  <span className="ml-2 text-orange-600 font-semibold">{formatDate(admin.stats.lastActivity)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Permissions (aperçu) */}
        {admin.permissions && admin.permissions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
            <div className="flex flex-wrap gap-1">
              {admin.permissions.slice(0, 3).map((permission, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {permission}
                </span>
              ))}
              {admin.permissions.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{admin.permissions.length - 3} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pied de carte avec actions */}
        {showActions && (
          <div className="pt-4 border-t border-gray-100">
            <ActionButtons 
              actions={actions}
              size="small"
              variant="compact"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCard; 