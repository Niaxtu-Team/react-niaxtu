import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  AlertCircle, 
  Eye,
  Download,
  RefreshCw,
  Clock,
  Shield,
  Trash2,
  Edit3,
  Plus,
  Settings
} from 'lucide-react';

export default function HistoriqueAdmin() {
  const { apiService, hasPermission, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    action: 'all',
    user: 'all',
    dateFrom: '',
    dateTo: '',
    category: 'all'
  });

  // Vérifier les permissions d'accès
  if (!hasPermission('VIEW_AUDIT_LOG')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions pour consulter l'historique.</p>
        </div>
      </div>
    );
  }

  // Types d'actions possibles
  const actionTypes = {
    CREATE: { label: 'Création', color: 'bg-green-100 text-green-800', icon: Plus },
    UPDATE: { label: 'Modification', color: 'bg-blue-100 text-blue-800', icon: Edit3 },
    DELETE: { label: 'Suppression', color: 'bg-red-100 text-red-800', icon: Trash2 },
    LOGIN: { label: 'Connexion', color: 'bg-purple-100 text-purple-800', icon: User },
    LOGOUT: { label: 'Déconnexion', color: 'bg-gray-100 text-gray-800', icon: User },
    PERMISSION_CHANGE: { label: 'Permissions', color: 'bg-orange-100 text-orange-800', icon: Shield },
    CONFIG_CHANGE: { label: 'Configuration', color: 'bg-yellow-100 text-yellow-800', icon: Settings }
  };

  // Catégories d'entités
  const categories = {
    user: 'Utilisateurs',
    admin: 'Administrateurs',
    complaint: 'Plaintes',
    structure: 'Structures',
    sector: 'Secteurs',
    config: 'Configuration',
    system: 'Système'
  };

  // Charger les données d'historique
  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Simuler des données d'historique
      // En production, cela viendrait de l'API
      const mockLogs = [
        {
          id: '1',
          action: 'CREATE',
          category: 'admin',
          entity: 'Administrateur',
          entityId: 'admin_123',
          description: 'Création d\'un nouvel administrateur: Jean Dupont',
          user: { id: 'user_1', name: 'Marie Martin', email: 'marie@niaxtu.com' },
          timestamp: new Date('2024-01-15T10:30:00'),
          details: { email: 'jean.dupont@niaxtu.com', role: 'moderator' },
          ipAddress: '192.168.1.100'
        },
        {
          id: '2',
          action: 'UPDATE',
          category: 'complaint',
          entity: 'Plainte',
          entityId: 'complaint_456',
          description: 'Modification du statut d\'une plainte: En traitement → Résolue',
          user: { id: 'user_2', name: 'Paul Durand', email: 'paul@niaxtu.com' },
          timestamp: new Date('2024-01-15T09:15:00'),
          details: { oldStatus: 'en-traitement', newStatus: 'resolue' },
          ipAddress: '192.168.1.101'
        },
        {
          id: '3',
          action: 'DELETE',
          category: 'structure',
          entity: 'Service',
          entityId: 'service_789',
          description: 'Suppression du service: Bureau des réclamations',
          user: { id: 'user_1', name: 'Marie Martin', email: 'marie@niaxtu.com' },
          timestamp: new Date('2024-01-15T08:45:00'),
          details: { serviceName: 'Bureau des réclamations', parentDirection: 'Direction des affaires générales' },
          ipAddress: '192.168.1.100'
        },
        {
          id: '4',
          action: 'PERMISSION_CHANGE',
          category: 'admin',
          entity: 'Permissions',
          entityId: 'admin_123',
          description: 'Modification des permissions pour Jean Dupont',
          user: { id: 'user_3', name: 'Admin System', email: 'admin@niaxtu.com' },
          timestamp: new Date('2024-01-14T16:20:00'),
          details: { addedPermissions: ['EXPORT_DATA'], removedPermissions: ['DELETE_COMPLAINTS'] },
          ipAddress: '192.168.1.102'
        },
        {
          id: '5',
          action: 'LOGIN',
          category: 'system',
          entity: 'Authentification',
          entityId: 'auth_session',
          description: 'Connexion réussie',
          user: { id: 'user_2', name: 'Paul Durand', email: 'paul@niaxtu.com' },
          timestamp: new Date('2024-01-14T14:30:00'),
          details: { sessionId: 'sess_abc123', userAgent: 'Mozilla/5.0...' },
          ipAddress: '192.168.1.101'
        }
      ];

      // Appliquer les filtres
      let filtered = mockLogs;
      
      if (filters.search) {
        filtered = filtered.filter(log => 
          log.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          log.user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          log.entity.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.action !== 'all') {
        filtered = filtered.filter(log => log.action === filters.action);
      }
      
      if (filters.category !== 'all') {
        filtered = filtered.filter(log => log.category === filters.category);
      }
      
      if (filters.user !== 'all') {
        filtered = filtered.filter(log => log.user.id === filters.user);
      }
      
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filtered = filtered.filter(log => log.timestamp >= fromDate);
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(log => log.timestamp <= toDate);
      }

      setLogs(mockLogs);
      setFilteredLogs(filtered);
      setTotalPages(Math.ceil(filtered.length / 10));
      
    } catch (error) {
      setError('Erreur lors du chargement de l\'historique');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formater la date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Formater le temps relatif
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    return formatDate(date);
  };

  // Exporter l'historique
  const exportHistory = async () => {
    try {
      // En production, appeler l'API d'export
      const data = filteredLogs.map(log => ({
        Date: formatDate(log.timestamp),
        Action: actionTypes[log.action]?.label || log.action,
        Catégorie: categories[log.category] || log.category,
        Entité: log.entity,
        Description: log.description,
        Utilisateur: log.user.name,
        'Adresse IP': log.ipAddress
      }));
      
      console.log('Export des données:', data);
      // Logique d'export CSV/Excel ici
      
    } catch (error) {
      setError('Erreur lors de l\'export');
    }
  };

  // Reset des filtres
  const resetFilters = () => {
    setFilters({
      search: '',
      action: 'all',
      user: 'all',
      dateFrom: '',
      dateTo: '',
      category: 'all'
    });
    setCurrentPage(1);
  };

  // Obtenir les utilisateurs uniques pour le filtre
  const uniqueUsers = [...new Map(logs.map(log => [log.user.id, log.user])).values()];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-indigo-100 p-3 rounded-xl shadow text-indigo-500">
                <History className="w-7 h-7" />
              </span>
              <div className="ml-4">
                <h1 className="text-3xl font-extrabold text-gray-800">Historique Administratif</h1>
                <p className="text-gray-600">Suivi des actions et modifications du système</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => fetchLogs()}
                className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </button>
              {hasPermission('EXPORT_DATA') && (
                <button
                  onClick={exportHistory}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">Erreur</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtres
            </h2>
            <button
              onClick={resetFilters}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Réinitialiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Recherche */}
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Rechercher..."
                />
              </div>
            </div>

            {/* Action */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Toutes les actions</option>
                {Object.entries(actionTypes).map(([key, action]) => (
                  <option key={key} value={key}>{action.label}</option>
                ))}
              </select>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Toutes les catégories</option>
                {Object.entries(categories).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Utilisateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Utilisateur
              </label>
              <select
                value={filters.user}
                onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Tous les utilisateurs</option>
                {uniqueUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Résumé des filtres actifs */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredLogs.length}</span> résultat{filteredLogs.length > 1 ? 's' : ''} trouvé{filteredLogs.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Liste des événements */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Événements récents</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {paginatedLogs.length === 0 ? (
              <div className="p-12 text-center">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
                <p className="text-gray-500">Aucun événement ne correspond aux critères de recherche.</p>
              </div>
            ) : (
              paginatedLogs.map(log => {
                const ActionIcon = actionTypes[log.action]?.icon || AlertCircle;
                const actionConfig = actionTypes[log.action] || { 
                  label: log.action, 
                  color: 'bg-gray-100 text-gray-800' 
                };

                return (
                  <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      {/* Icône d'action */}
                      <div className={`p-2 rounded-lg ${actionConfig.color.replace('text-', 'bg-').replace('800', '100')}`}>
                        <ActionIcon className="w-5 h-5" />
                      </div>

                      {/* Contenu principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${actionConfig.color}`}>
                              {actionConfig.label}
                            </span>
                            <span className="text-sm text-gray-500">
                              {categories[log.category] || log.category}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span title={formatDate(log.timestamp)}>
                              {formatRelativeTime(log.timestamp)}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-900 mb-2">
                          {log.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              <span>{log.user.name}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-1">🌐</span>
                              <span>{log.ipAddress}</span>
                            </div>
                          </div>

                          {/* Détails supplémentaires */}
                          {log.details && Object.keys(log.details).length > 0 && (
                            <button
                              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                              onClick={() => {
                                // Afficher les détails dans un modal
                                console.log('Détails:', log.details);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Voir détails
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
