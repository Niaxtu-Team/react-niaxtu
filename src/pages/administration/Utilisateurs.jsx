import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import useUsers from '../hooks/useUsers';
import { 
  AlertTriangle, 
  Users, 
  Search,
  RefreshCw,
  Eye,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Filter,
  Download,
  Edit,
  Trash2,
  MoreHorizontal,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Crown,
  Building,
  BarChart3,
  Settings,
  Grid,
  List,
  X
} from 'lucide-react';

export default function Utilisateurs() {
  const { user: _currentUser } = useAuth();
  const { 
    users: utilisateurs, 
    loading, 
    error, 
    pagination,
    fetchUsers,
    getAllUsers,
    searchUsers,
    changePage,
    getUsersStats,
    updateUser,
    deleteUser: _deleteUser
  } = useUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    isActive: 'all',
    role: 'all',
    dateRange: 'all'
  });
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Définition des rôles avec couleurs et icônes
  const roles = [
    { 
      value: 'super_admin', 
      label: 'Super Admin', 
      color: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      icon: Crown
    },
    { 
      value: 'admin', 
      label: 'Administrateur', 
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      icon: Shield
    },
    { 
      value: 'moderator', 
      label: 'Modérateur', 
      color: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
      icon: Settings
    },
    { 
      value: 'analyst', 
      label: 'Analyste', 
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      icon: BarChart3
    }
  ];

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    console.log('[Utilisateurs] Composant monté, chargement initial des données');
    loadInitialData();
  }, []);

  // Recharger quand les filtres changent
  useEffect(() => {
    console.log('[Utilisateurs] Filtres modifiés, rechargement des données', { searchTerm, filters });
    if (searchTerm) {
      searchUsers(searchTerm, filters);
    } else {
      fetchUsers(filters);
    }
  }, [searchTerm, filters]);

  // Chargement initial des données
  const loadInitialData = async () => {
    console.log('[Utilisateurs] Début du chargement initial des données');
    try {
      const [allUsersResult, statsResult] = await Promise.all([
        getAllUsers(),
        getUsersStats()
      ]);
      
      console.log('[samba] Résultat getAllUsers initial:', allUsersResult);
      
      if (statsResult.success) {
        setStats(statsResult.stats);
        console.log('[Utilisateurs] Statistiques chargées:', statsResult.stats);
      }
      
      console.log('[Utilisateurs] Chargement initial terminé avec succès');
    } catch (error) {
      console.error('[Utilisateurs] Erreur lors du chargement initial:', error);
    }
  };

  // Actualiser les données
  const handleRefresh = async () => {
    console.log('[Utilisateurs] Actualisation manuelle des données');
    setIsRefreshing(true);
    try {
      await loadInitialData();
      console.log('[Utilisateurs] Actualisation terminée avec succès');
    } catch (error) {
      console.error('[Utilisateurs] Erreur lors de l\'actualisation:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Gestion de la recherche
  const handleSearch = (value) => {
    console.log('[Utilisateurs] Recherche initiée:', value);
    setSearchTerm(value);
  };

  // Gestion des filtres
  const handleFilterChange = (filterType, value) => {
    console.log('[Utilisateurs] Filtre modifié:', { filterType, value });
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Gestion de la pagination
  const handlePageChange = async (newPage) => {
    console.log('[Utilisateurs] Changement de page:', newPage);
    await changePage(newPage);
  };

  // Activer/Désactiver un utilisateur
  const handleToggleUserStatus = async (userId, currentStatus) => {
    console.log('[Utilisateurs] Changement de statut utilisateur:', { userId, currentStatus });
    try {
      const result = await updateUser(userId, { isActive: !currentStatus });
      if (result.success) {
        console.log('[Utilisateurs] Statut utilisateur modifié avec succès');
        await fetchUsers(filters);
      }
    } catch (error) {
      console.error('[Utilisateurs] Erreur lors du changement de statut:', error);
    }
  };

  // Voir les détails d'un utilisateur
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  // Export CSV
  const handleExportCSV = () => {
    console.log('[Utilisateurs] Export CSV initié');
    const csvData = utilisateurs.map(user => ({
      'ID': user.id,
      'Email': user.email,
      'Nom': user.displayName || user.profile?.firstName + ' ' + user.profile?.lastName || 'N/A',
      'Rôle': user.role,
      'Statut': user.isActive ? 'Actif' : 'Inactif',
      'Date de création': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A',
      'Dernière connexion': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilisateurs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    console.log('[Utilisateurs] Export CSV terminé');
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Obtenir les informations d'un rôle
  const getRoleInfo = (roleValue) => {
    return roles.find(role => role.value === roleValue) || roles[0];
  };

  // Calculer le temps depuis la dernière connexion
  const getTempsConnexion = (lastLogin) => {
    if (!lastLogin) return 'Jamais connecté';
    
    const now = new Date();
    const login = new Date(lastLogin);
    const diffHours = Math.floor((now - login) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'En ligne';
    }
  };

  const getTempsConnexionColor = (lastLogin) => {
    if (!lastLogin) return 'text-gray-500';
    
    const now = new Date();
    const login = new Date(lastLogin);
    const diffHours = Math.floor((now - login) / (1000 * 60 * 60));

    if (diffHours < 1) return 'text-green-600';
    if (diffHours < 24) return 'text-blue-600';
    if (diffHours < 168) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && utilisateurs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-indigo-600 mx-auto absolute top-0"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">Chargement des utilisateurs...</p>
            <p className="text-sm text-gray-500">Veuillez patienter</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl max-w-md border border-red-200">
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <AlertTriangle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
          >
            <RefreshCw className="w-5 h-5 mr-2 inline" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête moderne */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Gestion des Utilisateurs
                </h1>
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {utilisateurs.length} utilisateurs
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
                disabled={isRefreshing}
                className="flex items-center px-4 py-2 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              
              <div className="flex items-center bg-gray-100/80 rounded-xl p-1 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={handleExportCSV}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Download className="w-5 h-5 mr-2" />
                Exporter
              </button>
            </div>
          </div>

          {/* Statistiques */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total</p>
                    <p className="text-3xl font-bold">{stats.total || utilisateurs.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Actifs</p>
                    <p className="text-3xl font-bold">{stats.active || utilisateurs.filter(u => u.isActive).length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Inactifs</p>
                    <p className="text-3xl font-bold">{stats.inactive || utilisateurs.filter(u => !u.isActive).length}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-orange-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Admins</p>
                    <p className="text-3xl font-bold">{stats.admins || utilisateurs.filter(u => u.role === 'admin' || u.role === 'super_admin').length}</p>
                  </div>
                  <Crown className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>
          )}

          {/* Barre de recherche et filtres */}
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            <div className="flex space-x-4">
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                className="px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="true">Actifs</option>
                <option value="false">Inactifs</option>
              </select>
              
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              >
                <option value="all">Tous les rôles</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contenu selon le mode d'affichage */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20">
          {utilisateurs.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-2xl w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-lg">
                <Users className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">Aucun utilisateur trouvé</h3>
              <p className="text-gray-500 text-lg">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {utilisateurs.map((user, index) => {
                  const roleInfo = getRoleInfo(user.role);
                  const IconComponent = roleInfo.icon;
                  
                  return (
                    <div 
                      key={user.id} 
                      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                              {user.displayName || user.profile?.firstName + ' ' + user.profile?.lastName || 'Utilisateur'}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-1">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            user.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold ${roleInfo.color} shadow-lg`}>
                          <IconComponent className="w-4 h-4 mr-2" />
                          {roleInfo.label}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-2" />
                          Créé le {formatDate(user.createdAt)}
                        </div>
                        <div className={`flex items-center ${getTempsConnexionColor(user.lastLogin)}`}>
                          <Clock className="w-3 h-3 mr-2" />
                          {getTempsConnexion(user.lastLogin)}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-200 text-sm font-semibold"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 text-sm font-semibold ${
                            user.isActive 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="w-4 h-4 mr-1" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Activer
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Dernière connexion
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-100">
                  {utilisateurs.map((user, index) => {
                    const roleInfo = getRoleInfo(user.role);
                    const IconComponent = roleInfo.icon;
                    
                    return (
                      <tr 
                        key={user.id} 
                        className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-300 group"
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                              <span className="text-white font-bold">
                                {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {user.displayName || user.profile?.firstName + ' ' + user.profile?.lastName || 'Utilisateur'}
                              </div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold ${roleInfo.color} shadow-lg`}>
                            <IconComponent className="w-4 h-4 mr-2" />
                            {roleInfo.label}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            user.isActive 
                              ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                              : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                          }`}>
                            {user.isActive ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className={`text-sm ${getTempsConnexionColor(user.lastLogin)}`}>
                            {getTempsConnexion(user.lastLogin)}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-all duration-200"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                user.isActive 
                                  ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                                  : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                              }`}
                              title={user.isActive ? 'Désactiver' : 'Activer'}
                            >
                              {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 font-semibold">
                Page {pagination.page} sur {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Précédent
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de détails utilisateur */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {selectedUser.displayName?.charAt(0)?.toUpperCase() || selectedUser.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedUser.displayName || selectedUser.profile?.firstName + ' ' + selectedUser.profile?.lastName || 'Utilisateur'}
                    </h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
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
                        const roleInfo = getRoleInfo(selectedUser.role);
                        const IconComponent = roleInfo.icon;
                        return (
                          <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold ${roleInfo.color} shadow-lg`}>
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
                        selectedUser.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {selectedUser.isActive ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        {selectedUser.isActive ? 'Actif' : 'Inactif'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-200">
                  <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Informations</label>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div>Créé le: {formatDate(selectedUser.createdAt)}</div>
                    <div className={getTempsConnexionColor(selectedUser.lastLogin)}>
                      Dernière connexion: {getTempsConnexion(selectedUser.lastLogin)}
                    </div>
                    {selectedUser.profile && (
                      <>
                        {selectedUser.profile.phone && <div>Téléphone: {selectedUser.profile.phone}</div>}
                        {selectedUser.profile.address && <div>Adresse: {selectedUser.profile.address}</div>}
                      </>
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
                <button
                  onClick={() => {
                    handleToggleUserStatus(selectedUser.id, selectedUser.isActive);
                    setShowDetailsModal(false);
                  }}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl ${
                    selectedUser.isActive 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800' 
                      : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                  }`}
                >
                  {selectedUser.isActive ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
