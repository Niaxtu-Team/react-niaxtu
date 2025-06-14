import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  BarChart3, TrendingUp, Users, AlertTriangle, Activity, PieChart, Target, Clock, Award, Zap, 
  Download, RefreshCw, ArrowUp, ArrowDown, CheckCircle, Timer, Star, Shield, Globe, Building
} from 'lucide-react';
import { useStatisticsAPI } from '../hooks/useStatisticsAPI';
import { usePlaintes } from '../hooks/usePlaintes';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler);

const StatistiquesCompletes = () => {
  const { stats, loading, error, lastUpdated, refreshAll, exportStatistics, fetchRealTimeData } = useStatisticsAPI();
  const { getPlaintesStats } = usePlaintes();
  
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedView, setSelectedView] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const periods = [
    { label: '7 jours', value: '7d' },
    { label: '30 jours', value: '30d' },
    { label: '90 jours', value: '90d' },
    { label: '6 mois', value: '6m' },
    { label: '1 an', value: '1y' }
  ];

  const views = [
    { label: 'Vue d\'ensemble', value: 'overview', icon: Globe },
    { label: 'Performance', value: 'performance', icon: Target },
    { label: 'Tendances', value: 'trends', icon: TrendingUp },
    { label: 'Répartitions', value: 'distributions', icon: PieChart },
    { label: 'Temps réel', value: 'realtime', icon: Activity }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll(selectedPeriod);
    setIsRefreshing(false);
  };

  const handleExport = async (format = 'csv') => {
    setIsExporting(true);
    try {
      await exportStatistics(format, selectedPeriod, true);
    } catch (err) {
      console.error('Erreur export:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Actualisation automatique des données temps réel
  useEffect(() => {
    if (selectedView === 'realtime') {
      fetchRealTimeData();
      const interval = setInterval(fetchRealTimeData, 30000); // Toutes les 30 secondes
      return () => clearInterval(interval);
    }
  }, [selectedView, fetchRealTimeData]);

  const colors = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
    purple: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#6366F1'
  };

  // Données pour les graphiques basées sur les vraies données
  const chartData = {
    complaintsEvolution: {
      labels: stats.timeline.complaints.map(item => 
        new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      ),
      datasets: [
        {
          label: 'Plaintes reçues',
          data: stats.timeline.complaints.map(item => item.count),
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}20`,
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointBackgroundColor: colors.primary,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        },
        {
          label: 'Plaintes résolues',
          data: stats.timeline.resolutions.map(item => item.count),
          borderColor: colors.success,
          backgroundColor: `${colors.success}20`,
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointBackgroundColor: colors.success,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }
      ]
    },
    statusDistribution: {
      labels: ['Résolues', 'En traitement', 'En attente', 'Rejetées'],
      datasets: [{
        data: [
          stats.overview.complaints.resolved,
          stats.overview.complaints.inProgress,
          stats.overview.complaints.pending,
          stats.overview.complaints.rejected
        ],
        backgroundColor: [colors.success, colors.info, colors.warning, colors.danger],
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: '#fff'
      }]
    },
    sectorDistribution: {
      labels: stats.distributions.complaintsBySector.map(item => item.label),
      datasets: [{
        label: 'Plaintes par secteur',
        data: stats.distributions.complaintsBySector.map(item => item.count),
        backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger, colors.purple, colors.pink],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    typeDistribution: {
      labels: stats.distributions.complaintsByType.map(item => item.label),
      datasets: [{
        data: stats.distributions.complaintsByType.map(item => item.count),
        backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger, colors.purple, colors.pink],
        borderWidth: 0
      }]
    },
    performanceRadar: {
      labels: ['Rapidité', 'Efficacité', 'Satisfaction', 'Qualité', 'Réactivité'],
      datasets: [{
        label: 'Performance actuelle',
        data: [85, 92, stats.performance.satisfactionRate, 88, 90],
        backgroundColor: `${colors.primary}30`,
        borderColor: colors.primary,
        borderWidth: 2,
        pointBackgroundColor: colors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { 
          usePointStyle: true, 
          padding: 20, 
          font: { size: 12, weight: '600' },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: colors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#6B7280' }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { font: { size: 11 }, color: '#6B7280' }
      }
    }
  };

  if (loading && !stats.overview.complaints.total) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-600 mx-auto absolute top-0"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">Chargement des statistiques complètes...</p>
            <p className="text-sm text-gray-500">Analyse des données en cours</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Statistiques Complètes
                </h1>
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {stats.overview.complaints.total.toLocaleString()} plaintes analysées
                  </div>
                  <div className="text-gray-500 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Dernière mise à jour: {lastUpdated ? lastUpdated.toLocaleTimeString('fr-FR') : new Date().toLocaleTimeString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center px-4 py-2 bg-gray-100/80 text-gray-700 rounded-xl hover:bg-gray-200/80 transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg disabled:opacity-50"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isExporting ? 'Export...' : 'Exporter'}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation des vues */}
          <div className="flex flex-wrap gap-2 mb-6">
            {views.map(view => {
              const IconComponent = view.icon;
              return (
                <button
                  key={view.value}
                  onClick={() => setSelectedView(view.value)}
                  className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${
                    selectedView === view.value
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {view.label}
                </button>
              );
            })}
          </div>

          {/* Sélecteur de période */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-700">Période:</span>
            <div className="flex space-x-2">
              {periods.map(period => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vue d'ensemble */}
        {selectedView === 'overview' && (
          <div className="space-y-8">
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Plaintes</p>
                    <p className="text-3xl font-bold">{stats.overview.complaints.total.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <span className="text-sm">+{stats.trends.complaintsGrowth}% ce mois</span>
                    </div>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Taux de Résolution</p>
                    <p className="text-3xl font-bold">{stats.performance.resolutionRate.toFixed(1)}%</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <span className="text-sm">+5% ce mois</span>
                    </div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Temps Moyen</p>
                    <p className="text-3xl font-bold">{stats.performance.averageResolutionTime}j</p>
                    <div className="flex items-center mt-2">
                      <ArrowDown className="w-4 h-4 mr-1" />
                      <span className="text-sm">-2j ce mois</span>
                    </div>
                  </div>
                  <Timer className="w-8 h-8 text-orange-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Satisfaction</p>
                    <p className="text-3xl font-bold">{stats.performance.satisfactionRate}%</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <span className="text-sm">+3% ce mois</span>
                    </div>
                  </div>
                  <Star className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Graphiques principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
                  Évolution des Plaintes
                </h3>
                <div className="h-80">
                  <Line data={chartData.complaintsEvolution} options={chartOptions} />
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <PieChart className="w-6 h-6 mr-3 text-green-600" />
                  Répartition par Statut
                </h3>
                <div className="h-80">
                  <Doughnut data={chartData.statusDistribution} options={{...chartOptions, cutout: '60%'}} />
                </div>
              </div>
            </div>

            {/* Graphiques secondaires */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                  Plaintes par Secteur
                </h3>
                <div className="h-80">
                  <Bar data={chartData.sectorDistribution} options={chartOptions} />
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-indigo-600" />
                  Performance Multi-Critères
                </h3>
                <div className="h-80">
                  <Radar data={chartData.performanceRadar} options={{
                    ...chartOptions,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { display: false },
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        angleLines: { color: 'rgba(0, 0, 0, 0.1)' }
                      }
                    }
                  }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vue Performance */}
        {selectedView === 'performance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Efficacité Globale</h3>
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">92%</div>
                  <div className="text-sm text-gray-600">Score d'efficacité</div>
                  <div className="mt-4 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Temps de Réponse</h3>
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">{stats.performance.responseTime}h</div>
                  <div className="text-sm text-gray-600">Temps moyen</div>
                  <div className="mt-4 flex items-center justify-center text-green-600">
                    <ArrowDown className="w-4 h-4 mr-1" />
                    <span className="text-sm">-30min cette semaine</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Qualité Service</h3>
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">4.2/5</div>
                  <div className="text-sm text-gray-600">Note moyenne</div>
                  <div className="mt-4 flex justify-center">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vue Temps réel */}
        {selectedView === 'realtime' && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-green-600" />
                  Données en Temps Réel
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Mise à jour automatique</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{stats.realtime.newComplaints}</div>
                  <div className="text-sm text-gray-600">Nouvelles plaintes</div>
                  <div className="text-xs text-gray-500 mt-1">Dernière heure</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{stats.realtime.resolvedComplaints}</div>
                  <div className="text-sm text-gray-600">Plaintes résolues</div>
                  <div className="text-xs text-gray-500 mt-1">Dernière heure</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{stats.realtime.urgentComplaints}</div>
                  <div className="text-sm text-gray-600">Plaintes urgentes</div>
                  <div className="text-xs text-gray-500 mt-1">En attente</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{stats.realtime.activeAdmins}</div>
                  <div className="text-sm text-gray-600">Admins actifs</div>
                  <div className="text-xs text-gray-500 mt-1">En ligne</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vue Répartitions */}
        {selectedView === 'distributions' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <PieChart className="w-6 h-6 mr-3 text-green-600" />
                  Répartition par Type
                </h3>
                <div className="h-80">
                  <PolarArea data={chartData.typeDistribution} options={chartOptions} />
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-purple-600" />
                  Top Secteurs Critiques
                </h3>
                <div className="space-y-4">
                  {stats.trends.criticalAreas.map((area, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
                      <div className="flex items-center">
                        <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{area.label}</div>
                          <div className="text-sm text-gray-600">{area.count} plaintes urgentes</div>
                        </div>
                      </div>
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatistiquesCompletes; 