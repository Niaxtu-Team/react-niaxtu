import { 
  Building, 
  Building2, 
  Landmark, 
  Layers,
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BarChart3,
  Users,
  Hash
} from 'lucide-react';
import { ActionButtons, StatusBadge } from '../index';

const StructureCard = ({
  structure,
  type = 'structure', // 'ministere', 'direction', 'service', 'secteur', 'sous-secteur'
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  showStats = true,
  showContact = true,
  showLocation = false,
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

  const getTypeIcon = (structureType) => {
    switch (structureType) {
      case 'ministere':
        return Landmark;
      case 'direction':
        return Building2;
      case 'service':
        return Building;
      case 'secteur':
        return Layers;
      case 'sous-secteur':
        return Layers;
      default:
        return Building;
    }
  };

  const getTypeColor = (structureType) => {
    switch (structureType) {
      case 'ministere':
        return 'bg-purple-100 text-purple-600';
      case 'direction':
        return 'bg-blue-100 text-blue-600';
      case 'service':
        return 'bg-green-100 text-green-600';
      case 'secteur':
        return 'bg-orange-100 text-orange-600';
      case 'sous-secteur':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const TypeIcon = getTypeIcon(type);
  const typeColorClass = getTypeColor(type);

  const actions = [
    { type: 'view', onClick: () => onView?.(structure) },
    { type: 'edit', onClick: () => onEdit?.(structure) },
    { type: 'delete', onClick: () => onDelete?.(structure) }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* En-tête avec icône et statut */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`p-3 rounded-xl ${typeColorClass}`}>
            <TypeIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {structure.nom || structure.name}
              </h3>
              <StatusBadge 
                status={getStatusText(structure.actif ?? structure.isActive)}
                variant={getStatusColor(structure.actif ?? structure.isActive)}
              />
            </div>
            
            {structure.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {structure.description}
              </p>
            )}
          </div>
        </div>

        <ActionButtons 
          actions={actions}
          variant="compact"
          size="small"
        />
      </div>

      {/* Métadonnées */}
      <div className="space-y-3">
        {/* Code et hiérarchie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {structure.code && (
            <div className="flex items-center text-sm text-gray-600">
              <Hash className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Code:</span>
              <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                {structure.code}
              </span>
            </div>
          )}
          
          {/* Ministère parent (pour directions/services) */}
          {structure.ministere && (
            <div className="flex items-center text-sm text-gray-600">
              <Landmark className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Ministère:</span>
              <span className="ml-1 truncate">{structure.ministere}</span>
            </div>
          )}

          {/* Direction parent (pour services) */}
          {structure.direction && (
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Direction:</span>
              <span className="ml-1 truncate">{structure.direction}</span>
            </div>
          )}

          {/* Secteur parent (pour sous-secteurs) */}
          {structure.secteur && (
            <div className="flex items-center text-sm text-gray-600">
              <Layers className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Secteur:</span>
              <span className="ml-1 truncate">{structure.secteur}</span>
            </div>
          )}
        </div>

        {/* Contact */}
        {showContact && structure.contact && (
          <div className="space-y-2">
            {structure.contact.telephone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">Tél:</span>
                <span className="ml-1">{structure.contact.telephone}</span>
              </div>
            )}
            {structure.contact.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">Email:</span>
                <span className="ml-1 truncate">{structure.contact.email}</span>
              </div>
            )}
            {structure.contact.adresse && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">Adresse:</span>
                <span className="ml-1 line-clamp-1">{structure.contact.adresse}</span>
              </div>
            )}
          </div>
        )}

        {/* Localisation (pour services) */}
        {showLocation && structure.localisation && structure.localisation.adresse && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Localisation:</span>
            <span className="ml-1 line-clamp-1">{structure.localisation.adresse}</span>
          </div>
        )}

        {/* Responsable */}
        {structure.responsable && (
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Responsable:</span>
            <span className="ml-1">{structure.responsable}</span>
          </div>
        )}

        {/* Statistiques */}
        {showStats && (
          <div className="pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              {structure.nombrePlaintes !== undefined && (
                <div className="flex items-center text-sm">
                  <BarChart3 className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-600 mr-1">Plaintes:</span>
                  <span className="font-semibold text-gray-900">{structure.nombrePlaintes}</span>
                </div>
              )}
              
              {structure.nombreDirections !== undefined && (
                <div className="flex items-center text-sm">
                  <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-600 mr-1">Directions:</span>
                  <span className="font-semibold text-gray-900">{structure.nombreDirections}</span>
                </div>
              )}

              {structure.nombreServices !== undefined && (
                <div className="flex items-center text-sm">
                  <Building className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-600 mr-1">Services:</span>
                  <span className="font-semibold text-gray-900">{structure.nombreServices}</span>
                </div>
              )}

              {structure.nombreSousSecteurs !== undefined && (
                <div className="flex items-center text-sm">
                  <Layers className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-600 mr-1">Sous-secteurs:</span>
                  <span className="font-semibold text-gray-900">{structure.nombreSousSecteurs}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Date de création et toggle */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Créé le {formatDate(structure.dateCreation || structure.createdAt)}</span>
            </div>
            
            {/* Toggle status */}
            <button
              onClick={() => onToggleStatus?.(structure.id, structure.actif ?? structure.isActive)}
              className={`
                flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200
                ${(structure.actif ?? structure.isActive)
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              title={(structure.actif ?? structure.isActive) ? 'Désactiver' : 'Activer'}
            >
              {(structure.actif ?? structure.isActive) ? (
                <ToggleRight className="w-3 h-3" />
              ) : (
                <ToggleLeft className="w-3 h-3" />
              )}
              <span>{(structure.actif ?? structure.isActive) ? 'Actif' : 'Inactif'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructureCard; 