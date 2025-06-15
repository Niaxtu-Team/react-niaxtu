import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Activity,
  BarChart3,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useStatisticsAPI } from '../../hooks/useStatisticsAPI';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ApercuGeneral() {
  const { stats, loading, error, fetchAdvancedStats } = useStatisticsAPI();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [chartData, setChartData] = useState({
    line: null,
    doughnut: null,
    bar: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les données des graphiques
  useEffect(() => {
    loadChartData();
  }, [stats]);

  const loadChartData = () => {
    try {
      // Préparer les données pour le graphique linéaire (évolution)
      const timelineData = Array.isArray(stats.timeline) ? stats.timeline : [];
      const lineData = {
        labels: timelineData.map(item => 
          new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
        ).slice(-7), // Derniers 7 jours
        datasets: [
          {
            label: 'Nouvelles plaintes',
            data: timelineData.map(item => item.complaints || 0).slice(-7),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#3b82f6',
            pointBorderWidth: 2,
          },
          {
            label: 'Plaintes résolues',
            data: timelineData.map(item => item.resolutions || 0).slice(-7),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#10b981',
            pointBorderWidth: 2,
          },
        ],
      };

      // Données pour le graphique en secteurs (statuts)
      const doughnutData = {
        labels: ['Résolues', 'En traitement', 'En attente', 'Rejetées'],
        datasets: [
          {
            data: [
              stats.overview?.complaints?.resolved || 0, 
              stats.overview?.complaints?.inProgress || 0, 
              stats.overview?.complaints?.pending || 0, 
              stats.overview?.complaints?.rejected || 0
            ],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
            borderWidth: 3,
            borderColor: '#fff',
            hoverBorderWidth: 4,
          },
        ],
      };

      // Données pour le graphique en barres (par ministère)
      const ministeresData = stats.distributions?.complaintsByMinistere || [];
      const barData = {
        labels: ministeresData.slice(0, 6).map(item => item.label),
        datasets: [
          {
            label: 'Nombre de plaintes',
            data: ministeresData.slice(0, 6).map(item => item.count),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(249, 115, 22, 0.8)',
            ],
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      };

      setChartData({
        line: lineData,
        doughnut: doughnutData,
        bar: barData
      });
    } catch (error) {
      console.error('Erreur chargement données graphiques:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAdvancedStats(selectedPeriod);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    fetchAdvancedStats(period);
  };

  // Cartes de statistiques
  const statCards = [
    {
      title: 'Total Plaintes',
      value: stats.overview?.complaints?.total || 0,
      icon: AlertTriangle,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: `+${stats.trends?.complaintsGrowth || 0}%`,
      changeType: 'increase'
    },
    {
      title: 'Plaintes Résolues',
      value: stats.overview?.complaints?.resolved || 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: `${stats.performance?.resolutionRate || 0}%`,
      changeType: 'increase'
    },
    {
      title: 'En Attente',
      value: stats.overview?.complaints?.pending || 0,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      change: '-5%',
      changeType: 'decrease'
    },
    {
      title: 'Utilisateurs',
      value: stats.overview?.users?.total || 0,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+15%',
      changeType: 'increase'
    }
  ];

  // Dernières activités (basées sur les données réelles)
  const recentActivities = [
    { 
      id: 1, 
      type: 'Plainte résolue', 
      description: `${stats.overview?.complaints?.resolved || 0} plaintes résolues`, 
      time: '5 min', 
      icon: CheckCircle, 
      color: 'text-green-600' 
    },
    { 
      id: 2, 
      type: 'Nouvelle plainte', 
      description: `${stats.overview?.complaints?.new || 0} nouvelles plaintes`, 
      time: '12 min', 
      icon: AlertTriangle, 
      color: 'text-blue-600' 
    },
    { 
      id: 3, 
      type: 'Utilisateurs actifs', 
      description: `${stats.overview?.users?.active || 0} utilisateurs actifs`, 
      time: '25 min', 
      icon: Users, 
      color: 'text-purple-600' 
    },
    { 
      id: 4, 
      type: 'Plaintes rejetées', 
      description: `${stats.overview?.complaints?.rejected || 0} plaintes rejetées`, 
      time: '1h', 
      icon: XCircle, 
      color: 'text-red-600' 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-indigo-600 mx-auto absolute top-0"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">Chargement de l'aperçu général...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête moderne */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Aperçu Général
                </h1>
                <p className="text-gray-600 text-lg">Vue d'ensemble des statistiques et tendances</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">90 derniers jours</option>
                <option value="1y">1 an</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualisation...' : 'Actualiser'}
              </button>
            </div>
          </div>

          {/* Cartes de statistiques modernes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <div 
                  key={index}
                  className={`bg-gradient-to-br from-${card.color}-500 to-${card.color}-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-${card.color}-100 text-sm font-medium`}>{card.title}</p>
                      <p className="text-3xl font-bold">{card.value.toLocaleString()}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className={`w-4 h-4 mr-1 ${card.changeType === 'increase' ? 'text-green-200' : 'text-red-200'}`} />
                        <span className={`text-sm font-medium ${card.changeType === 'increase' ? 'text-green-200' : 'text-red-200'}`}>
                          {card.change}
                        </span>
                      </div>
                    </div>
                    <IconComponent className={`w-8 h-8 text-${card.color}-200`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique linéaire */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Évolution des plaintes</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80">
              {chartData.line && (
                <Line 
                  data={chartData.line} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }} 
                />
              )}
            </div>
          </div>

          {/* Graphique en secteurs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Répartition des statuts</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80 flex items-center justify-center">
              {chartData.doughnut && (
                <Doughnut 
                  data={chartData.doughnut} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }} 
                />
              )}
            </div>
          </div>
        </div>

        {/* Graphique en barres et activités récentes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique en barres */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Plaintes par ministère</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80">
              {chartData.bar && (
                <Bar 
                  data={chartData.bar} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }} 
                />
              )}
            </div>
          </div>

          {/* Activités récentes */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Statistiques récentes</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Mis à jour il y a {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Voir les statistiques complètes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
