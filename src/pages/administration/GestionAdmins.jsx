import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Crown, 
  Building, 
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Key,
  History,
  Plus,
  X
} from 'lucide-react';

const GestionAdmins = () => {
  const location = useLocation();
  const { apiService, hasPermission } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('liste');
  const [permissions, setPermissions] = useState({});
  const [showNewAdminModal, setShowNewAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [refreshing, setRefreshing] = useState(false);
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
      color: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300 shadow-lg',
      description: 'Accès complet au système',
      icon: Crown
    },
    { 
      value: 'admin', 
      label: 'Administrateur', 
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300 shadow-lg',
      description: 'Gestion complète sauf super admin',
      icon: Shield
    },
    { 
      value: 'sector_manager', 
      label: 'Gestionnaire de Secteur', 
      color: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-300 shadow-lg',
      description: 'Gestion des secteurs et sous-secteurs',
      icon: Building
    },
    { 
      value: 'structure_manager', 
      label: 'Gestionnaire de Structure', 
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-300 shadow-lg',
      description: 'Gestion des structures',
      icon: Building
    },
    { 
      value: 'moderator', 
      label: 'Modérateur', 
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300 shadow-lg',
      description: 'Modération des plaintes',
      icon: Settings
    },
    { 
      value: 'analyst', 
      label: 'Analyste', 
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-300 shadow-lg',
      description: 'Analyses et rapports',
      icon: BarChart3
    }
  ];

  // Permissions disponibles par catégorie
  const permissionCategories = {
    'Utilisateurs': [
      { id: 'MANAGE_USERS', label: 'Gérer les utilisateurs', icon: Users },
      { id: 'CREATE_USERS', label: 'Créer des utilisateurs', icon: UserPlus },
      { id: 'DELETE_USERS', label: 'Supprimer des utilisateurs', icon: Trash2 },
      { id: 'VIEW_USER_DETAILS', label: 'Voir les détails utilisateurs', icon: Eye }
    ],
    'Plaintes': [
      { id: 'MANAGE_COMPLAINTS', label: 'Gérer les plaintes', icon: Settings },
      { id: 'MODERATE_COMPLAINTS', label: 'Modérer les plaintes', icon: Shield },
      { id: 'ASSIGN_COMPLAINTS', label: 'Assigner les plaintes', icon: Users },
      { id: 'RESOLVE_COMPLAINTS', label: 'Résoudre les plaintes', icon: CheckCircle }
    ],
    'Secteurs': [
      { id: 'MANAGE_SECTORS', label: 'Gérer les secteurs', icon: Building },
      { id: 'CREATE_SECTORS', label: 'Créer des secteurs', icon: Plus },
      { id: 'DELETE_SECTORS', label: 'Supprimer des secteurs', icon: Trash2 }
    ],
    'Structures': [
      { id: 'MANAGE_STRUCTURES', label: 'Gérer les structures', icon: Building },
      { id: 'CREATE_STRUCTURES', label: 'Créer des structures', icon: Plus },
      { id: 'DELETE_STRUCTURES', label: 'Supprimer des structures', icon: Trash2 }
    ],
    'Rapports': [
      { id: 'VIEW_REPORTS', label: 'Voir les rapports', icon: BarChart3 },
      { id: 'EXPORT_DATA', label: 'Exporter les données', icon: Download },
      { id: 'VIEW_ANALYTICS', label: 'Voir les analyses', icon: BarChart3 }
    ],
    'Administration': [
      { id: 'MANAGE_PERMISSIONS', label: 'Gérer les permissions', icon: Key },
      { id: 'VIEW_AUDIT_LOGS', label: 'Voir les logs d\'audit', icon: History },
      { id: 'SYSTEM_SETTINGS', label: 'Paramètres système', icon: Settings }
    ]
  };

  // Récupérer les admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/users/all');
      setAdmins(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des administrateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques
  const fetchStats = async () => {
    try {
      const response = await apiService.get('/admin/stats');
      setStats(response.stats || {});
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  // Fonction pour rafraîchir les données
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAdmins(), fetchStats()]);
    setRefreshing(false);
  };

  // Filtrer les admins
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || admin.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Obtenir les informations d'un rôle
  const getRoleInfo = (roleValue) => {
    return roles.find(role => role.value === roleValue) || roles[0];
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Gérer les actions sur les admins
  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowDetailsModal(true);
  };

  const handleEditAdmin = async (admin) => {
    // Logique d'édition
    console.log('Éditer admin:', admin);
  };

  const handleDeleteAdmin = async (admin) => {
    if (!hasPermission('DELETE_USERS')) {
      alert('Permission insuffisante');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'administrateur ${admin.nom} ?`)) {
      return;
    }

    try {
      await apiService.delete(`/users/${admin.id}`);
      await fetchAdmins();
      alert('Administrateur supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  const toggleAdminStatus = async (admin) => {
    try {
      const newStatus = admin.status === 'active' ? 'inactive' : 'active';
      await apiService.put(`/users/${admin.id}/status`, { status: newStatus });
      await fetchAdmins();
    } catch (error) {
      console.error('Erreur changement de statut:', error);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-indigo-600 mx-auto absolute top-0"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">Chargement des administrateurs...</p>
            <p className="text-sm text-gray-500">Veuillez patienter</p>
          </div>
        </div>
      </div>
    );
  }

  // Navigation par onglets
  const tabs = [
    { id: 'liste', label: 'Liste des admins', icon: Users, count: admins.length },
    { id: 'permissions', label: 'Permissions', icon: Key },
    { id: 'historique', label: 'Historique', icon: History }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Gestion des Administrateurs
                </h1>
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {admins.length} administrateurs
                  </div>
                  <div className="text-gray-500 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Mis à jour: {new Date().toLocaleTimeString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              
              {hasPermission('CREATE_USERS') && (
                <button
                  onClick={() => setShowNewAdminModal(true)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Nouvel Admin
                </button>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Admins</p>
                  <p className="text-3xl font-bold">{admins.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Actifs</p>
                  <p className="text-3xl font-bold">{admins.filter(a => a.status === 'active').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Inactifs</p>
                  <p className="text-3xl font-bold">{admins.filter(a => a.status === 'inactive').length}</p>
                </div>
                <XCircle className="w-8 h-8 text-orange-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Super Admins</p>
                  <p className="text-3xl font-bold">{admins.filter(a => a.role === 'super_admin').length}</p>
                </div>
                <Crown className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-8 py-4 text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-2" />
                  {tab.label}
                  {tab.count && (
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Contenu des onglets */}
          <div className="p-8">
            {activeTab === 'liste' && (
              <div className="space-y-6">
                {/* Barre de recherche et filtres */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">Tous les rôles</option>
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                {/* Liste des administrateurs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAdmins.map((admin, index) => {
                    const roleInfo = getRoleInfo(admin.role);
                    const IconComponent = roleInfo.icon;
                    
                    return (
                      <div 
                        key={admin.id} 
                        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">
                                {admin.nom?.charAt(0)?.toUpperCase() || 'A'}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{admin.nom}</h3>
                              <p className="text-gray-600 text-sm">{admin.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              admin.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className={`text-xs font-semibold ${
                              admin.status === 'active' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {admin.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold ${roleInfo.color}`}>
                            <IconComponent className="w-4 h-4 mr-2" />
                            {roleInfo.label}
                          </div>
                          <p className="text-gray-600 text-sm mt-2">{roleInfo.description}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span>Créé le {formatDate(admin.createdAt)}</span>
                          <span>{admin.permissions?.length || 0} permissions</span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewAdmin(admin)}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-200 text-sm font-semibold"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </button>
                          {hasPermission('MANAGE_USERS') && (
                            <button
                              onClick={() => handleEditAdmin(admin)}
                              className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-semibold"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Éditer
                            </button>
                          )}
                          {hasPermission('DELETE_USERS') && admin.role !== 'super_admin' && (
                            <button
                              onClick={() => handleDeleteAdmin(admin)}
                              className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-semibold"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredAdmins.length === 0 && (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 p-8 rounded-2xl w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                      <Users className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun administrateur trouvé</h3>
                    <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Permissions</h2>
                  <p className="text-gray-600">Configurez les permissions par catégorie</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {Object.entries(permissionCategories).map(([category, perms]) => (
                    <div key={category} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                        {category}
                      </h3>
                      <div className="space-y-3">
                        {perms.map(perm => {
                          const IconComponent = perm.icon;
                          return (
                            <div key={perm.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                              <div className="flex items-center space-x-3">
                                <IconComponent className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">{perm.label}</span>
                              </div>
                              <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                {perm.id}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'historique' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Historique des Actions</h2>
                  <p className="text-gray-600">Suivi des modifications administratives</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-8">
                  <div className="text-center py-16">
                    <div className="bg-gray-100 p-8 rounded-2xl w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                      <History className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Historique en cours de développement</h3>
                    <p className="text-gray-500">Cette fonctionnalité sera bientôt disponible</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Détails Admin */}
      {showDetailsModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {selectedAdmin.nom?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedAdmin.nom}</h3>
                    <p className="text-gray-600">{selectedAdmin.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                    <label className="text-sm font-bold text-blue-800 uppercase tracking-wide">Rôle</label>
                    <div className="mt-2">
                      {(() => {
                        const roleInfo = getRoleInfo(selectedAdmin.role);
                        const IconComponent = roleInfo.icon;
                        return (
                          <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold ${roleInfo.color}`}>
                            <IconComponent className="w-4 h-4 mr-2" />
                            {roleInfo.label}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
                    <label className="text-sm font-bold text-green-800 uppercase tracking-wide">Statut</label>
                    <div className="mt-2">
                      <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold ${
                        selectedAdmin.status === 'active' 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {selectedAdmin.status === 'active' ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        {selectedAdmin.status === 'active' ? 'Actif' : 'Inactif'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200">
                  <label className="text-sm font-bold text-purple-800 uppercase tracking-wide">Permissions</label>
                  <div className="mt-3">
                    <div className="text-sm text-gray-600">
                      {selectedAdmin.permissions?.length || 0} permissions accordées
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-200">
                  <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Informations</label>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div>Créé le: {formatDate(selectedAdmin.createdAt)}</div>
                    {selectedAdmin.lastLogin && (
                      <div>Dernière connexion: {formatDate(selectedAdmin.lastLogin)}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Fermer
                </button>
                {hasPermission('MANAGE_USERS') && (
                  <button
                    onClick={() => {
                      handleEditAdmin(selectedAdmin);
                      setShowDetailsModal(false);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Modifier
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouvel Admin */}
      {showNewAdminModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-2xl shadow-lg">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Nouvel Administrateur</h3>
                    <p className="text-gray-600">Créer un nouveau compte administrateur</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewAdminModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
                    <input
                      type="text"
                      value={newAdminData.nom}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, nom: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Nom et prénom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rôle</label>
                  <select
                    value={newAdminData.role}
                    onChange={(e) => setNewAdminData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option value="">Sélectionner un rôle</option>
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setShowNewAdminModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    // Logique de création
                    console.log('Créer admin:', newAdminData);
                    setShowNewAdminModal(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Créer l'administrateur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAdmins; 
