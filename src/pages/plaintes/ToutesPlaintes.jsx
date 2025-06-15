import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { 
  ComplaintCard,
  ComplaintFilters,
  ComplaintStats,
  Pagination
} from '../../components';

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
    ministereId: '',
    dateRange: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    enTraitement: 0,
    resolues: 0,
    rejetees: 0,
    urgentes: 0
  });
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [targetTypes, setTargetTypes] = useState([]);
  const [ministeres, setMinisteres] = useState([]);
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

        // Calculer les statistiques
        calculateStats(response.complaints || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des plaintes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const calculateStats = (plaintesData) => {
    const total = plaintesData.length;
    const enAttente = plaintesData.filter(p => p.status === 'en-attente').length;
    const enTraitement = plaintesData.filter(p => p.status === 'en-traitement').length;
    const resolues = plaintesData.filter(p => p.status === 'resolue').length;
    const rejetees = plaintesData.filter(p => p.status === 'rejetee').length;
    const urgentes = plaintesData.filter(p => p.priority === 'urgente' || p.priority === 'critique').length;

    setStats({
      total,
      enAttente,
      enTraitement,
      resolues,
      rejetees,
      urgentes
    });
  };

  // Récupérer les données de référence
  const fetchReferenceData = async () => {
    try {
      const [typesResponse, targetsResponse, ministeresResponse] = await Promise.all([
        apiService.get('/complaints/types'),
        apiService.get('/targets/types'),
        apiService.get('/structures/ministeres')
      ]);

      setComplaintTypes(typesResponse.types || []);
      setTargetTypes(targetsResponse.types || []);
      setMinisteres(ministeresResponse.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données de référence:', error);
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
    window.location.href = `/admin/plaintes/${plainte.id}/details`;
  };

  // Démarrer le traitement
  const startTreatment = (complaintId) => {
    changeStatus(complaintId, 'en-traitement');
  };

  // Résoudre une plainte
  const resolvePlainte = (complaintId) => {
    changeStatus(complaintId, 'resolue');
  };

  // Rejeter une plainte
  const rejectPlainte = (complaintId) => {
    changeStatus(complaintId, 'rejetee');
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

  // Actualiser les données
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPlaintes(pagination.page);
    setRefreshing(false);
  };

  // Appliquer les filtres
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Gérer la recherche
  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Charger les données initiales
  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Recharger les plaintes quand les filtres changent
  useEffect(() => {
    fetchPlaintes(pagination.page);
  }, [filters, search, pagination.page]);

  if (loading && plaintes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Chargement des plaintes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchPlaintes(pagination.page)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Toutes les Plaintes</h1>
                <p className="text-gray-600">
                  Gestion complète des plaintes citoyennes
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              
              {hasPermission('EXPORT_DATA') && (
                <button
                  onClick={exportData}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <ComplaintStats stats={stats} />

        {/* Filtres */}
        <ComplaintFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          searchValue={search}
          complaintTypes={complaintTypes}
          targetTypes={targetTypes}
          ministeres={ministeres}
          showAdvanced={true}
        />

        {/* Liste des plaintes */}
        {plaintes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune plainte trouvée</h3>
            <p className="text-gray-500">
              {search || Object.values(filters).some(v => v !== '') 
                ? 'Aucun résultat ne correspond à vos critères de recherche'
                : 'Aucune plainte n\'a été soumise pour le moment'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {plaintes.map((plainte) => (
                <ComplaintCard
                  key={plainte.id}
                  complaint={plainte}
                  onView={viewDetails}
                  onStartTreatment={startTreatment}
                  onResolve={resolvePlainte}
                  onReject={rejectPlainte}
                  onDelete={deletePlainte}
                  showActions={true}
                  showPriority={true}
                  showLocation={true}
                  showTimestamp={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        )}
      </div>
    </div>
  );
} 
