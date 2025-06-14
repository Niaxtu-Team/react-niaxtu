import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  icon: Icon,
  className = '',
  onClick
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm';
      case 'danger':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 shadow-sm';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300 shadow-sm';
      case 'info':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 shadow-sm';
      case 'purple':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300 shadow-sm';
      case 'pink':
        return 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-300 shadow-sm';
      case 'indigo':
        return 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300 shadow-sm';
      case 'gray':
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm';
      case 'dark':
        return 'bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-gray-700 shadow-sm';
      case 'outline':
        return 'bg-transparent text-gray-700 border-2 border-gray-300 hover:bg-gray-50';
      default:
        return 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300 shadow-sm';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const baseClasses = `
    inline-flex items-center rounded-full font-semibold
    transition-all duration-200 transform hover:scale-105
    ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
  `;

  return (
    <span 
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      onClick={onClick}
    >
      {Icon && <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />}
      {children}
    </span>
  );
};

// Badge de statut spécialisé
export const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'actif':
      case 'en ligne':
      case 'connecté':
      case 'validé':
      case 'approuvé':
      case 'résolu':
      case 'terminé':
        return { variant: 'success', text: status };
      
      case 'inactive':
      case 'inactif':
      case 'hors ligne':
      case 'déconnecté':
      case 'rejeté':
      case 'refusé':
      case 'annulé':
        return { variant: 'danger', text: status };
      
      case 'en attente':
      case 'pending':
      case 'en cours':
      case 'processing':
      case 'en traitement':
        return { variant: 'warning', text: status };
      
      case 'nouveau':
      case 'new':
      case 'draft':
      case 'brouillon':
        return { variant: 'info', text: status };
      
      default:
        return { variant: 'gray', text: status || 'Inconnu' };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  );
};

// Badge de priorité
export const PriorityBadge = ({ priority, className = '' }) => {
  const getPriorityConfig = () => {
    switch (priority?.toLowerCase()) {
      case 'critique':
      case 'critical':
      case 'urgent':
        return { 
          variant: 'danger', 
          text: priority,
          className: 'animate-pulse'
        };
      
      case 'élevée':
      case 'high':
      case 'haute':
        return { variant: 'warning', text: priority };
      
      case 'moyenne':
      case 'medium':
      case 'normale':
        return { variant: 'info', text: priority };
      
      case 'faible':
      case 'low':
      case 'basse':
        return { variant: 'gray', text: priority };
      
      default:
        return { variant: 'gray', text: priority || 'Non définie' };
    }
  };

  const config = getPriorityConfig();

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className || ''} ${className}`}
    >
      {config.text}
    </Badge>
  );
};

// Badge de rôle
export const RoleBadge = ({ role, className = '' }) => {
  const getRoleConfig = () => {
    switch (role?.toLowerCase()) {
      case 'super_admin':
      case 'super admin':
        return { variant: 'danger', text: 'Super Admin' };
      
      case 'admin':
      case 'administrateur':
        return { variant: 'purple', text: 'Admin' };
      
      case 'moderator':
      case 'modérateur':
        return { variant: 'indigo', text: 'Modérateur' };
      
      case 'user':
      case 'utilisateur':
        return { variant: 'info', text: 'Utilisateur' };
      
      case 'guest':
      case 'invité':
        return { variant: 'gray', text: 'Invité' };
      
      default:
        return { variant: 'gray', text: role || 'Inconnu' };
    }
  };

  const config = getRoleConfig();

  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  );
};

// Badge avec compteur
export const CountBadge = ({ count, maxCount = 99, className = '' }) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count;
  
  return (
    <Badge 
      variant="danger" 
      size="sm" 
      className={`min-w-[20px] h-5 flex items-center justify-center ${className}`}
    >
      {displayCount}
    </Badge>
  );
};

// Badge de notification
export const NotificationBadge = ({ 
  count, 
  show = true, 
  className = '',
  position = 'top-right' 
}) => {
  if (!show || count === 0) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return '-top-2 -left-2';
      case 'top-right':
        return '-top-2 -right-2';
      case 'bottom-left':
        return '-bottom-2 -left-2';
      case 'bottom-right':
        return '-bottom-2 -right-2';
      default:
        return '-top-2 -right-2';
    }
  };

  return (
    <span 
      className={`
        absolute ${getPositionClasses()} 
        bg-red-500 text-white text-xs font-bold 
        rounded-full min-w-[18px] h-[18px] 
        flex items-center justify-center
        animate-pulse shadow-lg
        ${className}
      `}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default Badge; 
