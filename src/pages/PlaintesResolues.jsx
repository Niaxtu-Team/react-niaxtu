import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  User, 
  Download, 
  MapPin,
  RefreshCw,
  AlertTriangle,
  FileText,
  MoreHorizontal,
  Clock,
  Grid,
  List,
  X,
  TrendingUp,
  Award,
  Target,
  Sparkles
} from 'lucide-react';
import usePlaintes from '../hooks/usePlaintes';

const PlaintesResolues = () => {
  const { getPlaintes, loading, error } = usePlaintes();
  
  const [plaintes, setPlaintes] = useState([]);
  const [filteredPlaintes, setFilteredPlaintes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSecteur, setSelectedSecteur] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPlainte, setSelectedPlainte] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    cetteSemine: 0,
    ceMois: 0,
    tempsResolutionMoyen: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const itemsPerPage = 12;

  // Charger les plaintes résolues
  const loadPlaintes = async (page = 1) => {
    try {
      const filters = {
        status: 'resolue',
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
      const resolvedAt = new Date(p.resolvedAt || p.updatedAt);
      const diffDays = Math.floor((now - resolvedAt) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;
    
    const ceMois = plaintesData.filter(p => {
      const resolvedAt = new Date(p.resolvedAt || p.updatedAt);
      const diffDays = Math.floor((now - resolvedAt) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }).length;

    // Calculer le temps de résolution moyen
    const tempsResolutions = plaintesData.map(p => {
      const created = new Date(p.createdAt);
      const resolved = new Date(p.resolvedAt || p.updatedAt);
      return Math.floor((resolved - created) / (1000 * 60 * 60 * 24));
    });
    const tempsResolutionMoyen = tempsResolutions.length > 0 
      ? Math.round(tempsResolutions.reduce((a, b) => a + b, 0) / tempsResolutions.length)
      : 0;

    setStats({
      total: plaintesData.length,
      cetteSemine,
      ceMois,
      tempsResolutionMoyen
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
        plainte.targetType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSecteur) {
      filtered = filtered.filter(plainte => 
        plainte.publicStructure?.ministereName?.includes(selectedSecteur) ||
        plainte.targetType?.includes(selectedSecteur)
      );
    }

    if (selectedPeriode) {
      filtered = filtered.filter(plainte => {
        const resolvedAt = new Date(plainte.resolvedAt || plainte.updatedAt);
        const now = new Date();
        const diffDays = Math.floor((now - resolvedAt) / (1000 * 60 * 60 * 24));
        
        switch (selectedPeriode) {
          case '7j': return diffDays <= 7;
          case '30j': return diffDays <= 30;
          case '90j': return diffDays <= 90;
          default: return true;
        }
      });
    }

    setFilteredPlaintes(filtered);
  }, [plaintes, searchTerm, selectedSecteur, selectedPeriode]);

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

  // Fonction pour calculer le temps de résolution
  const getTempsResolution = (createdAt, resolvedAt) => {
    const created = new Date(createdAt);
    const resolved = new Date(resolvedAt || new Date());
    const diffDays = Math.floor((resolved - created) / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((resolved - created) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    }
  };

  // Obtenir la couleur du temps de résolution
  const getTempsResolutionColor = (createdAt, resolvedAt) => {
    const created = new Date(createdAt);
    const resolved = new Date(resolvedAt || new Date());
    const diffDays = Math.floor((resolved - created) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'text-green-600'; // Très rapide
    if (diffDays <= 3) return 'text-blue-600'; // Rapide
    if (diffDays <= 7) return 'text-yellow-600'; // Normal
    return 'text-orange-600'; // Lent
  };

  // Export CSV
  const exportToCSV = () => {
    const csvData = filteredPlaintes.map(plainte => ({
      'ID': plainte.id,
      'Type': plainte.complaintType,
      'Cible': plainte.targetType,
      'Description': plainte.description,
      'Priorité': plainte.priority,
      'Temps de résolution': getTempsResolution(plainte.createdAt, plainte.resolvedAt),
      'Date de création': new Date(plainte.createdAt).toLocaleDateString('fr-FR'),
      'Date de résolution': new Date(plainte.resolvedAt || plainte.updatedAt).toLocaleDateString('fr-FR'),
      'Localisation': plainte.location?.address || 'Non spécifiée',
      'Solution': plainte.resolution || 'Non spécifiée'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plaintes-resolues-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && plaintes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-green-600 mx-auto absolute top-0"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">Chargement des plaintes résolues...</p>
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
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
          >
            <RefreshCw className="w-5 h-5 mr-2 inline" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête moderne */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Plaintes Résolues
                </h1>
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {stats.total} plaintes résolues
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
                    viewMode === 'grid' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600 hover:text-green-600'
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
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total résolues</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Cette semaine</p>
                  <p className="text-3xl font-bold">{stats.cetteSemine}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Ce mois</p>
                  <p className="text-3xl font-bold">{stats.ceMois}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Temps moyen</p>
                  <p className="text-3xl font-bold">{stats.tempsResolutionMoyen}j</p>
                </div>
                <Award className="w-8 h-8 text-orange-200" />
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
                className="w-full pl-14 pr-6 py-4 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            <div className="flex space-x-4">
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              >
                <option value="">Toutes les périodes</option>
                <option value="7j">7 derniers jours</option>
                <option value="30j">30 derniers jours</option>
                <option value="90j">90 derniers jours</option>
              </select>
              
              <select
                value={selectedSecteur}
                onChange={(e) => setSelectedSecteur(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
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
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-8 rounded-2xl w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">Aucune plainte résolue</h3>
              <p className="text-gray-500 text-lg">
                {searchTerm || selectedPeriode || selectedSecteur 
                  ? 'Essayez de modifier vos critères de recherche' 
                  : 'Aucune plainte n\'a encore été résolue'}
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
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg shadow-lg">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                            {plainte.complaintType}
                          </h3>
                          <p className="text-gray-600 text-sm">#{plainte.id?.slice(-8)}</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-300">
                        ✓ Résolu
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {plainte.description}
                    </p>

                    <div className="space-y-2 text-xs text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Target className="w-3 h-3 mr-2" />
                        {plainte.targetType}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-2" />
                        Résolu le {new Date(plainte.resolvedAt || plainte.updatedAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div className={`flex items-center ${getTempsResolutionColor(plainte.createdAt, plainte.resolvedAt)}`}>
                        <Clock className="w-3 h-3 mr-2" />
                        Résolu en {getTempsResolution(plainte.createdAt, plainte.resolvedAt)}
                      </div>
                      {plainte.location?.address && (
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-2" />
                          {plainte.location.address.substring(0, 30)}...
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
                      Priorité
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Temps de résolution
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Date de résolution
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
                      className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group"
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg mr-4 shadow-lg">
                            <Sparkles className="w-5 h-5 text-white" />
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
                        <div className={`text-sm font-semibold ${getTempsResolutionColor(plainte.createdAt, plainte.resolvedAt)}`}>
                          {getTempsResolution(plainte.createdAt, plainte.resolvedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Créé le {new Date(plainte.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-semibold text-green-600">
                          {new Date(plainte.resolvedAt || plainte.updatedAt).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(plainte.resolvedAt || plainte.updatedAt).toLocaleTimeString('fr-FR')}
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
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-2xl shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Plainte #{selectedPlainte.id?.slice(-8)} - Résolue
                    </h3>
                    <p className="text-gray-600">Résolu en {getTempsResolution(selectedPlainte.createdAt, selectedPlainte.resolvedAt)}</p>
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

                  {selectedPlainte.resolution && (
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-2xl border border-yellow-200">
                      <label className="text-sm font-bold text-yellow-800 uppercase tracking-wide">Solution apportée</label>
                      <p className="mt-3 text-gray-900 leading-relaxed">{selectedPlainte.resolution}</p>
                    </div>
                  )}
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

                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                    <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Chronologie</label>
                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <div>Créé le: {new Date(selectedPlainte.createdAt).toLocaleDateString('fr-FR')}</div>
                      <div className="text-green-600 font-semibold">
                        Résolu le: {new Date(selectedPlainte.resolvedAt || selectedPlainte.updatedAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div className={`font-semibold ${getTempsResolutionColor(selectedPlainte.createdAt, selectedPlainte.resolvedAt)}`}>
                        Temps de résolution: {getTempsResolution(selectedPlainte.createdAt, selectedPlainte.resolvedAt)}
                      </div>
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

export default PlaintesResolues;
