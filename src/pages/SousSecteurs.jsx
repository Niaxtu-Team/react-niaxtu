import React, { useState, useEffect } from 'react';
import { Layers, Search, Filter, Eye, Edit, Plus, Trash2, Building } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function SousSecteurs() {
  const { apiService } = useAuth();
  const [sousSecteurs, setSousSecteurs] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSecteur, setSelectedSecteur] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Données simulées
  const SOUS_SECTEURS_DATA = [
    {
      id: 'ss_001',
      nom: 'Transport urbain',
      description: 'Gestion des transports en commun urbains',
      secteur: 'Transport',
      secteurId: 'sect_001',
      statut: 'actif',
      dateCreation: '2025-01-15',
      nombrePlaintes: 45,
      responsable: 'Ahmed Benali'
    },
    {
      id: 'ss_002',
      nom: 'Transport rural',
      description: 'Gestion des transports en zones rurales',
      secteur: 'Transport',
      secteurId: 'sect_001',
      statut: 'actif',
      dateCreation: '2025-01-14',
      nombrePlaintes: 23,
      responsable: 'Fatima Alaoui'
    },
    {
      id: 'ss_003',
      nom: 'Eau potable',
      description: 'Distribution et qualité de l\'eau potable',
      secteur: 'Eau',
      secteurId: 'sect_002',
      statut: 'actif',
      dateCreation: '2025-01-12',
      nombrePlaintes: 67,
      responsable: 'Omar Tazi'
    },
    {
      id: 'ss_004',
      nom: 'Assainissement',
      description: 'Gestion des eaux usées et assainissement',
      secteur: 'Eau',
      secteurId: 'sect_002',
      statut: 'actif',
      dateCreation: '2025-01-10',
      nombrePlaintes: 34,
      responsable: 'Aicha Benali'
    },
    {
      id: 'ss_005',
      nom: 'Électricité',
      description: 'Distribution électrique et pannes',
      secteur: 'Énergie',
      secteurId: 'sect_003',
      statut: 'actif',
      dateCreation: '2025-01-08',
      nombrePlaintes: 56,
      responsable: 'Hassan Idrissi'
    },
    {
      id: 'ss_006',
      nom: 'Énergies renouvelables',
      description: 'Projets d\'énergies vertes et durables',
      secteur: 'Énergie',
      secteurId: 'sect_003',
      statut: 'inactif',
      dateCreation: '2025-01-05',
      nombrePlaintes: 12,
      responsable: 'Nadia Alami'
    }
  ];

  const SECTEURS_DATA = [
    { id: 'sect_001', nom: 'Transport' },
    { id: 'sect_002', nom: 'Eau' },
    { id: 'sect_003', nom: 'Énergie' },
    { id: 'sect_004', nom: 'Santé' },
    { id: 'sect_005', nom: 'Éducation' },
    { id: 'sect_006', nom: 'Environnement' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setSousSecteurs(SOUS_SECTEURS_DATA);
          setSecteurs(SECTEURS_DATA);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erreur chargement sous-secteurs:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrage des sous-secteurs
  const sousSecteursFiltrés = sousSecteurs.filter(sousSecteur => {
    const matchSearch = sousSecteur.nom.toLowerCase().includes(search.toLowerCase()) ||
                       sousSecteur.description.toLowerCase().includes(search.toLowerCase()) ||
                       sousSecteur.responsable.toLowerCase().includes(search.toLowerCase());
    
    const matchSecteur = selectedSecteur === '' || sousSecteur.secteur === selectedSecteur;
    
    return matchSearch && matchSecteur;
  });

  // Pagination
  const totalPages = Math.ceil(sousSecteursFiltrés.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const sousSecteursPage = sousSecteursFiltrés.slice(startIndex, startIndex + itemsPerPage);

  const secteursUniques = [...new Set(sousSecteurs.map(ss => ss.secteur))];

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-red-100 text-red-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce sous-secteur ?')) {
      try {
        // TODO: Appel API pour supprimer
        setSousSecteurs(prev => prev.filter(ss => ss.id !== id));
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Chargement des sous-secteurs...</p>
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
              <div className="bg-purple-100 p-3 rounded-xl">
                <Layers className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Sous-Secteurs</h1>
                <p className="text-gray-600">{sousSecteursFiltrés.length} sous-secteurs configurés</p>
              </div>
            </div>
            
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nouveau Sous-Secteur</span>
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <Layers className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-xl font-bold text-gray-900">
                  {sousSecteurs.filter(ss => ss.statut === 'actif').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-lg">
                <Layers className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Inactifs</p>
                <p className="text-xl font-bold text-gray-900">
                  {sousSecteurs.filter(ss => ss.statut === 'inactif').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Secteurs parents</p>
                <p className="text-xl font-bold text-gray-900">
                  {secteursUniques.length}
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
                  {sousSecteurs.reduce((sum, ss) => sum + ss.nombrePlaintes, 0)}
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
                placeholder="Rechercher un sous-secteur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <select
              value={selectedSecteur}
              onChange={(e) => setSelectedSecteur(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Tous les secteurs</option>
              {secteursUniques.map(secteur => (
                <option key={secteur} value={secteur}>{secteur}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setSearch('');
                setSelectedSecteur('');
                setCurrentPage(1);
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secteur parent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plaintes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date création</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sousSecteursPage.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium">Aucun sous-secteur trouvé</p>
                      <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                    </td>
                  </tr>
                ) : (
                  sousSecteursPage.map((sousSecteur) => (
                    <tr key={sousSecteur.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{sousSecteur.nom}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{sousSecteur.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{sousSecteur.secteur}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{sousSecteur.responsable}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{sousSecteur.nombrePlaintes}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(sousSecteur.statut)}`}>
                          {sousSecteur.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{sousSecteur.dateCreation}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>Voir</span>
                          </button>
                          <button className="text-green-600 hover:text-green-900 flex items-center space-x-1">
                            <Edit className="w-4 h-4" />
                            <span>Modifier</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(sousSecteur.id)}
                            className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
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
                      <span className="font-medium">{Math.min(startIndex + itemsPerPage, sousSecteursFiltrés.length)}</span> sur{' '}
                      <span className="font-medium">{sousSecteursFiltrés.length}</span> résultats
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
                              ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
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
    </div>
  );
} 
