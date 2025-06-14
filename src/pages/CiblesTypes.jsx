import React, { useState, useEffect } from 'react';
import { Target, Search, Filter, Eye, Edit, Plus, Trash2, Tag, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTargetTypes } from '../hooks/useTargetTypes';

export default function CiblesTypes() {
  const { hasPermission } = useAuth();
  const { targetTypes, loading, error, fetchTargetTypes, deleteTargetType, toggleTargetTypeStatus } = useTargetTypes();
  
  const [search, setSearch] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 10;

  // Actualiser les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTargetTypes();
    setIsRefreshing(false);
  };

  // Filtrage des types
  const typesFiltrés = targetTypes.filter(type => {
    const matchSearch = type.name?.toLowerCase().includes(search.toLowerCase()) ||
                       type.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchCategorie = selectedCategorie === '' || type.category === selectedCategorie;
    
    return matchSearch && matchCategorie;
  });

  // Pagination
  const totalPages = Math.ceil(typesFiltrés.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const typesPage = typesFiltrés.slice(startIndex, startIndex + itemsPerPage);

  const categories = [...new Set(targetTypes.map(t => t.category).filter(Boolean))];

  const getStatutColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatutText = (isActive) => {
    return isActive ? 'Actif' : 'Inactif';
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type de cible ?')) {
      const result = await deleteTargetType(id);
      if (!result.success) {
        alert('Erreur lors de la suppression: ' + result.error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const result = await toggleTargetTypeStatus(id, currentStatus);
    if (!result.success) {
      alert('Erreur lors du changement de statut: ' + result.error);
    }
  };

  if (loading && targetTypes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Chargement des types de cibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-3 rounded-xl">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Types de Cibles</h1>
                <p className="text-gray-600">Gestion des catégories de cibles pour les plaintes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
              
              {hasPermission('CREATE_TARGET_TYPES') && (
                <button 
                  onClick={() => window.location.href = '/admin/cibles/types/nouveau'}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Type</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Types actifs</p>
                <p className="text-xl font-bold text-gray-900">
                  {targetTypes.filter(t => t.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total types</p>
                <p className="text-xl font-bold text-gray-900">{targetTypes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Filter className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Catégories</p>
                <p className="text-xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Inactifs</p>
                <p className="text-xl font-bold text-gray-900">
                  {targetTypes.filter(t => !t.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <select
              value={selectedCategorie}
              onChange={(e) => setSelectedCategorie(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(categorie => (
                <option key={categorie} value={categorie}>{categorie}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategorie('');
                setCurrentPage(1);
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        {/* Grille des types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {typesPage.map((type) => (
            <div key={type.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Header avec couleur */}
              <div 
                className="h-2"
                style={{ backgroundColor: type.color }}
              ></div>
              
              <div className="p-6">
                {/* En-tête */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${type.color}20` }}
                    >
                      <Target 
                        className="w-6 h-6"
                        style={{ color: type.color }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(type.isActive)}`}>
                        {getStatutText(type.isActive)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{type.description}</p>

                {/* Métadonnées */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Catégorie:</span>
                    <span className="font-medium text-gray-900">{type.category || 'Non définie'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Plaintes:</span>
                    <span className="font-medium text-gray-900">{type.complaintsCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Créé le:</span>
                    <span className="font-medium text-gray-900">
                      {type.createdAt ? new Date(type.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 text-sm">
                      <Eye className="w-4 h-4" />
                      <span>Voir</span>
                    </button>
                    <button className="text-green-600 hover:text-green-900 flex items-center space-x-1 text-sm">
                      <Edit className="w-4 h-4" />
                      <span>Modifier</span>
                    </button>
                  </div>
                  <button 
                    onClick={() => handleDelete(type.id)}
                    className="text-red-600 hover:text-red-900 flex items-center space-x-1 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {typesPage.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun type de cible trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, typesFiltrés.length)}</span> sur{' '}
                    <span className="font-medium">{typesFiltrés.length}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
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
  );
} 

