import React, { useState, useEffect } from 'react';
import { Target, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';  
import { useTargetTypes } from '../../hooks/useTargetTypes';
import { 
  SearchBar, 
  FilterPanel, 
  StatCardGrid, 
  TypeCard 
} from '../../components';

export default function CiblesTypes() {
  const { hasPermission } = useAuth();
  const { targetTypes, loading, error, fetchTargetTypes, deleteTargetType, toggleTargetTypeStatus } = useTargetTypes();
  
  const [search, setSearch] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const categories = [...new Set(targetTypes.map(t => t.category).filter(Boolean))];

  // Actions sur les types
  const handleViewType = (type) => {
    // Navigation vers les détails/statistiques
    window.location.href = `/admin/cibles/types/${type.id}/stats`;
  };

  const handleEditType = (type) => {
    // Navigation vers l'édition
    window.location.href = `/admin/cibles/types/${type.id}/edit`;
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

  // Configuration des filtres
  const filterOptions = [
    {
      key: 'category',
      label: 'Catégorie',
      options: [
        { value: '', label: 'Toutes les catégories' },
        ...categories.map(cat => ({
          value: cat,
          label: cat
        }))
      ]
    }
  ];

  // Statistiques pour les cartes
  const stats = [
    {
      title: 'Types actifs',
      value: targetTypes.filter(t => t.isActive).length,
      icon: Target,
      color: 'green',
      trend: null
    },
    {
      title: 'Total types',
      value: targetTypes.length,
      icon: Target,
      color: 'blue',
      trend: null
    },
    {
      title: 'Catégories',
      value: categories.length,
      icon: Target,
      color: 'yellow',
      trend: null
    },
    {
      title: 'Inactifs',
      value: targetTypes.filter(t => !t.isActive).length,
      icon: Target,
      color: 'red',
      trend: null
    }
  ];

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

        {/* Statistiques */}
        <StatCardGrid stats={stats} className="mb-6" />

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher un type..."
              />
            </div>
            <FilterPanel
              filters={{ category: selectedCategorie }}
              onFiltersChange={(filters) => setSelectedCategorie(filters.category)}
              options={filterOptions}
            />
          </div>
        </div>

        {/* Liste des types */}
        {typesFiltrés.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun type de cible trouvé</h3>
            <p className="text-gray-500 mb-4">
              {search || selectedCategorie 
                ? 'Aucun résultat ne correspond à vos critères de recherche'
                : 'Commencez par créer votre premier type de cible'
              }
            </p>
            {hasPermission('CREATE_TARGET_TYPES') && !search && !selectedCategorie && (
              <button
                onClick={() => window.location.href = '/admin/cibles/types/nouveau'}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un type
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {typesFiltrés.map((type) => (
              <TypeCard
                key={type.id}
                type={type}
                onView={handleViewType}
                onEdit={handleEditType}
                onDelete={() => handleDelete(type.id)}
                onToggleStatus={handleToggleStatus}
                showSector={false}
                showCode={false}
                showKeywords={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 

