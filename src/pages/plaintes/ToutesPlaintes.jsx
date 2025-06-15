import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Building
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const statutColor = {
  'en-attente': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 shadow-sm',
  'en-traitement': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-sm',
  'resolue': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-sm',
  'rejetee': 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 shadow-sm',
};

const prioriteColor = {
  'faible': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300',
  'moyenne': 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border-orange-300',
  'elevee': 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300',
  'critique': 'bg-gradient-to-r from-red-200 to-red-300 text-red-800 border-red-400 animate-pulse shadow-lg'
};

export default function ToutesPlaintes() {
  const { apiService, hasPermission } = useAuth();
  const [plaintes, setPlaintes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    complaintType: '',
    targetType: '',
    priority: '',
    ministereId: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [ministeres, setMinisteres] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Récupérer les plaintes avec filtres
  const fetchPlaintes = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await apiService.get('/complaints', params);
      
      if (response.success) {
        setPlaintes(response.complaints || []);
        setPagination(prev => ({
          ...prev,
          page: response.pagination?.page || page,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des plaintes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les types de plaintes
  const fetchComplaintTypes = async () => {
    try {
      const response = await apiService.get('/complaints/types');
      setComplaintTypes(response.types || []);
    } catch (error) {
      console.error('Erreur types de plaintes:', error);
    }
  };

  // Récupérer les ministères
  const fetchMinisteres = async () => {
    try {
      const response = await apiService.get('/structures/ministeres');
      setMinisteres(response.data || []);
    } catch (error) {
      console.error('Erreur ministères:', error);
    }
  };

  // Changer le statut d'une plainte
  const changeStatus = async (complaintId, newStatus) => {
    if (!hasPermission('MANAGE_COMPLAINTS')) {
      alert('Permission insuffisante pour modifier le statut');
      return;
    }

    try {
      await apiService.put(`/complaints/${complaintId}/status`, { status: newStatus });
      
      fetchPlaintes(pagination.page);
      alert('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur changement de statut:', error);
      alert('Erreur lors du changement de statut: ' + error.message);
    }
  };

  // Supprimer une plainte
  const deletePlainte = async (complaintId) => {
    if (!hasPermission('DELETE_COMPLAINTS')) {
      alert('Permission insuffisante pour supprimer');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette plainte ?')) {
      return;
    }

    try {
      await apiService.delete(`/complaints/${complaintId}`);
      
      fetchPlaintes(pagination.page);
      alert('Plainte supprimée avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  // Voir les détails d'une plainte
  const viewDetails = (plainte) => {
    setSelectedComplaint(plainte);
    setShowModal(true);
  };

  // Exporter les données
  const exportData = async () => {
    try {
      const params = {
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
      };

      const response = await apiService.post('/admin/reports/export', { 
        format: 'excel',
        type: 'complaints',
        filters: params
      });

      if (response.success) {
        window.open(response.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export: ' + error.message);
    }
  };

  // Appliquer les filtres
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPlaintes(1);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: '',
      complaintType: '',
      targetType: '',
      priority: '',
      ministereId: ''
    });
    setSearch('');
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPlaintes(1);
  };

  // Fonction pour rafraîchir les données
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPlaintes(pagination.page);
    setRefreshing(false);
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour calculer le temps écoulé
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    return formatDate(dateString);
  };

  // Charger les données initiales
  useEffect(() => {
    fetchPlaintes();
    fetchComplaintTypes();
    fetchMinisteres();
  }, []);

  // Recharger quand on change de page
  useEffect(() => {
    if (pagination.page > 1) {
      fetchPlaintes(pagination.page);
    }
  }, [pagination.page]);

  if (loading && plaintes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-indigo-600 mx-auto absolute top-0"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">Chargement des plaintes...</p>
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
            onClick={() => fetchPlaintes()}
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
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Toutes les plaintes
                </h1>
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {pagination.total} plaintes
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
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  showFilters 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white' 
                    : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filtres
              </button>
              
              {hasPermission('EXPORT_DATA') && (
                <button
                  onClick={exportData}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Exporter
                </button>
              )}
            </div>
          </div>

          {/* Barre de recherche élégante */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par description, référence, type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                className="w-full pl-14 pr-6 py-4 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
              />
            </div>
            <button
              onClick={applyFilters}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
              Rechercher
            </button>
            <button
              onClick={resetFilters}
              className="px-6 py-4 bg-gray-100/80 text-gray-700 rounded-2xl hover:bg-gray-200/80 transition-all duration-300 font-semibold backdrop-blur-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Filtres avancés avec animation */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20 animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Filter className="w-6 h-6 mr-3 text-indigo-600" />
              Filtres avancés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {/* Statut */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  Statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border-2 border-gray-200/50 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Tous les statuts</option>
                  <option value="en-attente">En attente</option>
                  <option value="en-traitement">En traitement</option>
                  <option value="resolue">Résolue</option>
                  <option value="rejetee">Rejetée</option>
                </select>
              </div>

              {/* Type de plainte */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Type de plainte
                </label>
                <select
                  value={filters.complaintType}
                  onChange={(e) => setFilters(prev => ({ ...prev, complaintType: e.target.value }))}
                  className="w-full border-2 border-gray-200/50 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Tous les types</option>
                  {complaintTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Type de cible */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Type de cible
                </label>
                <select
                  value={filters.targetType}
                  onChange={(e) => setFilters(prev => ({ ...prev, targetType: e.target.value }))}
                  className="w-full border-2 border-gray-200/50 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Tous les types</option>
                  <option value="Structure publique">Structure publique</option>
                  <option value="Structure privée">Structure privée</option>
                  <option value="Particulier">Particulier</option>
                </select>
              </div>

              {/* Priorité */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Priorité
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full border-2 border-gray-200/50 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Toutes les priorités</option>
                  <option value="faible">Faible</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="elevee">Élevée</option>
                  <option value="critique">Critique</option>
                </select>
              </div>

              {/* Ministère */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Ministère
                </label>
                <select
                  value={filters.ministereId}
                  onChange={(e) => setFilters(prev => ({ ...prev, ministereId: e.target.value }))}
                  className="w-full border-2 border-gray-200/50 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Tous les ministères</option>
                  {ministeres.map(ministere => (
                    <option key={ministere.id} value={ministere.id}>{ministere.nom}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-8 flex space-x-4">
              <button
                onClick={applyFilters}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
              >
                Appliquer les filtres
              </button>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-300 font-semibold backdrop-blur-sm"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        {/* Tableau moderne */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20">
          {plaintes.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-2xl w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">Aucune plainte trouvée</h3>
              <p className="text-gray-500 text-lg">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Référence
                      </th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Type & Description
                      </th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Cible
                      </th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Priorité
                      </th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-100">
                    {plaintes.map((plainte, index) => (
                      <tr 
                        key={plainte.id} 
                        className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-300 group"
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-lg mr-3 shadow-lg">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-indigo-600">
                                #{plainte.reference || plainte.id?.slice(-8)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {getTimeAgo(plainte.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="max-w-xs">
                            <div className="text-sm font-bold text-gray-900 mb-2">
                              {plainte.complaintType}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                              {plainte.description?.substring(0, 120)}
                              {plainte.description?.length > 120 && '...'}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg mr-3 shadow-lg">
                              {plainte.targetType === 'Structure publique' ? (
                                <Building className="w-4 h-4 text-white" />
                              ) : (
                                <User className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {plainte.targetType}
                              </div>
                              {plainte.location?.address && (
                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {plainte.location.address.substring(0, 30)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex px-4 py-2 rounded-full text-xs font-bold border-2 ${statutColor[plainte.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                            {plainte.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex px-4 py-2 rounded-full text-xs font-bold border-2 ${prioriteColor[plainte.priority] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                            {plainte.priority}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                              <div className="font-semibold">{formatDate(plainte.createdAt)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={() => viewDetails(plainte)}
                              className="text-indigo-600 hover:text-indigo-900 p-3 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                              title="Voir les détails"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {hasPermission('MANAGE_COMPLAINTS') && (
                              <button
                                onClick={() => changeStatus(plainte.id, 'en-traitement')}
                                className="text-blue-600 hover:text-blue-900 p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                title="Modifier"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            )}
                            {hasPermission('DELETE_COMPLAINTS') && (
                              <button
                                onClick={() => deletePlainte(plainte.id)}
                                className="text-red-600 hover:text-red-900 p-3 rounded-xl hover:bg-red-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                title="Supprimer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination élégante */}
              {pagination.totalPages > 1 && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 font-semibold">
                      Affichage de <span className="text-indigo-600 font-bold">{((pagination.page - 1) * pagination.limit) + 1}</span> à{' '}
                      <span className="text-indigo-600 font-bold">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      sur <span className="text-indigo-600 font-bold">{pagination.total}</span> résultats
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1 inline" />
                        Précédent
                      </button>
                      
                      {/* Numéros de page */}
                      <div className="flex space-x-2">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                              className={`px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                                pagination.page === pageNum
                                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white'
                                  : 'text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Suivant
                        <ChevronRight className="w-4 h-4 ml-1 inline" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de détails moderne */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      Plainte #{selectedComplaint.reference || selectedComplaint.id?.slice(-8)}
                    </h3>
                    <p className="text-gray-600">Détails complets de la plainte</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <label className="text-sm font-bold text-blue-800 uppercase tracking-wide">Description</label>
                    <p className="mt-3 text-gray-900 leading-relaxed">{selectedComplaint.description}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <label className="text-sm font-bold text-green-800 uppercase tracking-wide">Type de plainte</label>
                    <p className="mt-3 text-gray-900 font-semibold">{selectedComplaint.complaintType}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                    <label className="text-sm font-bold text-purple-800 uppercase tracking-wide">Statut</label>
                    <div className="mt-3">
                      <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border-2 ${statutColor[selectedComplaint.status]}`}>
                        {selectedComplaint.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
                    <label className="text-sm font-bold text-orange-800 uppercase tracking-wide">Priorité</label>
                    <div className="mt-3">
                      <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border-2 ${prioriteColor[selectedComplaint.priority]}`}>
                        {selectedComplaint.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Fermer
                </button>
                {hasPermission('MANAGE_COMPLAINTS') && (
                  <button
                    onClick={() => {
                      changeStatus(selectedComplaint.id, 'en-traitement');
                      setShowModal(false);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Traiter la plainte
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
