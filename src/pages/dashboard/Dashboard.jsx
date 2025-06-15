import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStatisticsAPI } from '../hooks/useStatisticsAPI';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  Building, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Target,
  BarChart3,
  PlusCircle,
  Activity,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, loading, error, fetchAdvancedStats } = useStatisticsAPI();
  const [recentActivity, setRecentActivity] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les activités récentes
  useEffect(() => {
    console
    fetchRecentActivity();
  }, [stats]);

  const fetchRecentActivity = () => {
    try {
      // Générer des activités basées sur les vraies données
      const mockActivity = [
        {
          id: 1,
          type: 'complaint',
          action: 'created',
          title: 'Nouvelles plaintes',
          description: `${stats.overview?.complaints?.new || 0} nouvelles plaintes déposées`,
          user: 'Système',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          priority: 'high'
        },
        {
          id: 2,
          type: 'complaint',
          action: 'resolved',
          title: 'Plaintes résolues',
          description: `${stats.overview?.complaints?.resolved || 0} plaintes ont été résolues`,
          user: 'Équipe Admin',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          priority: 'medium'
        },
        {
          id: 3,
          type: 'admin',
          action: 'active',
          title: 'Utilisateurs actifs',
          description: `${stats.overview?.users?.active || 0} utilisateurs sont actuellement actifs`,
          user: 'Système',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          priority: 'low'
        },
        {
          id: 4,
          type: 'structure',
          action: 'update',
          title: 'Structures organisationnelles',
          description: `${stats.overview?.structures?.ministries || 0} ministères, ${stats.overview?.structures?.directions || 0} directions`,
          user: 'Admin',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          priority: 'low'
        }
      ];
      
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Erreur chargement activités:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAdvancedStats('30d');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Formater le temps relatif
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  // Icônes pour les types d'activité
  const getActivityIcon = (type, action) => {
    switch (type) {
      case 'complaint':
        return action === 'resolved' ? CheckCircle : AlertTriangle;
      case 'admin':
        return UserCheck;
      case 'structure':
        return Building;
      default:
        return Activity;
    }
  };

  // Couleurs pour les priorités
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-indigo-600 mx-auto absolute top-0"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">Chargement du tableau de bord...</p>
            <p className="text-sm text-gray-500">Veuillez patienter</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-100 flex items-center justify-center p-6">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl max-w-md border border-red-200">
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <AlertTriangle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 mr-2 inline ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualisation...' : 'Réessayer'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête de bienvenue moderne */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 rounded-3xl shadow-2xl p-8 text-white border border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">
                Bienvenue, {user?.displayName || 'Administrateur'} !
              </h1>
              <p className="text-indigo-100 text-lg mb-4">
                Voici un aperçu de l'activité de votre plateforme
              </p>
              <div className="flex items-center space-x-6">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-semibold">Dernière connexion: Aujourd'hui</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-semibold">Rôle: {user?.role || 'Admin'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/20 backdrop-blur-sm p-3 rounded-xl hover:bg-white/30 transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-6 h-6 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <LayoutDashboard className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total des plaintes */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Plaintes</p>
                <p className="text-3xl font-bold text-gray-900">{(stats?.overview?.complaints?.total || 0).toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+{stats?.overview?.complaints?.new || 0}</span>
              <span className="text-gray-600 ml-1">nouvelles</span>
            </div>
          </div>

          {/* Plaintes en attente */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-3xl font-bold text-orange-600">{stats?.overview?.complaints?.pending || 0}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Nécessitent une attention</span>
            </div>
          </div>

          {/* Taux de résolution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux Résolution</p>
                <p className="text-3xl font-bold text-green-600">{(stats?.performance?.resolutionRate || 0).toFixed(1)}%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Target className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">Objectif: 85%</span>
            </div>
          </div>

          {/* Utilisateurs actifs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
                <p className="text-3xl font-bold text-purple-600">{(stats?.overview?.users?.active || 0).toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <PlusCircle className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-purple-500 font-medium">Total: {(stats?.overview?.users?.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Graphiques et activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Répartition des plaintes */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Répartition des Plaintes
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">Résolues</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{stats?.overview?.complaints?.resolved || 0}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${((stats?.overview?.complaints?.resolved || 0) / (stats?.overview?.complaints?.total || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">En traitement</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{stats?.overview?.complaints?.inProgress || 0}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${((stats?.overview?.complaints?.inProgress || 0) / (stats?.overview?.complaints?.total || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">En attente</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{stats?.overview?.complaints?.pending || 0}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${((stats?.overview?.complaints?.pending || 0) / (stats?.overview?.complaints?.total || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">Rejetées</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{stats?.overview?.complaints?.rejected || 0}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${((stats?.overview?.complaints?.rejected || 0) / (stats?.overview?.complaints?.total || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Activité Récente
            </h2>
            <div className="space-y-4">
              {recentActivity.map(activity => {
                const Icon = getActivityIcon(activity.type, activity.action);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100 ${getPriorityColor(activity.priority)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <span>{activity.user}</span>
                        <span className="mx-1">•</span>
                        <span>{formatRelativeTime(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Temps de réponse moyen</span>
                  <span className="font-medium">{stats?.performance?.averageResolutionTime || 0}j</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Taux de satisfaction</span>
                  <span className="font-medium">{(stats?.performance?.satisfactionRate || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats?.performance?.satisfactionRate || 0}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Efficacité</span>
                  <span className="font-medium">{(stats?.performance?.efficiency || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${stats?.performance?.efficiency || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Structures */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Structures</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ministères</span>
                <span className="font-medium text-gray-900">{stats?.overview?.structures?.ministeres || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Directions</span>
                <span className="font-medium text-gray-900">{stats?.overview?.structures?.directions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Services</span>
                <span className="font-medium text-gray-900">{stats?.overview?.structures?.services || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Secteurs</span>
                <span className="font-medium text-gray-900">{stats?.overview?.sectors?.total || 0}</span>
              </div>
            </div>
          </div>

          {/* Gestion */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Administration</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total utilisateurs</span>
                <span className="font-medium text-gray-900">{(stats?.overview?.users?.total || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Utilisateurs actifs</span>
                <span className="font-medium text-gray-900">{(stats?.overview?.users?.active || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Administrateurs</span>
                <span className="font-medium text-gray-900">{stats?.overview?.users?.admins || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Croissance</span>
                <span className="font-medium text-green-600">+{stats?.trends?.complaintsGrowth || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
