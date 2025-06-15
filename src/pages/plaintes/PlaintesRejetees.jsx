import React, { useState, useEffect } from 'react';
import { 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  User, 
  AlertTriangle, 
  FileText,
  Download,
  RefreshCw,
  MoreHorizontal,
  Shield,
  Clock,
  Grid,
  List,
  X,
  TrendingDown,
  Ban,
  Target,
  Info
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import usePlaintes from '../../hooks/usePlaintes';
import { 
  ComplaintCard,
  ComplaintFilters,
  ComplaintStats,
  Pagination
} from '../../components';

const PlaintesRejetees = () => {
  const { user } = useAuth();
  const { getPlaintes, loading, error } = usePlaintes();
  
  const [plaintes, setPlaintes] = useState([]);
  const [filteredPlaintes, setFilteredPlaintes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSecteur, setSelectedSecteur] = useState('');
  const [selectedMotif, setSelectedMotif] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPlainte, setSelectedPlainte] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    cetteSemine: 0,
    tauxRejet: 0,
    motifsFrequents: {}
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const itemsPerPage = 12;

  // Motifs de rejet prédéfinis
  const MOTIFS_REJET = {
    'hors-competence': 'Hors compétence',
    'doublon': 'Doublon',
    'informations-insuffisantes': 'Informations insuffisantes',
    'non-fondee': 'Non fondée',
    'spam': 'Spam/Abus',
    'autre': 'Autre motif'
  };

  // Charger les plaintes rejetées
  const loadPlaintes = async (page = 1) => {
    try {
      const filters = {
        status: 'rejetee',
        limit: itemsPerPage,
        page: page,
        isDraft: false
      };

      const result = await getPlaintes(filters);
      
      setPlaintes(result.plaintes);
      setFilteredPlaintes(result.plaintes);
      setTotalPages(Math.ceil(result.total / itemsPerPage));
      
      // Calculer les statistiques
      calculateStats(result.plaintes);
      
    } catch (err) {
      console.error('Erreur lors du chargement des plaintes:', err);
    }
  };

  // Calculer les statistiques
  const calculateStats = (plaintesData) => {
    const now = new Date();
    const cetteSemine = plaintesData.filter(p => {
      const rejectedAt = new Date(p.rejectedAt || p.updatedAt);
      const diffDays = Math.floor((now - rejectedAt) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    // Calculer les motifs fréquents
    const motifsFrequents = {};
    plaintesData.forEach(p => {
      const motif = p.rejectionReason || 'autre';
      motifsFrequents[motif] = (motifsFrequents[motif] || 0) + 1;
    });

    // Simuler le taux de rejet (à remplacer par une vraie statistique)
    const tauxRejet = Math.round((plaintesData.length / (plaintesData.length + 50)) * 100); // Simulation

    setStats({
      total: plaintesData.length,
      cetteSemine,
      tauxRejet,
      motifsFrequents
    });
  };

  // Actualiser les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPlaintes(currentPage);
    setIsRefreshing(false);
  };

  // Voir les détails d'une plainte
  const handleViewPlainte = (plainte) => {
    setSelectedPlainte(plainte);
    setShowDetailsModal(true);
  };

  // Filtrer les plaintes
  useEffect(() => {
    let filtered = plaintes;

    if (searchTerm) {
      filtered = filtered.filter(plainte =>
        plainte.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plainte.complaintType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plainte.targetType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plainte.rejectionReason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSecteur) {
      filtered = filtered.filter(plainte => 
        plainte.publicStructure?.ministereName?.includes(selectedSecteur) ||
        plainte.targetType?.includes(selectedSecteur)
      );
    }

    if (selectedMotif) {
      filtered = filtered.filter(plainte => plainte.rejectionReason === selectedMotif);
    }

    setFilteredPlaintes(filtered);
  }, [plaintes, searchTerm, selectedSecteur, selectedMotif]);

  // Charger les données au montage du composant
  useEffect(() => {
    loadPlaintes(currentPage);
  }, [currentPage]);

  // Fonction pour obtenir la couleur selon la priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgente': 
      case 'critique':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'elevee': 
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      case 'moyenne': 
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'faible': 
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      default: 
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  // Fonction pour obtenir la couleur du motif
  const getMotifColor = (motif) => {
    switch (motif) {
      case 'hors-competence': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'doublon': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'informations-insuffisantes': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      case 'non-fondee': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'spam': return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const csvData = filteredPlaintes.map(plainte => ({
      'ID': plainte.id,
      'Type': plainte.complaintType,
      'Cible': plainte.targetType,
      'Description': plainte.description,
      'Priorité': plainte.priority,
      'Motif de rejet': MOTIFS_REJET[plainte.rejectionReason] || plainte.rejectionReason,
      'Rejeté par': plainte.rejectedBy || 'Non spécifié',
      'Date de création': new Date(plainte.createdAt).toLocaleDateString('fr-FR'),
      'Date de rejet': new Date(plainte.rejectedAt || plainte.updatedAt).toLocaleDateString('fr-FR'),
      'Localisation': plainte.location?.address || 'Non spécifiée'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plaintes-rejetees-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && plaintes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-red-600 mx-auto absolute top-0"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">Chargement des plaintes rejetées...</p>
            <p className="text-sm text-gray-500">Veuillez patienter</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl max-w-md border border-red-200">
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <AlertTriangle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
          >
            <RefreshCw className="w-5 h-5 mr-2 inline" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête moderne */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl shadow-lg">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Plaintes Rejetées
                </h1>
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {stats.total} plaintes rejetées
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
                disabled={isRefreshing}
                className="flex items-center px-4 py-2 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              
              <div className="flex items-center bg-gray-100/80 rounded-xl p-1 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-red-600' : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={exportToCSV}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Download className="w-5 h-5 mr-2" />
                Exporter
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total rejetées</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Cette semaine</p>
                  <p className="text-3xl font-bold">{stats.cetteSemine}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-orange-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Taux de rejet</p>
                  <p className="text-3xl font-bold">{stats.tauxRejet}%</p>
                </div>
                <Ban className="w-8 h-8 text-purple-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm font-medium">Motifs différents</p>
                  <p className="text-3xl font-bold">{Object.keys(stats.motifsFrequents).length}</p>
                </div>
                <Info className="w-8 h-8 text-gray-200" />
              </div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par description, type, motif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            <div className="flex space-x-4">
              <select
                value={selectedMotif}
                onChange={(e) => setSelectedMotif(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              >
                <option value="">Tous les motifs</option>
                {Object.entries(MOTIFS_REJET).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              
              <select
                value={selectedSecteur}
                onChange={(e) => setSelectedSecteur(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              >
                <option value="">Tous les secteurs</option>
                <option value="Santé">Santé</option>
                <option value="Éducation">Éducation</option>
                <option value="Transport">Transport</option>
                <option value="Justice">Justice</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenu selon le mode d'affichage */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20">
          {filteredPlaintes.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-red-100 to-red-200 p-8 rounded-2xl w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-lg">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">Aucune plainte rejetée</h3>
              <p className="text-gray-500 text-lg">
                {searchTerm || selectedMotif || selectedSecteur 
                  ? 'Essayez de modifier vos critères de recherche' 
                  : 'Aucune plainte n\'a été rejetée'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaintes.map((plainte, index) => (
                  <div 
                    key={plainte.id} 
                    className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-lg shadow-lg">
                          <Ban className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                            {plainte.complaintType}
                          </h3>
                          <p className="text-gray-600 text-sm">#{plainte.id?.slice(-8)}</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-300">
                        ✗ Rejetée
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {plainte.description}
                    </p>

                    {/* Motif de rejet */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getMotifColor(plainte.rejectionReason)}`}>
                        {MOTIFS_REJET[plainte.rejectionReason] || plainte.rejectionReason || 'Motif non spécifié'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Target className="w-3 h-3 mr-2" />
                        {plainte.targetType}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-2" />
                        Rejeté le {new Date(plainte.rejectedAt || plainte.updatedAt).toLocaleDateString('fr-FR')}
                      </div>
                      {plainte.rejectedBy && (
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-2" />
                          Par {plainte.rejectedBy}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPlainte(plainte)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-200 text-sm font-semibold"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Plainte
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Type & Cible
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Motif de rejet
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Rejeté par
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Date de rejet
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-100">
                  {filteredPlaintes.map((plainte, index) => (
                    <tr 
                      key={plainte.id} 
                      className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 group"
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-lg mr-4 shadow-lg">
                            <Ban className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              #{plainte.id?.slice(-8)}
                            </div>
                            <div className="text-sm text-gray-600 max-w-xs line-clamp-2">
                              {plainte.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{plainte.complaintType}</div>
                          <div className="text-sm text-gray-600">{plainte.targetType}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getMotifColor(plainte.rejectionReason)}`}>
                          {MOTIFS_REJET[plainte.rejectionReason] || plainte.rejectionReason || 'Non spécifié'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-semibold text-gray-900">
                          {plainte.rejectedBy || 'Non spécifié'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-semibold text-red-600">
                          {new Date(plainte.rejectedAt || plainte.updatedAt).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(plainte.rejectedAt || plainte.updatedAt).toLocaleTimeString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={() => handleViewPlainte(plainte)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-all duration-200"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 font-semibold">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de détails plainte */}
      {showDetailsModal && selectedPlainte && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-2xl shadow-lg">
                    <Ban className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Plainte #{selectedPlainte.id?.slice(-8)} - Rejetée
                    </h3>
                    <p className="text-gray-600">Rejetée le {new Date(selectedPlainte.rejectedAt || selectedPlainte.updatedAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <label className="text-sm font-bold text-blue-800 uppercase tracking-wide">Description</label>
                    <p className="mt-3 text-gray-900 leading-relaxed">{selectedPlainte.description}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <label className="text-sm font-bold text-green-800 uppercase tracking-wide">Type de plainte</label>
                    <p className="mt-3 text-gray-900 font-semibold">{selectedPlainte.complaintType}</p>
                  </div>

                  {selectedPlainte.rejectionComment && (
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-2xl border border-yellow-200">
                      <label className="text-sm font-bold text-yellow-800 uppercase tracking-wide">Commentaire de rejet</label>
                      <p className="mt-3 text-gray-900 leading-relaxed">{selectedPlainte.rejectionComment}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border border-red-200">
                    <label className="text-sm font-bold text-red-800 uppercase tracking-wide">Motif de rejet</label>
                    <div className="mt-3">
                      <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${getMotifColor(selectedPlainte.rejectionReason)}`}>
                        {MOTIFS_REJET[selectedPlainte.rejectionReason] || selectedPlainte.rejectionReason || 'Non spécifié'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
                    <label className="text-sm font-bold text-orange-800 uppercase tracking-wide">Cible</label>
                    <p className="mt-3 text-gray-900 font-semibold">{selectedPlainte.targetType}</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                    <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Informations</label>
                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <div>Créé le: {new Date(selectedPlainte.createdAt).toLocaleDateString('fr-FR')}</div>
                      <div className="text-red-600 font-semibold">
                        Rejeté le: {new Date(selectedPlainte.rejectedAt || selectedPlainte.updatedAt).toLocaleDateString('fr-FR')}
                      </div>
                      {selectedPlainte.rejectedBy && (
                        <div>Rejeté par: {selectedPlainte.rejectedBy}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaintesRejetees;
