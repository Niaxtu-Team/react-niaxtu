import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield } from 'lucide-react';
import { PermissionMatrix } from '../../components';

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
          <div className="flex items-center">
            <span className="bg-purple-100 p-3 rounded-xl shadow text-purple-500">
              <Shield className="w-7 h-7" />
            </span>
            <div className="ml-4">
              <h1 className="text-3xl font-extrabold text-gray-800">Gestion des Permissions</h1>
              <p className="text-gray-600">Configurer les permissions par rôle utilisateur</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <h3 className="font-medium text-red-800">Erreur</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <h3 className="font-medium text-green-800">Succès</h3>
              <p className="text-green-700 mt-1">Les permissions ont été sauvegardées avec succès</p>
            </div>
          </div>
        )}

        {/* Matrice des permissions */}
        <PermissionMatrix
          roles={systemRoles}
          permissions={availablePermissions}
          rolePermissions={rolePermissions}
          onPermissionChange={togglePermission}
          onSave={saveChanges}
          onReset={resetChanges}
          saving={saving}
          hasChanges={hasUnsavedChanges}
        />
      </div>
    </div>
  );
} 
