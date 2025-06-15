import { 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Tag,
  Building2,
  Calendar,
  Hash,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { ActionButtons, StatusBadge } from '../index';

const TypeCard = ({
  type,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  showSector = true,
  showCode = true,
  showKeywords = true,
  className = ""
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Actif' : 'Inactif';
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'faible':
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'moyenne':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'élevée':
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const actions = [
    { type: 'view', onClick: () => onView?.(type) },
    { type: 'edit', onClick: () => onEdit?.(type) },
    { type: 'delete', onClick: () => onDelete?.(type) }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* En-tête avec nom et statut */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {type.name || type.title}
            </h3>
            <StatusBadge 
              status={getStatusText(type.isActive)}
              variant={getStatusColor(type.isActive)}
            />
          </div>
          
          {type.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {type.description}
            </p>
          )}
        </div>

        <ActionButtons 
          actions={actions}
          variant="compact"
          size="small"
        />
      </div>

      {/* Métadonnées */}
      <div className="space-y-3">
        {/* Code et secteur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {showCode && type.code && (
            <div className="flex items-center text-sm text-gray-600">
              <Hash className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Code:</span>
              <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                {type.code}
              </span>
            </div>
          )}
          
          {showSector && (type.sector || type.sectorName) && (
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Secteur:</span>
              <span className="ml-1 truncate">{type.sector || type.sectorName}</span>
            </div>
          )}
        </div>

        {/* Sévérité et catégorie */}
        {(type.severity || type.category) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {type.severity && (
              <div className="flex items-center text-sm">
                <AlertTriangle className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium text-gray-600 mr-2">Sévérité:</span>
                <span className={`
                  inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border
                  ${getSeverityColor(type.severity)}
                `}>
                  {type.severity}
                </span>
              </div>
            )}
            
            {type.category && (
              <div className="flex items-center text-sm text-gray-600">
                <Tag className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">Catégorie:</span>
                <span className="ml-1 truncate">{type.category}</span>
              </div>
            )}
          </div>
        )}

        {/* Mots-clés */}
        {showKeywords && type.keywords && type.keywords.length > 0 && (
          <div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Tag className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Mots-clés:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {type.keywords.slice(0, 5).map((keyword, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {keyword}
                </span>
              ))}
              {type.keywords.length > 5 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{type.keywords.length - 5} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* Options spéciales */}
        {(type.requiresLocation || type.requiresEvidence || type.autoAssign) && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {type.requiresLocation && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Localisation requise
                </span>
              )}
              {type.requiresEvidence && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Preuves requises
                </span>
              )}
              {type.autoAssign && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Attribution auto
                </span>
              )}
            </div>
          </div>
        )}

        {/* Date de création */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Créé le {formatDate(type.createdAt)}</span>
            </div>
            
            {/* Toggle status */}
            <button
              onClick={() => onToggleStatus?.(type.id, type.isActive)}
              className={`
                flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200
                ${type.isActive 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              title={type.isActive ? 'Désactiver' : 'Activer'}
            >
              {type.isActive ? (
                <ToggleRight className="w-3 h-3" />
              ) : (
                <ToggleLeft className="w-3 h-3" />
              )}
              <span>{type.isActive ? 'Actif' : 'Inactif'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeCard; 