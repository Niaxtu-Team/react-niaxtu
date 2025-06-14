import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  MoreHorizontal,
  Calendar,
  MapPin,
  User,
  FileText,
  Download,
  RefreshCw,
  Clock,
  AlertTriangle,
  Users,
  Grid,
  List,
  X,
  TrendingUp,
  Zap,
  Activity,
  Target,
  Play
} from 'lucide-react';
import usePlaintes from '../hooks/usePlaintes';

const PlaintesEnTraitement = () => {
  const { getPlaintes, updatePlainteStatus, loading, error } = usePlaintes();
  
  const [plaintes, setPlaintes] = useState([]);
  const [filteredPlaintes, setFilteredPlaintes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSecteur, setSelectedSecteur] = useState('');
  const [selectedPriorite, setSelectedPriorite] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    prioriteElevee: 0,
    enRetard: 0,
    assignees: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const itemsPerPage = 10;

  // Charger les plaintes en traitement
  const loadPlaintes = async (page = 1) => {
    try {
      const filters = {
        status: 'en-traitement',
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
    const prioriteElevee = plaintesData.filter(p => p.priority === 'urgente' || p.priority === 'elevee').length;
    const enRetard = plaintesData.filter(p => {
      const updatedAt = new Date(p.updatedAt || p.createdAt);
      const diffDays = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
      return diffDays > 5; // Plus de 5 jours sans mise à jour
    }).length;
    const assignees = new Set(plaintesData.filter(p => p.assignedTo).map(p => p.assignedTo)).size;

    setStats({
      total: plaintesData.length,
      prioriteElevee,
      enRetard,
      assignees
    });
  };

  // Actualiser les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPlaintes(currentPage);
    setIsRefreshing(false);
  };

  // Marquer comme résolu
  const handleMarkResolved = async (plainteId) => {
    try {
      await updatePlainteStatus(plainteId, 'resolue', 'Plainte résolue par un administrateur');
      await loadPlaintes(currentPage); // Recharger les données
    } catch (err) {
      console.error('Erreur lors de la résolution:', err);
    }
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
      case 'urgente': return 'text-red-600 bg-red-50';
      case 'elevee': return 'text-orange-600 bg-orange-50';
      case 'moyenne': return 'text-yellow-600 bg-yellow-50';
      case 'faible': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Fonction pour calculer le temps de traitement
  const getTempsTraitement = (createdAt, updatedAt) => {
    const start = new Date(updatedAt || createdAt);
    const now = new Date();
    const diffHours = Math.floor((now - start) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    }
  };

  // Fonction pour obtenir la couleur du temps de traitement
  const getTempsTraitementColor = (createdAt, updatedAt) => {
    const start = new Date(updatedAt || createdAt);
    const now = new Date();
    const diffHours = Math.floor((now - start) / (1000 * 60 * 60));

    if (diffHours > 120) return 'text-red-600'; // Plus de 5 jours
    if (diffHours > 72) return 'text-orange-600'; // Plus de 3 jours
    if (diffHours > 24) return 'text-yellow-600'; // Plus de 1 jour
    return 'text-green-600'; // Moins de 1 jour
  };

  // Calculer le pourcentage de progression (simulé)
  const getProgressPercentage = (createdAt, priority) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    
    // Simulation basée sur la priorité et le temps écoulé
    let baseProgress = Math.min(diffDays * 15, 85); // 15% par jour, max 85%
    
    if (priority === 'urgente') baseProgress += 10;
    if (priority === 'elevee') baseProgress += 5;
    
    return Math.min(baseProgress, 95); // Max 95% pour éviter 100% automatique
  };

  // Export CSV
  const exportToCSV = () => {
    const csvData = filteredPlaintes.map(plainte => ({
      'ID': plainte.id,
      'Type': plainte.complaintType,
      'Cible': plainte.targetType,
      'Description': plainte.description,
      'Priorité': plainte.priority,
      'Temps de traitement': getTempsTraitement(plainte.createdAt, plainte.updatedAt),
      'Progression': getProgressPercentage(plainte.createdAt, plainte.priority) + '%',
      'Assigné à': plainte.assignedTo || 'Non assigné',
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
    a.download = `plaintes-en-traitement-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && plaintes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-600 mx-auto absolute top-0"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">Chargement des plaintes en traitement...</p>
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
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
          >
            <RefreshCw className="w-5 h-5 mr-2 inline" />
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
                <Activity className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Plaintes en Traitement
                </h1>
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {stats.total} en cours
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
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">En traitement</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Priorité élevée</p>
                  <p className="text-3xl font-bold">{stats.prioriteElevee}</p>
                </div>
                <Zap className="w-8 h-8 text-red-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">En retard</p>
                  <p className="text-3xl font-bold">{stats.enRetard}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Assignés</p>
                  <p className="text-3xl font-bold">{stats.assignees}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
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
                className="w-full pl-14 pr-6 py-4 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            <div className="flex space-x-4">
              <select
                value={selectedPriorite}
                onChange={(e) => setSelectedPriorite(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
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
                className="px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
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

        {/* Liste des plaintes */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredPlaintes.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune plainte en traitement</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedSecteur || selectedPriorite 
                  ? 'Aucune plainte ne correspond aux filtres sélectionnés.'
                  : 'Aucune plainte n\'est actuellement en traitement.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plainte
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Cible
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progression
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Temps de traitement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigné à
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlaintes.map((plainte) => {
                    const progressPercentage = getProgressPercentage(plainte.createdAt, plainte.priority);
                    return (
                      <tr key={plainte.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                {plainte.description}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center mt-1">
                                <User size={14} className="mr-1" />
                                ID: {plainte.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{plainte.complaintType}</div>
                          <div className="text-sm text-gray-500">{plainte.targetType}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(plainte.priority)}`}>
                            {plainte.priority || 'moyenne'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{progressPercentage}%</span>
                              </div>
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    progressPercentage >= 80 ? 'bg-green-500' :
                                    progressPercentage >= 50 ? 'bg-yellow-500' :
                                    'bg-blue-500'
                                  }`}
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm font-medium ${getTempsTraitementColor(plainte.createdAt, plainte.updatedAt)}`}>
                            {getTempsTraitement(plainte.createdAt, plainte.updatedAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Depuis {new Date(plainte.updatedAt || plainte.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <Users size={14} className="mr-1 text-gray-400" />
                            <span className="truncate max-w-24">
                              {plainte.assignedTo || 'Non assigné'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleMarkResolved(plainte.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <CheckCircle size={12} className="mr-1" />
                              Résoudre
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Eye size={16} />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border">
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
                  Affichage de <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> à{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, stats.total)}
                  </span>{' '}
                  sur <span className="font-medium">{stats.total}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaintesEnTraitement;
