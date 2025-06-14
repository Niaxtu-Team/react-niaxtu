import { useState, useEffect } from 'react';
import { Landmark, Plus, Edit, Trash2, Building, FileText, Search, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function ListeStructures() {
  const { apiService, hasPermission } = useAuth();

  const [ministeres, setMinisteres] = useState([]);
  const [directions, setDirections] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ministeres');
  const [selectedMinistere, setSelectedMinistere] = useState('all');
  const [selectedDirection, setSelectedDirection] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'ministere', 'direction', 'service'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    code: '',
    ministereId: '',
    directionId: '',
    contact: {
      telephone: '',
      email: '',
      adresse: ''
    },
    localisation: {
      latitude: '',
      longitude: '',
      adresse: ''
    }
  });

  // Récupérer tous les ministères
  const fetchMinisteres = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/structures/ministeres');
      setMinisteres(response.data || []);
    } catch (error) {
      console.error('Erreur chargement ministères:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer toutes les directions
  const fetchAllDirections = async () => {
    try {
      const response = await apiService.get('/structures/directions?withStats=true');
      setDirections(response.data || []);
    } catch (error) {
      console.error('Erreur chargement toutes les directions:', error);
    }
  };

  // Récupérer tous les services
  const fetchAllServices = async () => {
    try {
      const response = await apiService.get('/structures/services?withStats=true');
      setServices(response.data || []);
    } catch (error) {
      console.error('Erreur chargement tous les services:', error);
    }
  };

  // Créer un ministère
  const createMinistere = async () => {
    try {
      await apiService.post('/structures/ministeres', {
        nom: formData.nom,
        description: formData.description,
        code: formData.code,
        contact: formData.contact,
        actif: true
      });
      
      alert('Ministère créé avec succès');
      resetForm();
      fetchMinisteres();
    } catch (error) {
      console.error('Erreur création ministère:', error);
      alert('Erreur lors de la création: ' + error.message);
    }
  };

  // Créer une direction
  const createDirection = async () => {
    try {
      await apiService.post('/structures/directions', {
        nom: formData.nom,
        description: formData.description,
        code: formData.code,
        ministereId: formData.ministereId,
        actif: true
      });
      
      alert('Direction créée avec succès');
      resetForm();
      fetchAllDirections(); // Recharger toutes les directions
    } catch (error) {
      console.error('Erreur création direction:', error);
      alert('Erreur lors de la création: ' + error.message);
    }
  };

  // Créer un service
  const createService = async () => {
    try {
      await apiService.post('/structures/services', {
        nom: formData.nom,
        description: formData.description,
        code: formData.code,
        ministereId: formData.ministereId,
        directionId: formData.directionId,
        localisation: formData.localisation,
        actif: true
      });
      
      alert('Service créé avec succès');
      resetForm();
      fetchAllServices(); // Recharger tous les services
    } catch (error) {
      console.error('Erreur création service:', error);
      alert('Erreur lors de la création: ' + error.message);
    }
  };

  // Supprimer un élément
  const deleteItem = async (type, id) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce ${type} ?`)) {
      return;
    }

    try {
      await apiService.delete(`/structures/${type}s/${id}`);
      
      alert(`${type} supprimé avec succès`);
      
      // Recharger les données appropriées
      if (type === 'ministere') {
        fetchMinisteres();
      } else if (type === 'direction') {
        fetchAllDirections();
      } else if (type === 'service') {
        fetchAllServices();
      }
    } catch (error) {
      console.error(`Erreur suppression ${type}:`, error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  // Ouvrir le modal pour créer/modifier
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    
    if (item) {
      setFormData({
        nom: item.nom || '',
        description: item.description || '',
        code: item.code || '',
        ministereId: item.ministereId || selectedMinistere,
        directionId: item.directionId || selectedDirection,
        contact: item.contact || { telephone: '', email: '', adresse: '' },
        localisation: item.localisation || { latitude: '', longitude: '', adresse: '' }
      });
    } else {
      resetForm();
      if (type === 'direction') {
        setFormData(prev => ({ ...prev, ministereId: selectedMinistere }));
      } else if (type === 'service') {
        setFormData(prev => ({ 
          ...prev, 
          ministereId: selectedMinistere,
          directionId: selectedDirection 
        }));
      }
    }
    
    setShowModal(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      code: '',
      ministereId: '',
      directionId: '',
      contact: { telephone: '', email: '', adresse: '' },
      localisation: { latitude: '', longitude: '', adresse: '' }
    });
    setShowModal(false);
    setEditingItem(null);
  };

  // Soumettre le formulaire
  const handleSubmit = () => {
    if (!formData.nom.trim()) {
      alert('Le nom est requis');
      return;
    }

    if (modalType === 'ministere') {
      createMinistere();
    } else if (modalType === 'direction') {
      if (!formData.ministereId) {
        alert('Sélectionnez un ministère');
        return;
      }
      createDirection();
    } else if (modalType === 'service') {
      if (!formData.ministereId || !formData.directionId) {
        alert('Sélectionnez un ministère et une direction');
        return;
      }
      createService();
    }
  };

  // Filtrer les éléments selon la recherche et les sélections
  const filterItems = (items) => {
    let filteredItems = items;

    // Filtrage par ministère pour les directions
    if (activeTab === 'directions' && selectedMinistere && selectedMinistere !== 'all') {
      filteredItems = filteredItems.filter(item => item.ministereId === selectedMinistere);
    }

    // Filtrage par ministère et direction pour les services
    if (activeTab === 'services') {
      if (selectedMinistere && selectedMinistere !== 'all') {
        filteredItems = filteredItems.filter(item => item.ministereId === selectedMinistere);
      }
      if (selectedDirection && selectedDirection !== 'all') {
        filteredItems = filteredItems.filter(item => item.directionId === selectedDirection);
      }
    }

    // Filtrage par recherche textuelle
    if (search.trim()) {
      filteredItems = filteredItems.filter(item => 
        item.nom?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.code?.toLowerCase().includes(search.toLowerCase()) ||
        item.ministereName?.toLowerCase().includes(search.toLowerCase()) ||
        item.directionName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filteredItems;
  };

  // Charger les données initiales
  useEffect(() => {
    fetchMinisteres();
  }, []);

  // Charger toutes les directions au changement d'onglet
  useEffect(() => {
    if (activeTab === 'directions') {
      fetchAllDirections();
      setSelectedDirection('all'); // Réinitialiser la sélection
    }
  }, [activeTab]);

  // Charger tous les services au changement d'onglet
  useEffect(() => {
    if (activeTab === 'services') {
      fetchAllServices();
      // Garder les sélections pour les services
    }
  }, [activeTab]);

  // Réinitialiser la sélection de direction quand on change de ministère
  useEffect(() => {
    if (activeTab === 'services' && selectedMinistere) {
      setSelectedDirection('all');
    }
  }, [selectedMinistere, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des structures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Landmark className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchMinisteres()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const tabsConfig = [
    { id: 'ministeres', label: 'Ministères', icon: Building, count: ministeres.length },
    { id: 'directions', label: 'Directions', icon: FileText, count: directions.length },
    { id: 'services', label: 'Services', icon: Landmark, count: services.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="bg-pink-100 p-3 rounded-xl shadow text-pink-500">
                <Landmark className="w-7 h-7" />
              </span>
              <div className="ml-4">
                <h1 className="text-3xl font-extrabold text-gray-800">Gestion des Structures</h1>
                <p className="text-gray-600">Hiérarchie Administrative : Ministères → Directions → Services</p>
              </div>
            </div>
          </div>

          {/* Navigation par onglets */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {tabsConfig.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>

          {/* Sélecteurs hierarchiques */}
          {(activeTab === 'directions' || activeTab === 'services') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={selectedMinistere}
                onChange={(e) => {
                  setSelectedMinistere(e.target.value);
                  setSelectedDirection('');
                }}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">📋 Toutes les {activeTab === 'directions' ? 'directions' : 'structures'}</option>
                <option value="">Filtrer par ministère</option>
                {ministeres.map(ministere => (
                  <option key={ministere.id} value={ministere.id}>
                    {ministere.nom}
                  </option>
                ))}
              </select>

              {activeTab === 'services' && (
                <select
                  value={selectedDirection}
                  onChange={(e) => setSelectedDirection(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">🏢 Tous les services</option>
                  <option value="">Filtrer par direction</option>
                  {directions
                    .filter(direction => 
                      selectedMinistere === 'all' || 
                      !selectedMinistere || 
                      direction.ministereId === selectedMinistere
                    )
                    .map(direction => (
                      <option key={direction.id} value={direction.id}>
                        {direction.nom} {selectedMinistere === 'all' ? `(${direction.ministereName})` : ''}
                      </option>
                    ))
                  }
                </select>
              )}
            </div>
          )}

          {/* Barre de recherche et actions */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Rechercher des ${activeTab}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {hasPermission('CREATE_STRUCTURES') && (
              <button
                onClick={() => openModal(activeTab.slice(0, -1))} // Remove 's' from end
                disabled={
                  (activeTab === 'directions' && !selectedMinistere && selectedMinistere !== 'all') ||
                  (activeTab === 'services' && (!selectedMinistere || selectedMinistere === '') && (!selectedDirection || selectedDirection === ''))
                }
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau {activeTab.slice(0, -1)}
              </button>
            )}
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  {activeTab !== 'ministeres' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  {(selectedMinistere === 'all' || selectedDirection === 'all') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statistiques
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(() => {
                  let items = [];
                  if (activeTab === 'ministeres') {
                    items = filterItems(ministeres);
                  } else if (activeTab === 'directions') {
                    items = filterItems(directions);
                  } else if (activeTab === 'services') {
                    items = filterItems(services);
                  }

                  if (items.length === 0) {
                    const colSpan = activeTab !== 'ministeres' ? 
                      ((selectedMinistere === 'all' || selectedDirection === 'all') ? 7 : 6) : 
                      ((selectedMinistere === 'all' || selectedDirection === 'all') ? 6 : 5);
                    return (
                      <tr>
                        <td colSpan={colSpan} className="px-6 py-4 text-center text-gray-500">
                          {search ? 'Aucun résultat trouvé' : `Aucun ${activeTab.slice(0, -1)} trouvé`}
                        </td>
                      </tr>
                    );
                  }

                  return items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.code || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {item.description || '-'}
                      </td>
                      {activeTab !== 'ministeres' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activeTab === 'directions' ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{item.ministereName || '-'}</span>
                            </div>
                          ) : activeTab === 'services' ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-xs text-gray-400">
                                {item.ministereName || '-'}
                              </span>
                              <span className="font-medium">
                                {item.directionName || '-'}
                              </span>
                            </div>
                          ) : (
                            item.ministereName || item.directionName || '-'
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.actif 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      {(selectedMinistere === 'all' || selectedDirection === 'all') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.statistiques && (
                            <div className="flex flex-col text-xs">
                              {activeTab === 'ministeres' && (
                                <>
                                  <span>📋 {item.statistiques.nombreDirections || 0} directions</span>
                                  <span>🏢 {item.statistiques.nombreServices || 0} services</span>
                                  <span>📝 {item.statistiques.nombrePlaintes || 0} plaintes</span>
                                </>
                              )}
                              {activeTab === 'directions' && (
                                <>
                                  <span>🏢 {item.statistiques.nombreServices || 0} services</span>
                                  <span>📝 {item.statistiques.nombrePlaintes || 0} plaintes</span>
                                </>
                              )}
                              {activeTab === 'services' && (
                                <span>📝 {item.statistiques.nombrePlaintes || 0} plaintes</span>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {hasPermission('MANAGE_STRUCTURES') && (
                          <>
                            <button
                              onClick={() => openModal(activeTab.slice(0, -1), item)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteItem(activeTab.slice(0, -1), item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de création/modification */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingItem ? 'Modifier' : 'Créer'} {modalType}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Nom du ministère/direction/service"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Code unique"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Description détaillée"
                    />
                  </div>

                  {modalType === 'direction' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ministère *
                      </label>
                      <select
                        value={formData.ministereId}
                        onChange={(e) => setFormData(prev => ({ ...prev, ministereId: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Sélectionnez un ministère</option>
                        {ministeres.map(ministere => (
                          <option key={ministere.id} value={ministere.id}>
                            {ministere.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {modalType === 'service' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ministère *
                        </label>
                        <select
                          value={formData.ministereId}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, ministereId: e.target.value, directionId: '' }));
                            // Les directions sont déjà chargées via fetchAllDirections
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Sélectionnez un ministère</option>
                          {ministeres.map(ministere => (
                            <option key={ministere.id} value={ministere.id}>
                              {ministere.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Direction *
                        </label>
                        <select
                          value={formData.directionId}
                          onChange={(e) => setFormData(prev => ({ ...prev, directionId: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={!formData.ministereId}
                        >
                          <option value="">Sélectionnez une direction</option>
                          {directions
                            .filter(direction => direction.ministereId === formData.ministereId)
                            .map(direction => (
                              <option key={direction.id} value={direction.id}>
                                {direction.nom}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  )}

                  {modalType === 'ministere' && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="tel"
                          placeholder="Téléphone"
                          value={formData.contact.telephone}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            contact: { ...prev.contact, telephone: e.target.value }
                          }))}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={formData.contact.email}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            contact: { ...prev.contact, email: e.target.value }
                          }))}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Adresse"
                          value={formData.contact.adresse}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            contact: { ...prev.contact, adresse: e.target.value }
                          }))}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {modalType === 'service' && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-2">Localisation</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="number"
                          step="any"
                          placeholder="Latitude"
                          value={formData.localisation.latitude}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            localisation: { ...prev.localisation, latitude: e.target.value }
                          }))}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                          type="number"
                          step="any"
                          placeholder="Longitude"
                          value={formData.localisation.longitude}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            localisation: { ...prev.localisation, longitude: e.target.value }
                          }))}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Adresse"
                          value={formData.localisation.adresse}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            localisation: { ...prev.localisation, adresse: e.target.value }
                          }))}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingItem ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
