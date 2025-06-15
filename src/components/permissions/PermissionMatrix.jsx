import { useState } from 'react';
import { 
  Shield, 
  Check, 
  X, 
  Lock, 
  Unlock,
  AlertTriangle,
  Save,
  RotateCcw,
  Info
} from 'lucide-react';

const PermissionMatrix = ({
  roles = [],
  permissions = [],
  rolePermissions = {},
  onPermissionChange,
  onSave,
  onReset,
  saving = false,
  hasChanges = false,
  readOnly = false,
  className = ""
}) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Grouper les permissions par catégorie
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const hasPermission = (roleKey, permissionKey) => {
    return rolePermissions[roleKey]?.includes(permissionKey) || false;
  };

  const getRoleIcon = (role) => {
    if (role.protected) return Lock;
    return Shield;
  };

  const getPermissionCount = (roleKey) => {
    return rolePermissions[roleKey]?.length || 0;
  };

  const getCategoryPermissionCount = (roleKey, category) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    return categoryPermissions.filter(perm => 
      hasPermission(roleKey, perm.key)
    ).length;
  };

  const toggleAllCategoryPermissions = (roleKey, category, enable) => {
    if (readOnly || roles.find(r => r.key === roleKey)?.protected) return;
    
    const categoryPermissions = permissionsByCategory[category] || [];
    categoryPermissions.forEach(permission => {
      if (hasPermission(roleKey, permission.key) !== enable) {
        onPermissionChange(roleKey, permission.key);
      }
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* En-tête avec actions */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Matrice des Permissions</h3>
              <p className="text-gray-600">Gérer les permissions par rôle</p>
            </div>
          </div>

          {!readOnly && (
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <button
                  onClick={onReset}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Annuler</span>
                </button>
              )}
              
              <button
                onClick={onSave}
                disabled={saving || !hasChanges}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Résumé des rôles */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map(role => {
            const RoleIcon = getRoleIcon(role);
            const permissionCount = getPermissionCount(role.key);
            const totalPermissions = permissions.length;

            return (
              <div
                key={role.key}
                className={`
                  p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${selectedRole === role.key 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }
                `}
                onClick={() => setSelectedRole(selectedRole === role.key ? null : role.key)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${role.color}`}>
                    <RoleIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{role.label}</h4>
                    {role.protected && (
                      <div className="flex items-center text-xs text-amber-600 mt-1">
                        <Lock className="w-3 h-3 mr-1" />
                        Protégé
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>Permissions:</span>
                    <span className="font-semibold">{permissionCount}/{totalPermissions}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(permissionCount / totalPermissions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matrice des permissions */}
      <div className="p-6">
        {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
          const isExpanded = expandedCategories[category] !== false; // Par défaut ouvert

          return (
            <div key={category} className="mb-6 last:mb-0">
              {/* En-tête de catégorie */}
              <div 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center space-x-3">
                  <h4 className="font-semibold text-gray-900">{category}</h4>
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                    {categoryPermissions.length} permission{categoryPermissions.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Résumé par rôle */}
                  {selectedRole ? (
                    <div className="flex items-center space-x-2 mr-4">
                      <span className="text-sm text-gray-600">
                        {getCategoryPermissionCount(selectedRole, category)}/{categoryPermissions.length}
                      </span>
                      {!readOnly && !roles.find(r => r.key === selectedRole)?.protected && (
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAllCategoryPermissions(selectedRole, category, true);
                            }}
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                            title="Tout autoriser"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAllCategoryPermissions(selectedRole, category, false);
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            title="Tout interdire"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex space-x-1 mr-4">
                      {roles.slice(0, 3).map(role => (
                        <div key={role.key} className="text-xs text-gray-500">
                          {getCategoryPermissionCount(role.key, category)}/{categoryPermissions.length}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </div>
                </div>
              </div>

              {/* Liste des permissions */}
              {isExpanded && (
                <div className="mt-4 space-y-2">
                  {categoryPermissions.map(permission => (
                    <div key={permission.key} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h5 className="font-medium text-gray-900">{permission.label}</h5>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-mono">
                              {permission.key}
                            </span>
                          </div>
                          {permission.description && (
                            <p className="text-sm text-gray-600">{permission.description}</p>
                          )}
                        </div>

                        {/* Checkboxes par rôle */}
                        <div className="flex items-center space-x-4 ml-6">
                          {(selectedRole ? [roles.find(r => r.key === selectedRole)] : roles).map(role => {
                            if (!role) return null;
                            
                            const hasThisPermission = hasPermission(role.key, permission.key);
                            const isDisabled = readOnly || role.protected;

                            return (
                              <div key={role.key} className="flex flex-col items-center space-y-1">
                                <span className="text-xs text-gray-500 truncate w-16 text-center">
                                  {role.label}
                                </span>
                                <button
                                  onClick={() => !isDisabled && onPermissionChange(role.key, permission.key)}
                                  disabled={isDisabled}
                                  className={`
                                    w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                                    ${hasThisPermission 
                                      ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' 
                                      : 'border-gray-300 text-gray-400 hover:border-gray-400'
                                    }
                                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                  `}
                                  title={isDisabled ? 'Permissions protégées' : (hasThisPermission ? 'Retirer la permission' : 'Accorder la permission')}
                                >
                                  {hasThisPermission && <Check className="w-3 h-3" />}
                                  {isDisabled && <Lock className="w-3 h-3" />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer informatif */}
      <div className="p-4 bg-blue-50 border-t border-blue-200 rounded-b-xl">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informations importantes :</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Les rôles protégés (comme Super Admin) ne peuvent pas être modifiés</li>
              <li>• Cliquez sur un rôle pour le sélectionner et voir uniquement ses permissions</li>
              <li>• Utilisez les boutons ✓/✗ pour activer/désactiver toutes les permissions d'une catégorie</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrix; 