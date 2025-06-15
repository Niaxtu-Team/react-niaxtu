import React, { useState, useEffect } from 'react';
import { History, RefreshCw, Download } from 'lucide-react';
import { useAdminHistory } from '../../hooks/useAdminHistory';
import { 
  SearchBar, 
  FilterPanel,
  StatCardGrid,
  HistoryTimeline
} from '../../components';

export default function GestionAdminsHistorique() {
  const { 
    history, 
    loading, 
    getHistoryStats,
    exportHistory,
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

  const actions = [...new Set(history.map(h => h.action))];
  const admins = [...new Set(history.map(h => h.admin))];

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
        <StatCardGrid 
          stats={[
            {
              title: 'Actions réussies',
              value: stats.successfulActions,
              color: 'green'
            },
            {
              title: 'Échecs',
              value: stats.failedActions,
              color: 'red'
            },
            {
              title: 'Admins actifs',
              value: stats.activeAdmins,
              color: 'blue'
            },
            {
              title: 'Aujourd\'hui',
              value: stats.todayActions,
              color: 'orange'
            }
          ]}
          className="mb-8"
        />
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher dans l'historique..."
                size="default"
              />
            </div>
            
            <div className="md:col-span-6">
              <FilterPanel
                filters={[
                  {
                    key: 'action',
                    label: 'Action',
                    type: 'select',
                    value: selectedAction,
                    onChange: setSelectedAction,
                    options: [
                      { value: '', label: 'Toutes les actions' },
                      ...actions.map(action => ({ value: action, label: action }))
                    ]
                  },
                  {
                    key: 'admin',
                    label: 'Administrateur',
                    type: 'select',
                    value: selectedAdmin,
                    onChange: setSelectedAdmin,
                    options: [
                      { value: '', label: 'Tous les admins' },
                      ...admins.map(admin => ({ value: admin, label: admin }))
                    ]
                  }
                ]}
                layout="horizontal"
              />
            </div>
            
            <div className="md:col-span-2 flex space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
              
              <button
                onClick={handleExport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Historique des actions */}
        <HistoryTimeline
          history={historiqueFiltré}
          onViewDetails={(item) => console.log('Voir détails:', item)}
          showActions={true}
        />
      </div>
    </div>
  );
} 
