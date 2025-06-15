import React, { useState, useEffect } from 'react';
import { Layers, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { 
  SearchBar, 
  FilterPanel, 
  StatCardGrid, 
  StructureCard,
  Pagination
} from '../../components';

export default function SousSecteurs() {
  const { apiService } = useAuth();
  const [sousSecteurs, setSousSecteurs] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSecteur, setSelectedSecteur] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Données simulées
  const SOUS_SECTEURS_DATA = [
    {
      id: 'ss_001',
      nom: 'Transport urbain',
      description: 'Gestion des transports en commun urbains',
      secteur: 'Transport',
      secteurId: 'sect_001',
      statut: 'actif',
      isActive: true,
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
      isActive: true,
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
      isActive: true,
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
      isActive: true,
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
      isActive: true,
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
      isActive: false,
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

  // Actions sur les sous-secteurs
  const handleViewSousSecteur = (sousSecteur) => {
    window.location.href = `/admin/sous-secteurs/${sousSecteur.id}/details`;
  };

  const handleEditSousSecteur = (sousSecteur) => {
    window.location.href = `/admin/sous-secteurs/${sousSecteur.id}/edit`;
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

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      // TODO: Appel API pour changer le statut
      setSousSecteurs(prev => prev.map(ss => 
        ss.id === id ? { ...ss, isActive: !currentStatus } : ss
      ));
    } catch (error) {
      console.error('Erreur changement statut:', error);
    }
  };

  // Configuration des filtres
  const filterOptions = [
    {
      key: 'secteur',
      label: 'Secteur',
      options: [
        { value: '', label: 'Tous les secteurs' },
        ...secteursUniques.map(secteur => ({
          value: secteur,
          label: secteur
        }))
      ]
    }
  ];

  // Statistiques pour les cartes
  const stats = [
    {
      title: 'Sous-secteurs actifs',
      value: sousSecteurs.filter(ss => ss.isActive).length,
      icon: Layers,
      color: 'green',
      trend: null
    },
    {
      title: 'Total sous-secteurs',
      value: sousSecteurs.length,
      icon: Layers,
      color: 'purple',
      trend: null
    },
    {
      title: 'Secteurs couverts',
      value: secteursUniques.length,
      icon: Layers,
      color: 'blue',
      trend: null
    },
    {
      title: 'Plaintes totales',
      value: sousSecteurs.reduce((sum, ss) => sum + ss.nombrePlaintes, 0),
      icon: Layers,
      color: 'orange',
      trend: null
    }
  ];

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
            
            <button 
              onClick={() => window.location.href = '/admin/sous-secteurs/nouveau'}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Sous-Secteur</span>
            </button>
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
                placeholder="Rechercher un sous-secteur..."
              />
            </div>
            <FilterPanel
              filters={{ secteur: selectedSecteur }}
              onFiltersChange={(filters) => setSelectedSecteur(filters.secteur)}
              options={filterOptions}
            />
          </div>
        </div>

        {/* Liste des sous-secteurs */}
        {sousSecteursPage.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun sous-secteur trouvé</h3>
            <p className="text-gray-500 mb-4">
              {search || selectedSecteur 
                ? 'Aucun résultat ne correspond à vos critères de recherche'
                : 'Commencez par créer votre premier sous-secteur'
              }
            </p>
            {!search && !selectedSecteur && (
              <button
                onClick={() => window.location.href = '/admin/sous-secteurs/nouveau'}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un sous-secteur
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {sousSecteursPage.map((sousSecteur) => (
              <StructureCard
                key={sousSecteur.id}
                structure={sousSecteur}
                type="sous-secteur"
                onView={handleViewSousSecteur}
                onEdit={handleEditSousSecteur}
                onDelete={() => handleDelete(sousSecteur.id)}
                onToggleStatus={handleToggleStatus}
                showStats={true}
                showContact={false}
                showLocation={false}
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
