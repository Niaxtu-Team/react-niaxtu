import { CheckCircle, Clock, AlertTriangle, XCircle, Play, Pause } from 'lucide-react';

const StatusBadge = ({ 
  status, 
  size = "medium",
  showIcon = true,
  className = "",
  animated = false,
  customColors = {}
}) => {
  // Configuration des statuts par défaut
  const statusConfig = {
    'en-attente': {
      label: 'En attente',
      color: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300',
      icon: Clock,
      pulse: true
    },
    'en-traitement': {
      label: 'En traitement',
      color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
      icon: Play,
      pulse: false
    },
    'resolue': {
      label: 'Résolue',
      color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
      icon: CheckCircle,
      pulse: false
    },
    'rejetee': {
      label: 'Rejetée',
      color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
      icon: XCircle,
      pulse: false
    },
    'suspendue': {
      label: 'Suspendue',
      color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300',
      icon: Pause,
      pulse: false
    },
    'active': {
      label: 'Actif',
      color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
      icon: CheckCircle,
      pulse: false
    },
    'inactive': {
      label: 'Inactif',
      color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300',
      icon: XCircle,
      pulse: false
    },
    'critique': {
      label: 'Critique',
      color: 'bg-gradient-to-r from-red-200 to-red-300 text-red-900 border-red-400',
      icon: AlertTriangle,
      pulse: true
    },
    ...customColors
  };

  // Tailles
  const sizeConfig = {
    small: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3'
    },
    medium: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4'
    },
    large: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5'
    }
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig['en-attente'];
  const sizeClasses = sizeConfig[size];
  const IconComponent = config.icon;

  return (
    <span 
      className={`
        inline-flex items-center font-semibold border rounded-full shadow-sm
        ${config.color}
        ${sizeClasses.container}
        ${animated && config.pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {showIcon && IconComponent && (
        <IconComponent className={`${sizeClasses.icon} mr-1`} />
      )}
      {config.label}
    </span>
  );
};

// Composant pour les badges de priorité
export const PriorityBadge = ({ 
  priority, 
  size = "medium",
  showIcon = true,
  className = "",
  animated = false
}) => {
  const priorityConfig = {
    'faible': {
      label: 'Faible',
      color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300',
      icon: null,
      pulse: false
    },
    'normale': {
      label: 'Normale',
      color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300',
      icon: null,
      pulse: false
    },
    'moyenne': {
      label: 'Moyenne',
      color: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border-orange-300',
      icon: null,
      pulse: false
    },
    'elevee': {
      label: 'Élevée',
      color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300',
      icon: AlertTriangle,
      pulse: false
    },
    'critique': {
      label: 'Critique',
      color: 'bg-gradient-to-r from-red-200 to-red-300 text-red-800 border-red-400',
      icon: AlertTriangle,
      pulse: true
    }
  };

  return (
    <StatusBadge 
      status={priority}
      size={size}
      showIcon={showIcon}
      className={className}
      animated={animated}
      customColors={priorityConfig}
    />
  );
};

// Composant pour les badges de rôle
export const RoleBadge = ({ 
  role, 
  size = "medium",
  showIcon = true,
  className = "",
  animated = false
}) => {
  const roleConfig = {
    'super_admin': {
      label: 'Super Admin',
      color: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400',
      icon: AlertTriangle,
      pulse: false
    },
    'admin': {
      label: 'Admin',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400',
      icon: CheckCircle,
      pulse: false
    },
    'moderator': {
      label: 'Modérateur',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400',
      icon: Play,
      pulse: false
    },
    'user': {
      label: 'Utilisateur',
      color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
      icon: CheckCircle,
      pulse: false
    }
  };

  return (
    <StatusBadge 
      status={role}
      size={size}
      showIcon={showIcon}
      className={className}
      animated={animated}
      customColors={roleConfig}
    />
  );
};

export default StatusBadge; 