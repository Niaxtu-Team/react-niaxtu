import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Download, 
  Share, 
  Copy,
  Archive,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ActionButtons = ({ 
  actions = [],
  size = "medium",
  variant = "default", // default, compact, dropdown
  className = "",
  disabled = false
}) => {
  const sizeConfig = {
    small: {
      button: "p-1.5",
      icon: "w-3 h-3"
    },
    medium: {
      button: "p-2",
      icon: "w-4 h-4"
    },
    large: {
      button: "p-3",
      icon: "w-5 h-5"
    }
  };

  const actionConfig = {
    view: {
      icon: Eye,
      label: 'Voir',
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
      title: 'Voir les détails'
    },
    edit: {
      icon: Edit,
      label: 'Modifier',
      color: 'text-green-600 hover:text-green-700 hover:bg-green-50',
      title: 'Modifier'
    },
    delete: {
      icon: Trash2,
      label: 'Supprimer',
      color: 'text-red-600 hover:text-red-700 hover:bg-red-50',
      title: 'Supprimer'
    },
    download: {
      icon: Download,
      label: 'Télécharger',
      color: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50',
      title: 'Télécharger'
    },
    share: {
      icon: Share,
      label: 'Partager',
      color: 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50',
      title: 'Partager'
    },
    copy: {
      icon: Copy,
      label: 'Copier',
      color: 'text-gray-600 hover:text-gray-700 hover:bg-gray-50',
      title: 'Copier'
    },
    archive: {
      icon: Archive,
      label: 'Archiver',
      color: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50',
      title: 'Archiver'
    },
    refresh: {
      icon: RefreshCw,
      label: 'Actualiser',
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
      title: 'Actualiser'
    },
    send: {
      icon: Send,
      label: 'Envoyer',
      color: 'text-green-600 hover:text-green-700 hover:bg-green-50',
      title: 'Envoyer'
    },
    approve: {
      icon: CheckCircle,
      label: 'Approuver',
      color: 'text-green-600 hover:text-green-700 hover:bg-green-50',
      title: 'Approuver'
    },
    reject: {
      icon: XCircle,
      label: 'Rejeter',
      color: 'text-red-600 hover:text-red-700 hover:bg-red-50',
      title: 'Rejeter'
    }
  };

  const sizeClasses = sizeConfig[size];

  if (variant === "dropdown") {
    return (
      <div className={`relative group ${className}`}>
        <button
          className={`
            ${sizeClasses.button} rounded-lg border border-gray-200 
            text-gray-600 hover:text-gray-700 hover:bg-gray-50 
            transition-colors duration-200 
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={disabled}
        >
          <MoreVertical className={sizeClasses.icon} />
        </button>
        
        {/* Menu déroulant */}
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          {actions.map((action, index) => {
            const config = actionConfig[action.type] || { icon: action.icon, label: action.label, color: 'text-gray-600' };
            const IconComponent = config.icon;
            
            return (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled || disabled}
                className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg last:rounded-b-lg"
              >
                <IconComponent className="w-4 h-4 mr-3" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {actions.map((action, index) => {
          const config = actionConfig[action.type] || { icon: action.icon, color: 'text-gray-600' };
          const IconComponent = config.icon;
          
          return (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled || disabled}
              title={config.title || action.title}
              className={`
                ${sizeClasses.button} rounded-lg transition-colors duration-200 
                ${config.color}
                ${disabled || action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <IconComponent className={sizeClasses.icon} />
            </button>
          );
        })}
      </div>
    );
  }

  // Variant par défaut avec labels
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {actions.map((action, index) => {
        const config = actionConfig[action.type] || { 
          icon: action.icon, 
          label: action.label, 
          color: 'text-gray-600 hover:text-gray-700 hover:bg-gray-50' 
        };
        const IconComponent = config.icon;
        
        return (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled || disabled}
            title={config.title || action.title}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 
              transition-colors duration-200 text-sm font-medium
              ${config.color}
              ${disabled || action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <IconComponent className={sizeClasses.icon} />
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Composant pour les actions en masse
export const BulkActions = ({ 
  selectedCount = 0,
  actions = [],
  onClearSelection,
  className = ""
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} élément{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Désélectionner tout
          </button>
        </div>
        
        <ActionButtons 
          actions={actions}
          size="small"
          variant="compact"
        />
      </div>
    </div>
  );
};

export default ActionButtons; 