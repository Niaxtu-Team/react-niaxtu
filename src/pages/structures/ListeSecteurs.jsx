import { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  Grid,
  List,
  X,
  Save
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { 
  SearchBar, 
  StatCardGrid, 
  StructureCard,
  TabNavigation
} from '../../components';

export default function ListeSecteurs() {
  const { apiService, hasPermission } = useAuth();
  const [secteurs, setSecteurs] = useState([]);
  const [sousSecteurs, setSousSecteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('secteurs');
  const [selectedSecteur, setSelectedSecteur] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'secteur', 'sous-secteur'
  const [editingItem, setEditingItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    sectorId: '',
    isActive: true
  });

  // Récupérer tous les secteurs
  const fetchSecteurs = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/sectors', { withStats: true });
      setSecteurs(response.data || []);
    } catch (error) {
      console.error('Erreur chargement secteurs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les sous-secteurs par secteur
  const fetchSousSecteurs = async (sectorId = null) => {
    try {
      const url = sectorId ? `/sectors/${sectorId}/subsectors` : '/sectors/subsectors';
      const response = await apiService.get(url);
      setSousSecteurs(response.data || []);
    } catch (error) {
      console.error('Erreur chargement sous-secteurs:', error);
    }
  };

  // Créer un secteur
  const createSecteur = async () => {
    try {
      await apiService.post('/sectors', {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        isActive: formData.isActive
      });
      
      alert('Secteur créé avec succès');
      resetForm();
      fetchSecteurs();
    } catch (error) {
      console.error('Erreur création secteur:', error);
      alert('Erreur lors de la création: ' + error.message);
    }
  };

  // Créer un sous-secteur
  const createSousSecteur = async () => {
    try {
      await apiService.post('/sectors/subsectors', {
        name: formData.name,
        description: formData.description,
        sectorId: formData.sectorId,
        icon: formData.icon,
        isActive: formData.isActive
      });
      
      alert('Sous-secteur créé avec succès');
      resetForm();
      if (selectedSecteur) {
        fetchSousSecteurs(selectedSecteur);
      } else {
        fetchSousSecteurs();
      }
    } catch (error) {
      console.error('Erreur création sous-secteur:', error);
      alert('Erreur lors de la création: ' + error.message);
    }
  };

  // Modifier un secteur
  const updateSecteur = async () => {
    try {
      await apiService.put(`/sectors/${editingItem.id}`, {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        isActive: formData.isActive
      });
      
      alert('Secteur modifié avec succès');
      resetForm();
      fetchSecteurs();
    } catch (error) {
      console.error('Erreur modification secteur:', error);
      alert('Erreur lors de la modification: ' + error.message);
    }
  };

  // Modifier un sous-secteur
  const updateSousSecteur = async () => {
    try {
      await apiService.put(`/sectors/subsectors/${editingItem.id}`, {
        name: formData.name,
        description: formData.description,
        sectorId: formData.sectorId,
        icon: formData.icon,
        isActive: formData.isActive
      });
      
      alert('Sous-secteur modifié avec succès');
      resetForm();
      if (selectedSecteur) {
        fetchSousSecteurs(selectedSecteur);
      } else {
        fetchSousSecteurs();
      }
    } catch (error) {
      console.error('Erreur modification sous-secteur:', error);
      alert('Erreur lors de la modification: ' + error.message);
    }
  };

  // Supprimer un élément
  const deleteItem = async (type, id) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce ${type} ?`)) {
      return;
    }

    try {
      const endpoint = type === 'secteur' ? `/sectors/${id}` : `/sectors/subsectors/${id}`;
      await apiService.delete(endpoint);
      
      alert(`${type} supprimé avec succès`);
      
      if (type === 'secteur') {
        fetchSecteurs();
      } else {
        if (selectedSecteur) {
          fetchSousSecteurs(selectedSecteur);
        } else {
          fetchSousSecteurs();
        }
      }
    } catch (error) {
      console.error(`Erreur suppression ${type}:`, error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  // Activer/désactiver un élément
  const toggleStatus = async (type, id, currentStatus) => {
    try {
      const endpoint = type === 'secteur' ? `/sectors/${id}/toggle` : `/sectors/subsectors/${id}/toggle`;
      await apiService.put(endpoint, { isActive: !currentStatus });
      
      alert(`${type} ${currentStatus ? 'désactivé' : 'activé'} avec succès`);
      
      if (type === 'secteur') {
        fetchSecteurs();
      } else {
        if (selectedSecteur) {
          fetchSousSecteurs(selectedSecteur);
        } else {
          fetchSousSecteurs();
        }
      }
    } catch (error) {
      console.error(`Erreur changement statut ${type}:`, error);
      alert(`Erreur lors du changement de statut: ${error.message}`);
    }
  };

  // Ouvrir le modal pour créer/modifier
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        icon: item.icon || '',
        color: item.color || '#3B82F6',
        sectorId: item.sectorId || selectedSecteur,
        isActive: item.isActive !== undefined ? item.isActive : true
      });
    } else {
      resetForm();
      if (type === 'sous-secteur') {
        setFormData(prev => ({ ...prev, sectorId: selectedSecteur }));
      }
    }
    
    setShowModal(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#3B82F6',
      sectorId: '',
      isActive: true
    });
    setShowModal(false);
    setEditingItem(null);
  };

  // Soumettre le formulaire
  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('Le nom est requis');
      return;
    }

    if (modalType === 'secteur') {
      if (editingItem) {
        updateSecteur();
      } else {
        createSecteur();
      }
    } else if (modalType === 'sous-secteur') {
      if (!formData.sectorId) {
        alert('Sélectionnez un secteur');
        return;
      }
      if (editingItem) {
        updateSousSecteur();
      } else {
        createSousSecteur();
      }
    }
  };

  // Filtrage des éléments
  const filterItems = (items) => {
    return items.filter(item => {
      const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase()) ||
                         item.description?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  };

  // Actualiser les données
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSecteurs();
    await fetchSousSecteurs();
    setRefreshing(false);
  };

  // Charger les données initiales
  useEffect(() => {
    fetchSecteurs();
    fetchSousSecteurs();
  }, []);

  // Charger les sous-secteurs quand on sélectionne un secteur
  useEffect(() => {
    if (selectedSecteur && activeTab === 'sous-secteurs') {
      fetchSousSecteurs(selectedSecteur);
    } else if (activeTab === 'sous-secteurs' && !selectedSecteur) {
      fetchSousSecteurs();
    }
  }, [selectedSecteur, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des secteurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchSecteurs()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const currentItems = filterItems(activeTab === 'secteurs' ? secteurs : sousSecteurs);

  // Configuration des onglets
  const tabs = [
    {
      id: 'secteurs',
      label: 'Secteurs',
      icon: Building2,
      count: secteurs.length
    },
    {
      id: 'sous-secteurs',
      label: 'Sous-secteurs',
      icon: Building2,
      count: sousSecteurs.length
    }
  ];

  // Statistiques pour les cartes
  const stats = activeTab === 'secteurs' ? [
    {
      title: 'Secteurs actifs',
      value: secteurs.filter(s => s.isActive).length,
      icon: Building2,
      color: 'green',
      trend: null
    },
    {
      title: 'Total secteurs',
      value: secteurs.length,
      icon: Building2,
      color: 'blue',
      trend: null
    },
    {
      title: 'Secteurs inactifs',
      value: secteurs.filter(s => !s.isActive).length,
      icon: Building2,
      color: 'red',
      trend: null
    },
    {
      title: 'Sous-secteurs',
      value: sousSecteurs.length,
      icon: Building2,
      color: 'purple',
      trend: null
    }
  ] : [
    {
      title: 'Sous-secteurs actifs',
      value: sousSecteurs.filter(ss => ss.isActive).length,
      icon: Building2,
      color: 'green',
      trend: null
    },
    {
      title: 'Total sous-secteurs',
      value: sousSecteurs.length,
      icon: Building2,
      color: 'blue',
      trend: null
    },
    {
      title: 'Sous-secteurs inactifs',
      value: sousSecteurs.filter(ss => !ss.isActive).length,
      icon: Building2,
      color: 'red',
      trend: null
    },
    {
      title: 'Secteurs parents',
      value: [...new Set(sousSecteurs.map(ss => ss.sectorId))].length,
      icon: Building2,
      color: 'orange',
      trend: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Secteurs</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-gray-600">
                    {secteurs.length} secteurs • {sousSecteurs.length} sous-secteurs
                  </span>
                  <div className="text-gray-500 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Mis à jour: {new Date().toLocaleTimeString('fr-FR')}
                  </div>
                </div>
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
              
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              {hasPermission('CREATE_SECTORS') && (
                <button
                  onClick={() => window.location.href = `/admin/${activeTab}/nouveau`}
                  disabled={activeTab === 'sous-secteurs' && secteurs.length === 0}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau {activeTab.slice(0, -1).replace('-', ' ')}
                </button>
              )}
            </div>
          </div>

          {/* Navigation par onglets */}
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="mb-6"
          />

          {/* Sélecteur de secteur pour les sous-secteurs */}
          {activeTab === 'sous-secteurs' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par secteur</label>
              <select
                value={selectedSecteur}
                onChange={(e) => setSelectedSecteur(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Tous les secteurs</option>
                {secteurs.map(secteur => (
                  <option key={secteur.id} value={secteur.id}>
                    {secteur.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Barre de recherche */}
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={`Rechercher des ${activeTab}...`}
          />
        </div>

        {/* Statistiques */}
        <StatCardGrid stats={stats} />

        {/* Contenu */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {currentItems.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Aucun {activeTab.slice(0, -1)} trouvé
              </h3>
              <p className="text-gray-500 mb-4">
                {search 
                  ? 'Aucun résultat ne correspond à votre recherche'
                  : `Commencez par créer votre premier ${activeTab.slice(0, -1)}`
                }
              </p>
              {!search && hasPermission('CREATE_SECTORS') && (
                <button
                  onClick={() => window.location.href = `/admin/${activeTab}/nouveau`}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un {activeTab.slice(0, -1)}
                </button>
              )}
            </div>
          ) : (
            <div className={`p-6 ${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}`}>
              {currentItems.map((item) => (
                <StructureCard
                  key={item.id}
                  structure={item}
                  type={activeTab.slice(0, -1)}
                  onView={(item) => window.location.href = `/admin/${activeTab.slice(0, -1)}s/${item.id}/details`}
                  onEdit={(item) => window.location.href = `/admin/${activeTab.slice(0, -1)}s/${item.id}/edit`}
                  onDelete={() => deleteItem(activeTab.slice(0, -1), item.id)}
                  onToggleStatus={(id, status) => toggleStatus(activeTab.slice(0, -1), id, status)}
                  showStats={true}
                  showContact={false}
                  showLocation={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal moderne */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {editingItem ? 'Modifier' : 'Créer'} {modalType === 'secteur' ? 'un secteur' : 'un sous-secteur'}
                    </h3>
                    <p className="text-gray-600">
                      {editingItem ? 'Modifiez les informations' : 'Remplissez les informations'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Nom du secteur"
                    />
                  </div>

                  {modalType === 'secteur' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Couleur</label>
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full h-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      />
                    </div>
                  )}

                  {modalType === 'sous-secteur' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Secteur parent *</label>
                      <select
                        value={formData.sectorId}
                        onChange={(e) => setFormData(prev => ({ ...prev, sectorId: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                      >
                        <option value="">Sélectionner un secteur</option>
                        {secteurs.map(secteur => (
                          <option key={secteur.id} value={secteur.id}>{secteur.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Description du secteur"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                    Actif
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingItem ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
