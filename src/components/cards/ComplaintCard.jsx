import { 
  Clock, 
  AlertTriangle, 
  Eye, 
  Play, 
  CheckCircle,
  XCircle,
  MapPin,
  User,
  Building,
  Calendar,
  FileText,
  Zap,
  TrendingUp
} from 'lucide-react';
import { ActionButtons, StatusBadge, PriorityBadge } from '../index';

const ComplaintCard = ({
  complaint,
  onView,
  onStartTreatment,
  onResolve,
  onReject,
  onDelete,
  showActions = true,
  showPriority = true,
  showLocation = true,
  showTimestamp = true,
  className = ""
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const created = new Date(dateString);
    const diffHours = Math.floor((now - created) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en-attente':
        return 'warning';
      case 'en-traitement':
        return 'info';
      case 'resolue':
        return 'success';
      case 'rejetee':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en-attente':
        return 'En attente';
      case 'en-traitement':
        return 'En traitement';
      case 'resolue':
        return 'Résolue';
      case 'rejetee':
        return 'Rejetée';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critique':
      case 'urgente':
        return 'error';
      case 'elevee':
        return 'warning';
      case 'moyenne':
        return 'info';
      case 'faible':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'critique':
        return 'Critique';
      case 'urgente':
        return 'Urgente';
      case 'elevee':
        return 'Élevée';
      case 'moyenne':
        return 'Moyenne';
      case 'faible':
        return 'Faible';
      default:
        return priority;
    }
  };

  const getUrgencyIndicator = (priority, createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffHours = Math.floor((now - created) / (1000 * 60 * 60));
    
    const isUrgent = priority === 'critique' || priority === 'urgente';
    const isOld = diffHours > 72; // Plus de 3 jours
    
    if (isUrgent && isOld) {
      return { show: true, color: 'text-red-600', icon: Zap, pulse: true };
    } else if (isUrgent) {
      return { show: true, color: 'text-orange-600', icon: AlertTriangle, pulse: false };
    } else if (isOld) {
      return { show: true, color: 'text-yellow-600', icon: Clock, pulse: false };
    }
    
    return { show: false };
  };

  const urgencyIndicator = getUrgencyIndicator(complaint.priority, complaint.createdAt);

  // Configuration des actions selon le statut
  const getActions = () => {
    const actions = [
      { type: 'view', onClick: () => onView?.(complaint) }
    ];

    switch (complaint.status) {
      case 'en-attente':
        if (onStartTreatment) {
          actions.push({ 
            type: 'custom', 
            icon: Play, 
            label: 'Traiter',
            onClick: () => onStartTreatment(complaint.id),
            color: 'blue'
          });
        }
        break;
      case 'en-traitement':
        if (onResolve) {
          actions.push({ 
            type: 'custom', 
            icon: CheckCircle, 
            label: 'Résoudre',
            onClick: () => onResolve(complaint.id),
            color: 'green'
          });
        }
        if (onReject) {
          actions.push({ 
            type: 'custom', 
            icon: XCircle, 
            label: 'Rejeter',
            onClick: () => onReject(complaint.id),
            color: 'red'
          });
        }
        break;
    }

    if (onDelete) {
      actions.push({ type: 'delete', onClick: () => onDelete(complaint.id) });
    }

    return actions;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 relative ${className}`}>
      {/* Indicateur d'urgence */}
      {urgencyIndicator.show && (
        <div className={`absolute top-4 right-4 ${urgencyIndicator.color} ${urgencyIndicator.pulse ? 'animate-pulse' : ''}`}>
          <urgencyIndicator.icon className="w-5 h-5" />
        </div>
      )}

      {/* En-tête avec statut et priorité */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-medium text-gray-900">
                #{complaint.id?.slice(-8) || 'N/A'}
              </h3>
              <StatusBadge 
                status={getStatusText(complaint.status)}
                variant={getStatusColor(complaint.status)}
              />
            </div>
            {showPriority && complaint.priority && (
              <PriorityBadge 
                priority={getPriorityText(complaint.priority)}
                variant={getPriorityColor(complaint.priority)}
              />
            )}
          </div>
        </div>

        {showActions && (
          <ActionButtons 
            actions={getActions()}
            variant="compact"
            size="small"
          />
        )}
      </div>

      {/* Type de plainte */}
      <div className="mb-3">
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <AlertTriangle className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium">Type:</span>
          <span className="ml-1">{complaint.complaintType || 'Non spécifié'}</span>
        </div>
        {complaint.targetType && (
          <div className="flex items-center text-sm text-gray-600">
            <Building className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Cible:</span>
            <span className="ml-1">{complaint.targetType}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm line-clamp-3">
          {complaint.description || 'Aucune description disponible'}
        </p>
      </div>

      {/* Informations du citoyen */}
      <div className="space-y-2 mb-4">
        {complaint.citizenName && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Citoyen:</span>
            <span className="ml-1">{complaint.citizenName}</span>
          </div>
        )}
        
        {showLocation && complaint.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Lieu:</span>
            <span className="ml-1 line-clamp-1">{complaint.location}</span>
          </div>
        )}

        {complaint.publicStructure && (
          <div className="flex items-center text-sm text-gray-600">
            <Building className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Structure:</span>
            <span className="ml-1 line-clamp-1">
              {complaint.publicStructure.ministereName || complaint.publicStructure.name}
            </span>
          </div>
        )}
      </div>

      {/* Pièces jointes */}
      {complaint.attachments && complaint.attachments.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Pièces jointes:</span>
            <span className="ml-1">{complaint.attachments.length} fichier(s)</span>
          </div>
        </div>
      )}

      {/* Pied de carte avec timestamp */}
      {showTimestamp && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Créée le {formatDate(complaint.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{getTimeAgo(complaint.createdAt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintCard; 