import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  Play, 
  MoreHorizontal,
  Calendar,
  MapPin,
  User,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Building,
  Grid,
  List,
  X,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import usePlaintes from '../../hooks/usePlaintes';
import { 
  ComplaintCard,
  ComplaintFilters,
  ComplaintStats,
  Pagination
} from '../../components';

const PlaintesEnAttente = () => {
  const { user, hasPermission } = useAuth();
  const { getPlaintes, updatePlainteStatus, loading, error } = usePlaintes();
  
  const [plaintes, setPlaintes] = useState([]);
  const [filteredPlaintes, setFilteredPlaintes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSecteur, setSelectedSecteur] = useState('');
  const [selectedPriorite, setSelectedPriorite] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPlainte, setSelectedPlainte] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    urgentes: 0,
    anciennes: 0,
    nouvelles: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [targetTypes, setTargetTypes] = useState([]);
  const [ministeres, setMinisteres] = useState([]);

  const itemsPerPage = 12;

  // Charger les plaintes en attente
  const loadPlaintes = async (page = 1) => {
    try {
      const searchFilters = {
        status: 'en-attente',
        limit: itemsPerPage,
        page: page,
        isDraft: false
      };

      if (searchTerm) {
        searchFilters.search = searchTerm.trim();
      }

      const result = await getPlaintes(searchFilters);
      
      setPlaintes(result.plaintes || []);
      setFilteredPlaintes(result.plaintes || []);
      setTotalPages(Math.ceil((result.total || 0) / itemsPerPage));
      
      // Calculer les statistiques
      calculateStats(result.plaintes || []);
      
    } catch (err) {
      console.error('Erreur lors du chargement des plaintes:', err);
    }
  };

  // Calculer les statistiques
  const calculateStats = (plaintesData) => {
    const now = new Date();
    const urgentes = plaintesData.filter(p => p.priority === 'urgente' || p.priority === 'critique').length;
    const anciennes = plaintesData.filter(p => {
      const createdAt = new Date(p.createdAt);
      const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      return diffDays > 7;
    }).length;
    const nouvelles = plaintesData.filter(p => {
      const createdAt = new Date(p.createdAt);
      const diffHours = Math.floor((now - createdAt) / (1000 * 60 * 60));
      return diffHours < 24;
    }).length;

    setStats({
      total: plaintesData.length,
      urgentes,
      anciennes,
      nouvelles
    });
  };

  // Actualiser les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPlaintes(currentPage);
    setIsRefreshing(false);
  };

  // Démarrer le traitement d'une plainte
  const handleStartTraitement = async (plainteId) => {
    if (!hasPermission('MANAGE_COMPLAINTS')) {
      alert('Permission insuffisante pour traiter les plaintes');
      return;
    }

    try {
      await updatePlainteStatus(plainteId, 'en-traitement', 'Traitement démarré par ' + user?.name);
      await loadPlaintes(currentPage); // Recharger les données
    } catch (err) {
      console.error('Erreur lors du démarrage du traitement:', err);
      alert('Erreur lors du démarrage du traitement');
    }
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
        plainte.targetType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSecteur) {
      filtered = filtered.filter(plainte => 
        plainte.publicStructure?.ministereName?.includes(selectedSecteur) ||
        plainte.targetType?.includes(selectedSecteur)
      );
    }

    if (selectedPriorite) {
      filtered = filtered.filter(plainte => plainte.priority === selectedPriorite);
    }

    setFilteredPlaintes(filtered);
  }, [plaintes, searchTerm, selectedSecteur, selectedPriorite]);

  // Charger les données au montage du composant
  useEffect(() => {
    loadPlaintes(currentPage);
  }, [currentPage]);

  // Fonction pour obtenir la couleur selon la priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgente': 
      case 'critique':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse';
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

  // Fonction pour calculer le temps d'attente
  const getTempsAttente = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffHours = Math.floor((now - created) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    }
  };

  // Fonction pour obtenir la couleur du temps d'attente
  const getTempsAttenteColor = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffHours = Math.floor((now - created) / (1000 * 60 * 60));

    if (diffHours > 168) return 'text-red-600'; // Plus de 7 jours
    if (diffHours > 72) return 'text-orange-600'; // Plus de 3 jours
    if (diffHours > 24) return 'text-yellow-600'; // Plus de 1 jour
    return 'text-green-600'; // Moins de 1 jour
  };

  // Export CSV
  const exportToCSV = () => {
    const csvData = filteredPlaintes.map(plainte => ({
      'ID': plainte.id,
      'Type': plainte.complaintType,
      'Cible': plainte.targetType,
      'Description': plainte.description,
      'Priorité': plainte.priority,
      'Temps d\'attente': getTempsAttente(plainte.createdAt),
      'Date de création': new Date(plainte.createdAt).toLocaleDateString('fr-FR'),
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
    a.download = `plaintes-en-attente-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Statistiques personnalisées pour les plaintes en attente
  const customStats = {
    total: stats.total,
    enAttente: stats.total, // Toutes sont en attente
    urgentes: stats.urgentes,
    anciennes: stats.anciennes,
    nouvelles: stats.nouvelles,
    trends: {
      total: null,
      enAttente: null,
      urgentes: null,
      anciennes: null,
      nouvelles: null
    }
  };

  if (loading && plaintes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-yellow-600 mx-auto absolute top-0"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">Chargement des plaintes en attente...</p>
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
            className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-8 py-3 rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
          >
            <RefreshCw className="w-5 h-5 mr-2 inline" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête moderne */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-2xl shadow-lg">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Plaintes en Attente
                </h1>
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {stats.total} plaintes en attente
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
                    viewMode === 'grid' ? 'bg-white shadow-sm text-yellow-600' : 'text-gray-600 hover:text-yellow-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-yellow-600' : 'text-gray-600 hover:text-yellow-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={exportToCSV}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Download className="w-5 h-5 mr-2" />
                Exporter
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Total</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Urgentes</p>
                  <p className="text-3xl font-bold">{stats.urgentes}</p>
                </div>
                <Zap className="w-8 h-8 text-red-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Anciennes</p>
                  <p className="text-3xl font-bold">{stats.anciennes}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Nouvelles</p>
                  <p className="text-3xl font-bold">{stats.nouvelles}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par description, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            <div className="flex space-x-4">
              <select
                value={selectedPriorite}
                onChange={(e) => setSelectedPriorite(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              >
                <option value="">Toutes les priorités</option>
                <option value="urgente">Urgente</option>
                <option value="elevee">Élevée</option>
                <option value="moyenne">Moyenne</option>
                <option value="faible">Faible</option>
              </select>
              
              <select
                value={selectedSecteur}
                onChange={(e) => setSelectedSecteur(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
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
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-8 rounded-2xl w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-lg">
                <Clock className="w-16 h-16 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">Aucune plainte en attente</h3>
              <p className="text-gray-500 text-lg">
                {searchTerm || selectedPriorite || selectedSecteur 
                  ? 'Essayez de modifier vos critères de recherche' 
                  : 'Toutes les plaintes ont été traitées !'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaintes.map((plainte, index) => (
                  <ComplaintCard
                    key={plainte.id}
                    complaint={plainte}
                    onView={handleViewPlainte}
                    onStartTreatment={handleStartTraitement}
                    onDelete={() => {}}
                    showActions={true}
                    showPriority={true}
                    showLocation={true}
                    showTimestamp={true}
                  />
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
                      Priorité
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Temps d'attente
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
                      className="hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 group"
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-2 rounded-lg mr-4 shadow-lg">
                            <FileText className="w-5 h-5 text-white" />
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
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(plainte.priority)}`}>
                          {plainte.priority}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`text-sm font-semibold ${getTempsAttenteColor(plainte.createdAt)}`}>
                          {getTempsAttente(plainte.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(plainte.createdAt).toLocaleDateString('fr-FR')}
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
                          <button
                            onClick={() => handleStartTraitement(plainte.id)}
                            className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-all duration-200"
                            title="Démarrer le traitement"
                          >
                            <Play className="w-4 h-4" />
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
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 rounded-2xl shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Plainte #{selectedPlainte.id?.slice(-8)}
                    </h3>
                    <p className="text-gray-600">En attente depuis {getTempsAttente(selectedPlainte.createdAt)}</p>
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
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                    <label className="text-sm font-bold text-purple-800 uppercase tracking-wide">Priorité</label>
                    <div className="mt-3">
                      <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${getPriorityColor(selectedPlainte.priority)}`}>
                        {selectedPlainte.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
                    <label className="text-sm font-bold text-orange-800 uppercase tracking-wide">Cible</label>
                    <p className="mt-3 text-gray-900 font-semibold">{selectedPlainte.targetType}</p>
                    {selectedPlainte.location?.address && (
                      <div className="mt-2 flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {selectedPlainte.location.address}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    handleStartTraitement(selectedPlainte.id);
                    setShowDetailsModal(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Démarrer le traitement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaintesEnAttente;
