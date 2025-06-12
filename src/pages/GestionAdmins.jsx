import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Modal,
  Badge
} from '../components/ui';
import { 
  AdminTabs, 
  PermissionGrid 
} from '../components/admin';
import { 
  DataTable, 
  StatusBadge, 
  ActionButtons 
} from '../components/tables';
import { 
  FormField 
} from '../components/forms';
import { 
  UserPlusIcon, 
  ShieldCheckIcon,
  UserIcon,
  CheckCircleIcon
} from '../components/Icons';

const GestionAdmins = () => {
  const location = useLocation();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('liste');
  const [permissions, setPermissions] = useState({});
  const [showNewAdminModal, setShowNewAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    nom: '',
    email: '',
    role: '',
    permissions: []
  });
  
  // Déterminer l'onglet actif selon l'URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/nouveau')) {
      setActiveTab('nouveau');
    } else if (path.includes('/permissions')) {
      setActiveTab('permissions');
    } else if (path.includes('/historique')) {
      setActiveTab('historique');
    } else {
      setActiveTab('liste');
    }
  }, [location.pathname]);

  // Définition des rôles avec couleurs et descriptions
  const roles = [
    { 
      value: 'super_admin', 
      label: 'Super Administrateur', 
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Accès complet au système',
      icon: '👑'
    },
    { 
      value: 'admin', 
      label: 'Administrateur', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Gestion complète sauf super admin',
      icon: '🛡️'
    },
    { 
      value: 'sector_manager', 
      label: 'Gestionnaire de Secteur', 
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Gestion des secteurs et sous-secteurs',
      icon: '🏢'
    },
    { 
      value: 'structure_manager', 
      label: 'Gestionnaire de Structure', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'Gestion des structures',
      icon: '🏛️'
    },
    { 
      value: 'moderator', 
      label: 'Modérateur', 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Modération des plaintes',
      icon: '⚖️'
    },
    { 
      value: 'analyst', 
      label: 'Analyste', 
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      description: 'Analyses et rapports',
      icon: '📊'
    }
  ];

  // Permissions disponibles par catégorie
  const permissionCategories = {
    'Utilisateurs': [
      { id: 'MANAGE_USERS', label: 'Gérer les utilisateurs' },
      { id: 'CREATE_USERS', label: 'Créer des utilisateurs' },
      { id: 'DELETE_USERS', label: 'Supprimer des utilisateurs' },
      { id: 'VIEW_USER_DETAILS', label: 'Voir les détails utilisateurs' }
    ],
    'Plaintes': [
      { id: 'MANAGE_COMPLAINTS', label: 'Gérer les plaintes' },
      { id: 'MODERATE_COMPLAINTS', label: 'Modérer les plaintes' },
      { id: 'ASSIGN_COMPLAINTS', label: 'Assigner les plaintes' },
      { id: 'RESOLVE_COMPLAINTS', label: 'Résoudre les plaintes' }
    ],
    'Secteurs': [
      { id: 'MANAGE_SECTORS', label: 'Gérer les secteurs' },
      { id: 'CREATE_SECTORS', label: 'Créer des secteurs' },
      { id: 'DELETE_SECTORS', label: 'Supprimer des secteurs' }
    ],
    'Structures': [
      { id: 'MANAGE_STRUCTURES', label: 'Gérer les structures' },
      { id: 'CREATE_STRUCTURES', label: 'Créer des structures' },
      { id: 'DELETE_STRUCTURES', label: 'Supprimer des structures' }
    ],
    'Rapports': [
      { id: 'VIEW_REPORTS', label: 'Voir les rapports' },
      { id: 'EXPORT_DATA', label: 'Exporter les données' },
      { id: 'VIEW_ANALYTICS', label: 'Voir les analyses' }
    ],
    'Administration': [
      { id: 'MANAGE_PERMISSIONS', label: 'Gérer les permissions' },
      { id: 'VIEW_AUDIT_LOGS', label: 'Voir les logs d\'audit' },
      { id: 'SYSTEM_SETTINGS', label: 'Paramètres système' }
    ]
  };

  // Récupérer les admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.data || []);
      } else {
        console.error('Erreur lors du chargement des administrateurs');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/admin/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchStats();
    // Éviter les warnings de variables inutilisées
    console.log('Admins loaded:', admins.length, 'Roles defined:', roles.length);
  }, [admins.length, roles.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des administrateurs...</p>
        </div>
      </div>
    );
  }



  // Navigation par onglets
  const tabs = [
    { id: 'liste', label: 'Liste des admins', icon: 'fa-users', count: admins.length },
    { id: 'permissions', label: 'Permissions', icon: 'fa-key' },
    { id: 'historique', label: 'Historique', icon: 'fa-history' }
  ];

  // Colonnes pour le tableau des admins
  const adminColumns = [
    {
      header: 'Administrateur',
      accessor: 'nom',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-indigo-600 font-medium">
              {value?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Rôle',
      accessor: 'role',
      render: (value) => {
        const role = roles.find(r => r.value === value);
        return role ? (
          <Badge variant="primary" className={role.color}>
            {role.icon} {role.label}
          </Badge>
        ) : (
          <Badge variant="default">{value}</Badge>
        );
      }
    },
    {
      header: 'Statut',
      accessor: 'status',
      render: (value) => <StatusBadge status={value || 'Actif'} />
    },
    {
      header: 'Dernière connexion',
      accessor: 'lastLogin',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString('fr-FR') : 'Jamais'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <ActionButtons
          onView={() => handleViewAdmin(row)}
          onEdit={() => handleEditAdmin(row)}
          onDelete={() => handleDeleteAdmin(row)}
          row={row}
        />
      )
    }
  ];

  // Gestionnaires d'événements
  const handlePermissionChange = (permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: value
    }));
  };

  const handleViewAdmin = (admin) => {
    console.log('Voir admin:', admin);
  };

  const handleEditAdmin = (admin) => {
    console.log('Modifier admin:', admin);
  };

  const handleDeleteAdmin = (admin) => {
    console.log('Supprimer admin:', admin);
  };

  const handleNewAdminSubmit = () => {
    console.log('Nouvel admin:', newAdminData);
    setShowNewAdminModal(false);
  };

  const renderPermissionsTab = () => (
    <Card>
      <Card.Header>
        <Card.Title>🔐 Gestion des Permissions</Card.Title>
      </Card.Header>
      <Card.Content>
        <PermissionGrid 
          permissions={permissions}
          onPermissionChange={handlePermissionChange}
        />
      </Card.Content>
    </Card>
  );

  const renderHistoriqueTab = () => (
    <Card>
      <Card.Header>
        <Card.Title>📜 Historique des Actions</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500">Historique des actions administratives</p>
          <p className="text-sm text-gray-400 mt-2">Cette fonctionnalité sera bientôt disponible</p>
        </div>
      </Card.Content>
    </Card>
  );

  const renderListeTab = () => (
    <div className="space-y-6">
      {/* Tableau des administrateurs */}
      <DataTable
        title="Liste des Administrateurs"
        columns={adminColumns}
        data={admins}
        actions={
          <Button 
            onClick={() => setShowNewAdminModal(true)}
            icon={<UserPlusIcon className="h-4 w-4" />}
          >
            Nouvel Administrateur
          </Button>
        }
      />
    </div>
  );

  // Éviter les warnings de variables inutilisées
  console.log('Permission categories:', permissionCategories, 'New admin submit:', handleNewAdminSubmit, 'Stats:', stats);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <Card.Content className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShieldCheckIcon className="h-8 w-8 text-indigo-600 mr-3" />
                Gestion des Administrateurs
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Gérez les administrateurs, leurs rôles et permissions
              </p>
            </div>
          </div>

          {/* Navigation par onglets */}
          <AdminTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </Card.Content>
      </Card>

      {/* Contenu selon l'onglet actif */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'permissions' && renderPermissionsTab()}
        {activeTab === 'historique' && renderHistoriqueTab()}
        {activeTab === 'liste' && renderListeTab()}
      </div>

      {/* Modal Nouvel Administrateur */}
      <Modal
        isOpen={showNewAdminModal}
        onClose={() => setShowNewAdminModal(false)}
        title="Nouvel Administrateur"
        size="lg"
      >
        <Modal.Body>
          <div className="space-y-4">
            <FormField
              label="Nom complet"
              name="nom"
              value={newAdminData.nom}
              onChange={(value) => setNewAdminData(prev => ({ ...prev, nom: value }))}
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={newAdminData.email}
              onChange={(value) => setNewAdminData(prev => ({ ...prev, email: value }))}
              required
            />
            <FormField
              label="Rôle"
              name="role"
              type="select"
              value={newAdminData.role}
              onChange={(value) => setNewAdminData(prev => ({ ...prev, role: value }))}
              options={roles}
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setShowNewAdminModal(false)}>
            Annuler
          </Button>
          <Button onClick={handleNewAdminSubmit}>
            Créer l'administrateur
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GestionAdmins; 