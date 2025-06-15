import { useState, useEffect } from 'react';
import { Tag, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { 
  SearchBar, 
  FilterPanel, 
  Pagination, 
  StatCardGrid, 
  TypeCard 
} from '../../components';

export default function ListeTypesPlainte() {
  const { apiService } = useAuth();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    isActive: 'all',
    sectorId: 'all'
  });

  // Charger les types de plaintes
  useEffect(() => {
    fetchTypes();
  }, [currentPage, searchTerm, filters]);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.isActive !== 'all' && { isActive: filters.isActive }),
        ...(filters.sectorId !== 'all' && { sectorId: filters.sectorId })
      });

      const response = await apiService.get(`/types/complaints?${params}`);
      
      if (response.success) {
        setTypes(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      } else {
        setError('Erreur lors du chargement des types');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Activer/désactiver un type
  const handleToggleType = async (typeId, currentStatus) => {
    try {
      const response = await apiService.put(`/types/complaints/${typeId}/toggle`);

      if (response.success) {
        setTypes(prev => prev.map(type => 
          type.id === typeId 
            ? { ...type, isActive: !currentStatus }
            : type
        ));
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  // Supprimer un type
  const handleDeleteType = async (typeId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce type de plainte ?')) {
      return;
    }

    try {
      const response = await apiService.delete(`/types/complaints/${typeId}`);

      if (response.success) {
        setTypes(prev => prev.filter(type => type.id !== typeId));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Actions sur les types
  const handleViewType = (type) => {
    // Navigation vers les détails/statistiques
    window.location.href = `/admin/plaintes/types/${type.id}/stats`;
  };

  const handleEditType = (type) => {
    // Navigation vers l'édition
    window.location.href = `/admin/plaintes/types/${type.id}/edit`;
  };

  // Configuration des filtres
  const filterOptions = [
    {
      key: 'isActive',
      label: 'Statut',
      options: [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'true', label: 'Actifs seulement' },
        { value: 'false', label: 'Inactifs seulement' }
      ]
    },
    {
      key: 'sectorId',
      label: 'Secteur',
      options: [
        { value: 'all', label: 'Tous les secteurs' },
        { value: 'sante', label: 'Santé' },
        { value: 'transport', label: 'Transport' },
        { value: 'education', label: 'Éducation' },
        { value: 'eau', label: 'Eau et assainissement' },
        { value: 'energie', label: 'Énergie' }
      ]
    }
  ];

  // Statistiques pour les cartes
  const stats = [
    {
      title: 'Total types',
      value: types.length,
      icon: Tag,
      color: 'purple',
      trend: null
    },
    {
      title: 'Types actifs',
      value: types.filter(t => t.isActive).length,
      icon: Tag,
      color: 'green',
      trend: null
    },
    {
      title: 'Types inactifs',
      value: types.filter(t => !t.isActive).length,
      icon: Tag,
      color: 'red',
      trend: null
    },
    {
      title: 'Plaintes totales',
      value: types.reduce((sum, t) => sum + (t.complaintCount || 0), 0),
      icon: Tag,
      color: 'blue',
      trend: null
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des types de plaintes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-purple-100 p-3 rounded-xl shadow text-purple-500">
                <Tag className="w-7 h-7" />
              </span>
              <div className="ml-4">
                <h1 className="text-3xl font-extrabold text-gray-800">Types de Plaintes</h1>
                <p className="text-gray-600">Gestion des catégories de plaintes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/admin/plaintes/types/nouveau'}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau type
              </button>
              <button
                onClick={fetchTypes}
                className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <StatCardGrid stats={stats} className="mb-6" />

        {/* Recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Rechercher un type de plainte..."
              />
            </div>
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              options={filterOptions}
            />
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Liste des types */}
        {types.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun type de plainte</h3>
            <p className="text-gray-500 mb-4">Commencez par créer votre premier type de plainte</p>
            <button
              onClick={() => window.location.href = '/admin/plaintes/types/nouveau'}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un type
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {types.map((type) => (
              <TypeCard
                key={type.id}
                type={type}
                onView={handleViewType}
                onEdit={handleEditType}
                onDelete={() => handleDeleteType(type.id)}
                onToggleStatus={handleToggleType}
                showSector={true}
                showCode={true}
                showKeywords={true}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
} 
