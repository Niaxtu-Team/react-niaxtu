import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Eye, Calendar, User, Activity, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAdminHistory } from '../hooks/useAdminHistory';

export default function GestionAdminsHistorique() {
  const { user } = useAuth();
  const { 
    history, 
    loading, 
    error, 
    pagination,
    fetchHistory,
    getHistoryStats,
    exportHistory,
    setPage,
    refresh 
  } = useAdminHistory();
  
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [stats, setStats] = useState({
    totalActions: 0,
    successfulActions: 0,
    failedActions: 0,
    activeAdmins: 0,
    todayActions: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les statistiques
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await getHistoryStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
  };

  // Filtrage de l'historique
  const historiqueFiltré = history.filter(item => {
    const matchSearch = item.admin?.toLowerCase().includes(search.toLowerCase()) ||
                       item.action?.toLowerCase().includes(search.toLowerCase()) ||
                       item.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchAction = selectedAction === '' || item.action === selectedAction;
    const matchAdmin = selectedAdmin === '' || item.admin === selectedAdmin;
    
    return matchSearch && matchAction && matchAdmin;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
      await loadStats();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const filters = {
        search,
        action: selectedAction,
        admin: selectedAdmin
      };
      await exportHistory(filters, 'csv');
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const handleSearch = (filters) => {
    fetchHistory(filters);
  };

  const actions = [...new Set(history.map(h => h.action))];
  const admins = [...new Set(history.map(h => h.admin))];

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'succès': return 'bg-green-100 text-green-800';
      case 'échec': return 'bg-red-100 text-red-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'Résolution plainte':
      case 'Rejet plainte':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Création utilisateur':
      case 'Suppression utilisateur':
        return <User className="w-4 h-4" />;
      case 'Modification permissions':
        return <Activity className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-purple-600 mx-auto absolute top-0"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">Chargement de l'historique...</p>
            <p className="text-sm text-gray-500">Veuillez patienter</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête moderne */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                <History className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Historique des Actions
                </h1>
                <p className="text-gray-600 text-lg">Journal des activités des administrateurs</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg">
              {historiqueFiltré.length} actions
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Actions réussies</p>
                  <p className="text-3xl font-bold">{stats.successfulActions}</p>
                </div>
                <Activity className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Échecs</p>
                  <p className="text-3xl font-bold">{stats.failedActions}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Admins actifs</p>
                  <p className="text-3xl font-bold">{stats.activeAdmins}</p>
                </div>
                <User className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Aujourd'hui</p>
                  <p className="text-3xl font-bold">{stats.todayActions}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Toutes les actions</option>
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Tous les admins</option>
              {admins.map(admin => (
                <option key={admin} value={admin}>{admin}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setSearch('');
                setSelectedAction('');
                setSelectedAdmin('');
                setPage(1);
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              {historiqueFiltré.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune action trouvée</h3>
                  <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
                </div>
              ) : (
                historiqueFiltré.map((item, index) => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${item.statut === 'succès' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <div className={`${item.statut === 'succès' ? 'text-green-600' : 'text-red-600'}`}>
                          {getActionIcon(item.action)}
                        </div>
                      </div>
                      {index < historiqueFiltré.length - 1 && (
                        <div className="w-px h-16 bg-gray-200 mt-2"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">{item.action}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(item.statut)}`}>
                            {item.statut}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {item.date}
                          </div>
                          <span>IP: {item.ip}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mt-1">{item.description}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{item.admin}</span>
                        </div>
                        
                        <button className="text-purple-600 hover:text-purple-900 flex items-center space-x-1 text-sm">
                          <Eye className="w-4 h-4" />
                          <span>Détails</span>
                        </button>
                      </div>
                      
                      {item.details && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{item.details}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(Math.max(1, pagination.currentPage - 1))}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{pagination.startIndex + 1}</span> à{' '}
                      <span className="font-medium">{Math.min(pagination.startIndex + pagination.itemsPerPage, historiqueFiltré.length)}</span> sur{' '}
                      <span className="font-medium">{historiqueFiltré.length}</span> résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.currentPage
                              ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
