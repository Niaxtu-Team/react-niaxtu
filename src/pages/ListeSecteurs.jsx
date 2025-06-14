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
import { useAuth } from '../hooks/useAuth';

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

  // Filtrer les éléments selon la recherche
  const filterItems = (items) => {
    if (!search.trim()) return items;
    
    return items.filter(item => 
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête moderne */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Gestion des Secteurs
                </h1>
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {secteurs.length} secteurs • {sousSecteurs.length} sous-secteurs
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
              
              {hasPermission('CREATE_SECTORS') && (
                <button
                  onClick={() => openModal(activeTab.slice(0, -1))}
                  disabled={activeTab === 'sous-secteurs' && secteurs.length === 0}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouveau {activeTab.slice(0, -1).replace('-', ' ')}
                </button>
              )}
            </div>
          </div>

          {/* Navigation par onglets moderne */}
          <div className="flex space-x-2 mb-8 bg-gray-100/50 p-2 rounded-2xl backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('secteurs')}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'secteurs'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
            >
              <Building2 className="w-5 h-5 mr-2" />
              Secteurs
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'secteurs' ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {secteurs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sous-secteurs')}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'sous-secteurs'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
            >
              <Building2 className="w-5 h-5 mr-2" />
              Sous-secteurs
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'sous-secteurs' ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {sousSecteurs.length}
              </span>
            </button>
          </div>

          {/* Sélecteur de secteur pour les sous-secteurs */}
          {activeTab === 'sous-secteurs' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrer par secteur</label>
              <select
                value={selectedSecteur}
                onChange={(e) => setSelectedSecteur(e.target.value)}
                className="w-full md:w-auto px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
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

          {/* Barre de recherche élégante */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Rechercher des ${activeTab}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Contenu selon le mode d'affichage */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20">
          {(() => {
            let items = [];
            if (activeTab === 'secteurs') {
              items = filterItems(secteurs);
            } else if (activeTab === 'sous-secteurs') {
              items = filterItems(sousSecteurs);
            }

            if (items.length === 0) {
              return (
                <div className="text-center py-20">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-2xl w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-lg">
                    <Building2 className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">
                    Aucun {activeTab.slice(0, -1)} trouvé
                  </h3>
                  <p className="text-gray-500 text-lg mb-6">
                    {search ? 'Essayez de modifier vos critères de recherche' : `Commencez par créer votre premier ${activeTab.slice(0, -1)}`}
                  </p>
                  {hasPermission('CREATE_SECTORS') && !search && (
                    <button
                      onClick={() => openModal(activeTab.slice(0, -1))}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                    >
                      <Plus className="w-5 h-5 mr-2 inline" />
                      Créer un {activeTab.slice(0, -1)}
                    </button>
                  )}
                </div>
              );
            }

            if (viewMode === 'grid') {
              return (
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                              style={{ backgroundColor: item.color || '#3B82F6' }}
                            >
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                              {activeTab === 'sous-secteurs' && item.sector && (
                                <p className="text-sm text-gray-500">{item.sector.name}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              item.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.description || 'Aucune description'}
                        </p>

                        {activeTab === 'secteurs' && item.stats && (
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-blue-50 p-3 rounded-xl">
                              <div className="text-xs text-blue-600 font-semibold">Sous-secteurs</div>
                              <div className="text-lg font-bold text-blue-800">{item.stats.subSectors || 0}</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-xl">
                              <div className="text-xs text-green-600 font-semibold">Structures</div>
                              <div className="text-lg font-bold text-green-800">{item.stats.structures || 0}</div>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => {/* Voir détails */}}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-200 text-sm font-semibold"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </button>
                          {hasPermission('MANAGE_SECTORS') && (
                            <button
                              onClick={() => openModal(activeTab.slice(0, -1), item)}
                              className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-semibold"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Éditer
                            </button>
                          )}
                          {hasPermission('DELETE_SECTORS') && (
                            <button
                              onClick={() => deleteItem(activeTab.slice(0, -1), item.id)}
                              className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-semibold"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            } else {
              return (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Description
                        </th>
                        {activeTab === 'sous-secteurs' && (
                          <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Secteur parent
                          </th>
                        )}
                        <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Statut
                        </th>
                        {activeTab === 'secteurs' && (
                          <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Statistiques
                          </th>
                        )}
                        <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-100">
                      {items.map((item, index) => (
                        <tr 
                          key={item.id} 
                          className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-300 group"
                          style={{ 
                            animationDelay: `${index * 50}ms`,
                            animation: 'fadeInUp 0.6s ease-out forwards'
                          }}
                        >
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                                style={{ backgroundColor: item.color || '#3B82F6' }}
                              >
                                <Building2 className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-500">ID: {item.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm text-gray-900 max-w-xs">
                              {item.description || (
                                <span className="text-gray-400 italic">Aucune description</span>
                              )}
                            </div>
                          </td>
                          {activeTab === 'sous-secteurs' && (
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {item.sector?.name || 'N/A'}
                              </div>
                            </td>
                          )}
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              item.isActive 
                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                                : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                            }`}>
                              {item.isActive ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {item.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          {activeTab === 'secteurs' && (
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex space-x-4">
                                <div className="text-center">
                                  <div className="text-sm font-bold text-blue-600">{item.stats?.subSectors || 0}</div>
                                  <div className="text-xs text-gray-500">Sous-secteurs</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-bold text-green-600">{item.stats?.structures || 0}</div>
                                  <div className="text-xs text-gray-500">Structures</div>
                                </div>
                              </div>
                            </td>
                          )}
                          <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button
                                onClick={() => {/* Voir détails */}}
                                className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-all duration-200"
                                title="Voir les détails"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {hasPermission('MANAGE_SECTORS') && (
                                <button
                                  onClick={() => openModal(activeTab.slice(0, -1), item)}
                                  className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                  title="Modifier"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => toggleStatus(activeTab.slice(0, -1), item.id, item.isActive)}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  item.isActive 
                                    ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                                    : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                                }`}
                                title={item.isActive ? 'Désactiver' : 'Activer'}
                              >
                                {item.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                              {hasPermission('DELETE_SECTORS') && (
                                <button
                                  onClick={() => deleteItem(activeTab.slice(0, -1), item.id)}
                                  className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
          })()}
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
