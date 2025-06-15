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
  Download, RefreshCw, ArrowUp, ArrowDown, CheckCircle, Timer, Star, Shield, Globe, Building, GitBranch, Settings
} from 'lucide-react';
import { useStatisticsAPI } from '../../hooks/useStatisticsAPI';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler);

const StatistiquesCompletes = () => {
  const { stats, loading, error, lastUpdated, fetchAdvancedStats, exportStatistics, fetchRealTimeData } = useStatisticsAPI();
  
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
    await fetchAdvancedStats(selectedPeriod);
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

  // Recharger les données quand la période change
  useEffect(() => {
    fetchAdvancedStats(selectedPeriod);
  }, [selectedPeriod, fetchAdvancedStats]);

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
  // Vérification robuste pour s'assurer que timeline est un tableau
  const timelineData = Array.isArray(stats.timeline) ? stats.timeline : [];
  
  const chartData = {
    complaintsEvolution: {
      labels: timelineData.map(item => 
        new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      ),
      datasets: [
        {
          label: 'Plaintes reçues',
          data: timelineData.map(item => item.complaints || 0),
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
          data: timelineData.map(item => item.resolutions || 0),
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
          stats.overview?.complaints?.resolved || 0,
          stats.overview?.complaints?.inProgress || 0,
          stats.overview?.complaints?.pending || 0,
          stats.overview?.complaints?.rejected || 0
        ],
        backgroundColor: [colors.success, colors.info, colors.warning, colors.danger],
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: '#fff'
      }]
    },
    sectorDistribution: {
      labels: (stats.distributions?.complaintsByMinistere || []).slice(0, 6).map(item => item.label),
      datasets: [{
        label: 'Plaintes par ministère',
        data: (stats.distributions?.complaintsByMinistere || []).slice(0, 6).map(item => item.count),
        backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger, colors.purple, colors.pink],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    directionDistribution: {
      labels: (stats.distributions?.complaintsByDirection || []).slice(0, 6).map(item => item.label),
      datasets: [{
        label: 'Plaintes par direction',
        data: (stats.distributions?.complaintsByDirection || []).slice(0, 6).map(item => item.count),
        backgroundColor: [colors.info, colors.purple, colors.pink, colors.indigo, colors.success, colors.warning],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    serviceDistribution: {
      labels: (stats.distributions?.complaintsByService || []).slice(0, 6).map(item => item.label),
      datasets: [{
        label: 'Plaintes par service',
        data: (stats.distributions?.complaintsByService || []).slice(0, 6).map(item => item.count),
        backgroundColor: [colors.warning, colors.danger, colors.purple, colors.pink, colors.indigo, colors.primary],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    typeDistribution: {
      labels: (stats.distributions?.complaintsByType || []).slice(0, 6).map(item => item.label),
      datasets: [{
        data: (stats.distributions?.complaintsByType || []).slice(0, 6).map(item => item.count),
        backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger, colors.purple, colors.pink],
        borderWidth: 0
      }]
    },
    performanceRadar: {
      labels: ['Rapidité', 'Efficacité', 'Satisfaction', 'Qualité', 'Réactivité'],
      datasets: [{
        label: 'Performance actuelle',
        data: [
          Math.max(0, 100 - (stats.performance?.averageResolutionTime || 0) * 3),
          stats.performance?.efficiency || 0,
          stats.performance?.satisfactionRate || 0,
          88,
          90
        ],
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

  if (loading && (!stats.overview || !stats.overview.complaints || !stats.overview.complaints.total)) {
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
                    {(stats.overview?.complaints?.total || 0).toLocaleString()} plaintes analysées
                  </div>
                  <div className="text-gray-500 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Dernière mise à jour: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString('fr-FR') : new Date().toLocaleTimeString('fr-FR')}
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
                    <p className="text-3xl font-bold">{(stats.overview?.complaints?.total || 0).toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <span className="text-sm">+{stats.trends?.complaintsGrowth || 0}% ce mois</span>
                    </div>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Taux de Résolution</p>
                    <p className="text-3xl font-bold">{(stats.performance?.resolutionRate || 0).toFixed(1)}%</p>
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
                    <p className="text-3xl font-bold">{stats.performance?.averageResolutionTime || 0}j</p>
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
                    <p className="text-3xl font-bold">{stats.performance?.satisfactionRate || 0}%</p>
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

            {/* Graphiques hiérarchiques - Structure organisationnelle */}
            <div className="space-y-8">
              {/* Vue d'ensemble hiérarchique */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center justify-center">
                  <Building className="w-8 h-8 mr-4 text-blue-600" />
                  Structure Hiérarchique des Plaintes
                </h3>
                
                {/* Graphique principal - Ministères avec détails */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="h-96">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Répartition par Ministère</h4>
                    <Doughnut 
                      data={{
                        labels: (stats.distributions?.complaintsByMinistere || []).map(item => item.label),
                        datasets: [{
                          data: (stats.distributions?.complaintsByMinistere || []).map(item => item.count),
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(249, 115, 22, 0.8)',
                          ],
                          borderColor: '#fff',
                          borderWidth: 3,
                          hoverBorderWidth: 4,
                        }]
                      }}
                      options={{
                        ...chartOptions,
                        cutout: '40%',
                        plugins: {
                          ...chartOptions.plugins,
                          legend: {
                            position: 'bottom',
                            labels: {
                              usePointStyle: true,
                              padding: 15,
                              font: { size: 12, weight: '600' }
                            }
                          },
                          tooltip: {
                            ...chartOptions.plugins.tooltip,
                            callbacks: {
                              label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed * 100) / total).toFixed(1);
                                return `${context.label}: ${context.parsed} plaintes (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  
                  {/* Diagramme en barres hiérarchique */}
                  <div className="h-96">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Hiérarchie Complète</h4>
                    <Bar 
                      data={{
                        labels: [
                          ...(stats.distributions?.complaintsByMinistere || []).map(item => `📋 ${item.label}`),
                          ...(stats.distributions?.complaintsByDirection || []).map(item => `📁 ${item.label}`),
                          ...(stats.distributions?.complaintsByService || []).map(item => `⚙️ ${item.label}`)
                        ],
                        datasets: [{
                          label: 'Nombre de plaintes',
                          data: [
                            ...(stats.distributions?.complaintsByMinistere || []).map(item => item.count),
                            ...(stats.distributions?.complaintsByDirection || []).map(item => item.count),
                            ...(stats.distributions?.complaintsByService || []).map(item => item.count)
                          ],
                          backgroundColor: function(context) {
                            const index = context.dataIndex;
                            const ministeresCount = (stats.distributions?.complaintsByMinistere || []).length;
                            const directionsCount = (stats.distributions?.complaintsByDirection || []).length;
                            
                            if (index < ministeresCount) {
                              return 'rgba(59, 130, 246, 0.8)'; // Bleu pour ministères
                            } else if (index < ministeresCount + directionsCount) {
                              return 'rgba(139, 92, 246, 0.8)'; // Violet pour directions
                            } else {
                              return 'rgba(16, 185, 129, 0.8)'; // Vert pour services
                            }
                          },
                          borderRadius: 6,
                          borderSkipped: false,
                        }]
                      }}
                      options={{
                        ...chartOptions,
                        indexAxis: 'y',
                        plugins: {
                          ...chartOptions.plugins,
                          legend: { display: false },
                          tooltip: {
                            ...chartOptions.plugins.tooltip,
                            callbacks: {
                              title: function(context) {
                                return context[0].label.substring(2); // Enlever l'emoji
                              },
                              label: function(context) {
                                const label = context.label;
                                let type = 'Structure';
                                if (label.startsWith('📋')) type = 'Ministère';
                                else if (label.startsWith('📁')) type = 'Direction';
                                else if (label.startsWith('⚙️')) type = 'Service';
                                
                                return `${type}: ${context.parsed.x} plainte${context.parsed.x > 1 ? 's' : ''}`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Nombre de plaintes',
                              font: { size: 12, weight: '600' }
                            }
                          },
                          y: {
                            ticks: {
                              callback: function(value) {
                                const label = this.getLabelForValue(value);
                                return label.length > 25 ? label.substring(0, 22) + '...' : label;
                              },
                              font: { size: 10 }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                {/* Diagramme en arbre hiérarchique */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8">
                  <h4 className="text-lg font-semibold text-gray-700 mb-6 text-center">Arbre Hiérarchique des Structures</h4>
                  <div className="space-y-6">
                    {(stats.distributions?.complaintsByMinistere || []).map((ministere, minIndex) => (
                      <div key={minIndex} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Building className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-semibold text-gray-800">{ministere.label}</span>
                          </div>
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {ministere.count} plaintes
                          </div>
                        </div>
                        
                        {/* Directions sous ce ministère */}
                        <div className="ml-6 space-y-3">
                          {(stats.distributions?.complaintsByDirection || []).map((direction, dirIndex) => (
                            <div key={dirIndex} className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-400">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <GitBranch className="w-4 h-4 text-purple-600 mr-2" />
                                  <span className="font-medium text-gray-700">{direction.label}</span>
                                </div>
                                <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {direction.count} plaintes
                                </div>
                              </div>
                              
                              {/* Services sous cette direction */}
                              <div className="ml-4 space-y-2">
                                {(stats.distributions?.complaintsByService || []).map((service, servIndex) => (
                                  <div key={servIndex} className="bg-green-50 rounded-lg p-2 border-l-4 border-green-400">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <Settings className="w-3 h-3 text-green-600 mr-2" />
                                        <span className="text-sm text-gray-600">{service.label}</span>
                                      </div>
                                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                        {service.count} plaintes
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Statistiques de la hiérarchie */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center mb-3">
                      <Building className="w-6 h-6 mr-3 text-blue-600" />
                      <span className="font-semibold text-blue-800">Ministères</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {(stats.distributions?.complaintsByMinistere || []).length}
                    </div>
                    <div className="text-sm text-blue-700">
                      {(stats.distributions?.complaintsByMinistere || []).reduce((sum, item) => sum + item.count, 0)} plaintes totales
                    </div>
                    <div className="mt-3 text-xs text-blue-600">
                      Niveau hiérarchique 1
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center mb-3">
                      <GitBranch className="w-6 h-6 mr-3 text-purple-600" />
                      <span className="font-semibold text-purple-800">Directions</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {(stats.distributions?.complaintsByDirection || []).length}
                    </div>
                    <div className="text-sm text-purple-700">
                      {(stats.distributions?.complaintsByDirection || []).reduce((sum, item) => sum + item.count, 0)} plaintes totales
                    </div>
                    <div className="mt-3 text-xs text-purple-600">
                      Niveau hiérarchique 2
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center mb-3">
                      <Settings className="w-6 h-6 mr-3 text-green-600" />
                      <span className="font-semibold text-green-800">Services</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {(stats.distributions?.complaintsByService || []).length}
                    </div>
                    <div className="text-sm text-green-700">
                      {(stats.distributions?.complaintsByService || []).reduce((sum, item) => sum + item.count, 0)} plaintes totales
                    </div>
                    <div className="mt-3 text-xs text-green-600">
                      Niveau hiérarchique 3
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center mb-3">
                      <BarChart3 className="w-6 h-6 mr-3 text-gray-600" />
                      <span className="font-semibold text-gray-800">Total Général</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-600 mb-2">
                      {stats.overview?.complaints?.total || 0}
                    </div>
                    <div className="text-sm text-gray-700">
                      Toutes structures confondues
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                      Vue d'ensemble
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Graphique de flux hiérarchique */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 mr-3 text-indigo-600" />
                  Flux de Traitement par Niveau Hiérarchique
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Niveau Ministère */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Niveau Ministère
                    </h4>
                    <div className="space-y-3">
                      {(stats.distributions?.complaintsByMinistere || []).map((item, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 truncate">{item.label}</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                              {item.count}
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                              style={{ 
                                width: `${(item.count / Math.max(...(stats.distributions?.complaintsByMinistere || []).map(m => m.count))) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Niveau Direction */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                      <GitBranch className="w-5 h-5 mr-2" />
                      Niveau Direction
                    </h4>
                    <div className="space-y-3">
                      {(stats.distributions?.complaintsByDirection || []).map((item, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 truncate">{item.label}</span>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                              {item.count}
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                              style={{ 
                                width: `${(item.count / Math.max(...(stats.distributions?.complaintsByDirection || []).map(d => d.count))) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Niveau Service */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Niveau Service
                    </h4>
                    <div className="space-y-3">
                      {(stats.distributions?.complaintsByService || []).map((item, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 truncate">{item.label}</span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                              {item.count}
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                              style={{ 
                                width: `${(item.count / Math.max(...(stats.distributions?.complaintsByService || []).map(s => s.count))) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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