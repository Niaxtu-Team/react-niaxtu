import React, { useState, useEffect } from 'react';
import { Target, Search, Filter, Eye, Edit, Plus, Trash2, Tag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function CiblesTypes() {
  const { apiService } = useAuth();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Données simulées
  const TYPES_CIBLES_DATA = [
    {
      id: 'tc_001',
      nom: 'Service Public',
      description: 'Services publics gouvernementaux',
      categorie: 'Administration',
      couleur: '#3b82f6',
      statut: 'actif',
      dateCreation: '2025-01-15',
      nombrePlaintes: 156,
      icone: 'building'
    },
    {
      id: 'tc_002',
      nom: 'Infrastructure',
      description: 'Infrastructures publiques (routes, ponts, etc.)',
      categorie: 'Technique',
      couleur: '#10b981',
      statut: 'actif',
      dateCreation: '2025-01-14',
      nombrePlaintes: 89,
      icone: 'construction'
    },
    {
      id: 'tc_003',
      nom: 'Transport Public',
      description: 'Transports en commun et mobilité',
      categorie: 'Transport',
      couleur: '#f59e0b',
      statut: 'actif',
      dateCreation: '2025-01-12',
      nombrePlaintes: 234,
      icone: 'bus'
    },
    {
      id: 'tc_004',
      nom: 'Santé Publique',
      description: 'Établissements et services de santé',
      categorie: 'Santé',
      couleur: '#ef4444',
      statut: 'actif',
      dateCreation: '2025-01-10',
      nombrePlaintes: 67,
      icone: 'heart'
    },
    {
      id: 'tc_005',
      nom: 'Éducation',
      description: 'Établissements scolaires et universitaires',
      categorie: 'Éducation',
      couleur: '#8b5cf6',
      statut: 'actif',
      dateCreation: '2025-01-08',
      nombrePlaintes: 45,
      icone: 'book'
    },
    {
      id: 'tc_006',
      nom: 'Environnement',
      description: 'Questions environnementales et écologiques',
      categorie: 'Environnement',
      couleur: '#059669',
      statut: 'actif',
      dateCreation: '2025-01-05',
      nombrePlaintes: 78,
      icone: 'leaf'
    },
    {
      id: 'tc_007',
      nom: 'Sécurité',
      description: 'Sécurité publique et ordre public',
      categorie: 'Sécurité',
      couleur: '#dc2626',
      statut: 'inactif',
      dateCreation: '2025-01-03',
      nombrePlaintes: 23,
      icone: 'shield'
    }
  ];

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setTypes(TYPES_CIBLES_DATA);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erreur chargement types de cibles:', error);
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  // Filtrage des types
  const typesFiltrés = types.filter(type => {
    const matchSearch = type.nom.toLowerCase().includes(search.toLowerCase()) ||
                       type.description.toLowerCase().includes(search.toLowerCase());
    
    const matchCategorie = selectedCategorie === '' || type.categorie === selectedCategorie;
    
    return matchSearch && matchCategorie;
  });

  // Pagination
  const totalPages = Math.ceil(typesFiltrés.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const typesPage = typesFiltrés.slice(startIndex, startIndex + itemsPerPage);

  const categories = [...new Set(types.map(t => t.categorie))];

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-red-100 text-red-800';
      case 'brouillon': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type de cible ?')) {
      try {
        // TODO: Appel API pour supprimer
        setTypes(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Chargement des types de cibles...</p>
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
            
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nouveau Type</span>
            </button>
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
                  {types.filter(t => t.statut === 'actif').length}
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
                <p className="text-sm text-gray-600">Catégories</p>
                <p className="text-xl font-bold text-gray-900">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total plaintes</p>
                <p className="text-xl font-bold text-gray-900">
                  {types.reduce((sum, t) => sum + t.nombrePlaintes, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Plus utilisé</p>
                <p className="text-xl font-bold text-gray-900">
                  {types.reduce((max, t) => t.nombrePlaintes > max.nombrePlaintes ? t : max, types[0])?.nom.slice(0, 8)}...
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
                style={{ backgroundColor: type.couleur }}
              ></div>
              
              <div className="p-6">
                {/* En-tête */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${type.couleur}20` }}
                    >
                      <Target 
                        className="w-6 h-6"
                        style={{ color: type.couleur }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{type.nom}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(type.statut)}`}>
                        {type.statut}
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
                    <span className="font-medium text-gray-900">{type.categorie}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Plaintes:</span>
                    <span className="font-medium text-gray-900">{type.nombrePlaintes}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Créé le:</span>
                    <span className="font-medium text-gray-900">{type.dateCreation}</span>
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
