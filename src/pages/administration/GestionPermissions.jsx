import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, Users, Settings, Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

export default function GestionPermissions() {
  const { apiService, hasPermission, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [changes, setChanges] = useState({});

  // Définition des permissions disponibles
  const availablePermissions = [
    {
      category: 'Plaintes',
      permissions: [
        { key: 'VIEW_COMPLAINTS', label: 'Voir les plaintes', description: 'Consulter la liste des plaintes' },
        { key: 'MANAGE_COMPLAINTS', label: 'Gérer les plaintes', description: 'Modifier le statut et les détails' },
        { key: 'DELETE_COMPLAINTS', label: 'Supprimer les plaintes', description: 'Supprimer définitivement des plaintes' },
        { key: 'ASSIGN_COMPLAINTS', label: 'Assigner les plaintes', description: 'Assigner des plaintes à des agents' }
      ]
    },
    {
      category: 'Configuration',
      permissions: [
        { key: 'MANAGE_COMPLAINT_TYPES', label: 'Gérer les types de plaintes', description: 'Créer et modifier les types' },
        { key: 'CREATE_COMPLAINT_TYPES', label: 'Créer des types de plaintes', description: 'Ajouter de nouveaux types' },
        { key: 'MANAGE_TARGET_TYPES', label: 'Gérer les types de cibles', description: 'Créer et modifier les types de cibles' },
        { key: 'CREATE_TARGET_TYPES', label: 'Créer des types de cibles', description: 'Ajouter de nouveaux types de cibles' },
        { key: 'CREATE_STRUCTURES', label: 'Créer des structures', description: 'Ajouter des ministères, directions, services' },
        { key: 'MANAGE_STRUCTURES', label: 'Gérer les structures', description: 'Modifier les structures existantes' },
        { key: 'CREATE_SECTORS', label: 'Créer des secteurs', description: 'Ajouter des secteurs d\'activité' },
        { key: 'MANAGE_SECTORS', label: 'Gérer les secteurs', description: 'Modifier les secteurs existants' }
      ]
    },
    {
      category: 'Utilisateurs',
      permissions: [
        { key: 'VIEW_USERS', label: 'Voir les utilisateurs', description: 'Consulter la liste des utilisateurs' },
        { key: 'MANAGE_USERS', label: 'Gérer les utilisateurs', description: 'Modifier les profils utilisateurs' },
        { key: 'CREATE_ADMIN', label: 'Créer des administrateurs', description: 'Ajouter de nouveaux administrateurs' },
        { key: 'MANAGE_ADMIN', label: 'Gérer les administrateurs', description: 'Modifier les comptes administrateurs' },
        { key: 'DELETE_ADMIN', label: 'Supprimer des administrateurs', description: 'Supprimer des comptes administrateurs' }
      ]
    },
    {
      category: 'Rapports',
      permissions: [
        { key: 'VIEW_REPORTS', label: 'Voir les rapports', description: 'Consulter les statistiques et rapports' },
        { key: 'CREATE_REPORTS', label: 'Créer des rapports', description: 'Générer de nouveaux rapports' },
        { key: 'EXPORT_DATA', label: 'Exporter les données', description: 'Télécharger les données en Excel/PDF' }
      ]
    },
    {
      category: 'Système',
      permissions: [
        { key: 'MANAGE_PERMISSIONS', label: 'Gérer les permissions', description: 'Modifier les permissions des rôles' },
        { key: 'SYSTEM_SETTINGS', label: 'Paramètres système', description: 'Configurer les paramètres globaux' },
        { key: 'VIEW_AUDIT_LOG', label: 'Voir l\'audit', description: 'Consulter l\'historique des actions' },
        { key: 'BACKUP_RESTORE', label: 'Sauvegarde/Restauration', description: 'Gérer les sauvegardes système' }
      ]
    }
  ];

  // Rôles prédéfinis
  const systemRoles = [
    {
      key: 'super_admin',
      label: 'Super Administrateur',
      description: 'Accès complet à toutes les fonctionnalités',
      color: 'bg-red-100 text-red-800 border-red-200',
      protected: true
    },
    {
      key: 'admin',
      label: 'Administrateur',
      description: 'Gestion générale de la plateforme',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      protected: false
    },
    {
      key: 'moderator',
      label: 'Modérateur',
      description: 'Gestion des plaintes et modération',
      color: 'bg-green-100 text-green-800 border-green-200',
      protected: false
    },
    {
      key: 'analyst',
      label: 'Analyste',
      description: 'Consultation et génération de rapports',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      protected: false
    },
    {
      key: 'structure_manager',
      label: 'Gestionnaire Structure',
      description: 'Gestion des structures et secteurs',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      protected: false
    }
  ];

  // Vérifier les permissions d'accès
  if (!hasRole(['super_admin', 'admin']) && !hasPermission('MANAGE_PERMISSIONS')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions pour gérer les permissions.</p>
        </div>
      </div>
    );
  }

  // Charger les données
  useEffect(() => {
    fetchRolePermissions();
  }, []);

  const fetchRolePermissions = async () => {
    try {
      setLoading(true);
      // Simuler la récupération des permissions par rôle
      // En production, cela viendrait de l'API
      const defaultPermissions = {
        super_admin: availablePermissions.flatMap(cat => cat.permissions.map(p => p.key)),
        admin: [
          'VIEW_COMPLAINTS', 'MANAGE_COMPLAINTS', 'DELETE_COMPLAINTS',
          'MANAGE_COMPLAINT_TYPES', 'CREATE_COMPLAINT_TYPES',
          'MANAGE_TARGET_TYPES', 'CREATE_TARGET_TYPES',
          'CREATE_STRUCTURES', 'MANAGE_STRUCTURES',
          'CREATE_SECTORS', 'MANAGE_SECTORS',
          'VIEW_USERS', 'MANAGE_USERS',
          'VIEW_REPORTS', 'CREATE_REPORTS', 'EXPORT_DATA'
        ],
        moderator: [
          'VIEW_COMPLAINTS', 'MANAGE_COMPLAINTS', 'ASSIGN_COMPLAINTS',
          'VIEW_REPORTS'
        ],
        analyst: [
          'VIEW_COMPLAINTS', 'VIEW_REPORTS', 'CREATE_REPORTS', 'EXPORT_DATA'
        ],
        structure_manager: [
          'CREATE_STRUCTURES', 'MANAGE_STRUCTURES',
          'CREATE_SECTORS', 'MANAGE_SECTORS',
          'VIEW_REPORTS'
        ]
      };

      setRolePermissions(defaultPermissions);
    } catch (error) {
      setError('Erreur lors du chargement des permissions');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modifier une permission pour un rôle
  const togglePermission = (roleKey, permissionKey) => {
    const role = systemRoles.find(r => r.key === roleKey);
    if (role?.protected && roleKey === 'super_admin') {
      return; // Ne pas modifier les permissions du super admin
    }

    setRolePermissions(prev => {
      const rolePerms = prev[roleKey] || [];
      const newPerms = rolePerms.includes(permissionKey)
        ? rolePerms.filter(p => p !== permissionKey)
        : [...rolePerms, permissionKey];
      
      const newRolePermissions = { ...prev, [roleKey]: newPerms };
      
      // Marquer comme modifié
      setChanges(prevChanges => ({
        ...prevChanges,
        [roleKey]: true
      }));
      
      return newRolePermissions;
    });
  };

  // Sauvegarder les modifications
  const saveChanges = async () => {
    try {
      setSaving(true);
      setError(null);

      // En production, envoyer à l'API
      await apiService.put('/admin/permissions', { rolePermissions });

      setSuccess(true);
      setChanges({});
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Erreur lors de la sauvegarde');
      console.error('Erreur:', error);
    } finally {
      setSaving(false);
    }
  };

  // Réinitialiser les modifications
  const resetChanges = () => {
    fetchRolePermissions();
    setChanges({});
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des permissions...</p>
        </div>
      </div>
    );
  }

  const hasUnsavedChanges = Object.keys(changes).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-purple-100 p-3 rounded-xl shadow text-purple-500">
                <Shield className="w-7 h-7" />
              </span>
              <div className="ml-4">
                <h1 className="text-3xl font-extrabold text-gray-800">Gestion des Permissions</h1>
                <p className="text-gray-600">Configurer les permissions par rôle utilisateur</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              {hasUnsavedChanges && (
                <button
                  onClick={resetChanges}
                  className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Annuler
                </button>
              )}
              <button
                onClick={saveChanges}
                disabled={saving || !hasUnsavedChanges}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">Erreur</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">Succès</h3>
              <p className="text-sm text-green-700">Les permissions ont été sauvegardées avec succès</p>
            </div>
          </div>
        )}

        {/* Informations importantes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Settings className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">Informations importantes</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Le rôle "Super Administrateur" ne peut pas être modifié</li>
                <li>• Les modifications sont appliquées immédiatement après sauvegarde</li>
                <li>• Les utilisateurs connectés devront se reconnecter pour voir les changements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tableau des permissions */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/3">
                    Permission
                  </th>
                  {systemRoles.map(role => (
                    <th key={role.key} className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                      <div className="space-y-1">
                        <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${role.color}`}>
                          {role.label}
                        </div>
                        {changes[role.key] && (
                          <div className="w-2 h-2 bg-orange-400 rounded-full mx-auto"></div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availablePermissions.map(category => (
                  <React.Fragment key={category.category}>
                    {/* En-tête de catégorie */}
                    <tr className="bg-gray-100">
                      <td colSpan={systemRoles.length + 1} className="px-6 py-3">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                          {category.category}
                        </h3>
                      </td>
                    </tr>
                    
                    {/* Permissions de la catégorie */}
                    {category.permissions.map(permission => (
                      <tr key={permission.key} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {permission.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {permission.description}
                            </div>
                          </div>
                        </td>
                        {systemRoles.map(role => {
                          const hasPermission = rolePermissions[role.key]?.includes(permission.key) || false;
                          const isProtected = role.protected && role.key === 'super_admin';
                          
                          return (
                            <td key={role.key} className="px-6 py-4 text-center">
                              <label className="inline-flex items-center">
                                <input
                                  type="checkbox"
                                  checked={hasPermission}
                                  onChange={() => togglePermission(role.key, permission.key)}
                                  disabled={isProtected}
                                  className="text-purple-600 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé des rôles */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemRoles.map(role => {
            const permCount = rolePermissions[role.key]?.length || 0;
            const totalPerms = availablePermissions.reduce((acc, cat) => acc + cat.permissions.length, 0);
            
            return (
              <div key={role.key} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${role.color}`}>
                    {role.label}
                  </div>
                  {changes[role.key] && (
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Permissions:</span>
                  <span className="font-medium text-gray-900">{permCount}/{totalPerms}</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(permCount / totalPerms) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
