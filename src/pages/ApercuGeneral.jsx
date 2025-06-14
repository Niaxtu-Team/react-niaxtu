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
  Eye,
  Activity,
  BarChart3,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStats } from '../hooks/useStats';

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
  const { user } = useAuth();
  const { stats, loading, error, fetchComplaintStats, refresh } = useStats();
  const [selectedPeriod, setSelectedPeriod] = useState('7j');
  const [chartData, setChartData] = useState({
    line: null,
    doughnut: null,
    bar: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les données des graphiques
  useEffect(() => {
    loadChartData();
  }, [selectedPeriod, stats]);

  const loadChartData = async () => {
    try {
      // Récupérer les données détaillées pour les graphiques
      const complaintStats = await fetchComplaintStats(selectedPeriod);
      
      // Préparer les données pour les graphiques
      const lineData = {
        labels: complaintStats.timeline?.labels || ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
          {
            label: 'Nouvelles plaintes',
            data: complaintStats.timeline?.newComplaints || [12, 19, 15, 27, 22, 18, 10],
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
            data: complaintStats.timeline?.resolvedComplaints || [8, 12, 10, 18, 15, 12, 7],
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

      const doughnutData = {
        labels: ['Résolues', 'En traitement', 'En attente', 'Rejetées'],
        datasets: [
          {
            data: [
              stats.complaints.resolved, 
              stats.complaints.inProgress, 
              stats.complaints.pending, 
              stats.complaints.rejected
            ],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
            borderWidth: 3,
            borderColor: '#fff',
            hoverBorderWidth: 4,
          },
        ],
      };

      const barData = {
        labels: complaintStats.bySector?.labels || ['Transport', 'Eau', 'Énergie', 'Santé', 'Éducation', 'Environnement'],
        datasets: [
          {
            label: 'Nombre de plaintes',
            data: complaintStats.bySector?.data || [245, 198, 176, 132, 115, 98],
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
      await refresh();
      await loadChartData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Cartes de statistiques
  const statCards = [
    {
      title: 'Total Plaintes',
      value: stats.totalPlaintes,
      icon: AlertTriangle,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Plaintes Résolues',
      value: stats.plaintesResolues,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'En Attente',
      value: stats.plaintesEnAttente,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      change: '-5%',
      changeType: 'decrease'
    },
    {
      title: 'Utilisateurs',
      value: stats.totalUtilisateurs,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+15%',
      changeType: 'increase'
    }
  ];

  // Dernières activités
  const recentActivities = [
    { id: 1, type: 'Plainte résolue', description: 'Problème de transport #1254', time: '5 min', icon: CheckCircle, color: 'text-green-600' },
    { id: 2, type: 'Nouvelle plainte', description: 'Fuite d\'eau signalée #1255', time: '12 min', icon: AlertTriangle, color: 'text-blue-600' },
    { id: 3, type: 'Utilisateur ajouté', description: 'Nouvel utilisateur inscrit', time: '25 min', icon: Users, color: 'text-purple-600' },
    { id: 4, type: 'Plainte rejetée', description: 'Plainte #1250 rejetée', time: '1h', icon: XCircle, color: 'text-red-600' },
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
                <option value="7j">7 derniers jours</option>
                <option value="30j">30 derniers jours</option>
                <option value="90j">90 derniers jours</option>
                <option value="1an">1 an</option>
              </select>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Évolution des plaintes</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80">
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
            </div>
          </div>

          {/* Graphique en secteurs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Répartition des statuts</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80 flex items-center justify-center">
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
            </div>
          </div>
        </div>

        {/* Graphique en barres et activités récentes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique en barres */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Plaintes par secteur</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80">
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
            </div>
          </div>

          {/* Activités récentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Activités récentes</h2>
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
                    <p className="text-xs text-gray-400 mt-1">Il y a {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                Voir toutes les activités
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
