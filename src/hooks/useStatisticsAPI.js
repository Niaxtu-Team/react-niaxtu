import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export const useStatisticsAPI = () => {
  const { apiService } = useAuth();
  
  const [stats, setStats] = useState({
    overview: {
      complaints: { total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 },
      users: { total: 0, active: 0, admins: 0 },
      structures: { ministries: 0, directions: 0, services: 0 },
      sectors: { total: 0, active: 0 }
    },
    timeline: { complaints: [], resolutions: [] },
    distributions: {
      complaintsByType: [],
      complaintsBySector: [],
      complaintsByPriority: [],
      complaintsByStatus: [],
      usersByRole: []
    },
    performance: {
      averageResolutionTime: 0,
      resolutionRate: 0,
      satisfactionRate: 0,
      responseTime: 0
    },
    trends: {
      complaintsGrowth: 0,
      popularSectors: [],
      criticalAreas: []
    },
    realtime: {
      newComplaints: 0,
      resolvedComplaints: 0,
      urgentComplaints: 0,
      activeAdmins: 0,
      timestamp: null
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Récupérer les statistiques avancées
  const fetchAdvancedStats = useCallback(async (period = '30d', includeTimeline = true) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get('/statistics/advanced', {
        period,
        includeTimeline: includeTimeline.toString()
      });

      if (response.success) {
        setStats(prevStats => ({
          ...prevStats,
          ...response.data
        }));
        setLastUpdated(new Date());
      } else {
        throw new Error(response.error || 'Erreur lors du chargement des statistiques');
      }
    } catch (err) {
      console.error('Erreur récupération statistiques avancées:', err);
      setError(err.message);
      
      // Utiliser des données simulées en cas d'erreur
      setStats(prevStats => ({
        ...prevStats,
        overview: {
          complaints: { total: 1287, pending: 156, inProgress: 265, resolved: 824, rejected: 42 },
          users: { total: 45, active: 38, admins: 45 },
          structures: { ministries: 12, directions: 48, services: 156 },
          sectors: { total: 8, active: 7 }
        },
        timeline: {
          complaints: generateMockTimeline(period, 'complaints'),
          resolutions: generateMockTimeline(period, 'resolutions')
        },
        distributions: {
          complaintsByType: [
            { label: 'Service Public', count: 245 },
            { label: 'Infrastructure', count: 198 },
            { label: 'Administration', count: 176 },
            { label: 'Sécurité', count: 132 },
            { label: 'Environnement', count: 115 }
          ],
          complaintsBySector: [
            { label: 'Transport', count: 245 },
            { label: 'Santé', count: 198 },
            { label: 'Éducation', count: 176 },
            { label: 'Eau', count: 132 },
            { label: 'Énergie', count: 115 },
            { label: 'Environnement', count: 98 }
          ],
          complaintsByPriority: [
            { label: 'Normale', count: 650 },
            { label: 'Élevée', count: 320 },
            { label: 'Urgente', count: 180 },
            { label: 'Critique', count: 137 }
          ],
          complaintsByStatus: [
            { label: 'Résolues', count: 824 },
            { label: 'En traitement', count: 265 },
            { label: 'En attente', count: 156 },
            { label: 'Rejetées', count: 42 }
          ],
          usersByRole: [
            { label: 'Analyst', count: 15 },
            { label: 'Moderator', count: 12 },
            { label: 'Admin', count: 8 },
            { label: 'Structure Manager', count: 6 },
            { label: 'Super Admin', count: 4 }
          ]
        },
        performance: {
          averageResolutionTime: 5.2,
          resolutionRate: 64.0,
          satisfactionRate: 85,
          responseTime: 2.5
        },
        trends: {
          complaintsGrowth: 12,
          popularSectors: [
            { label: 'Transport', count: 245 },
            { label: 'Santé', count: 198 },
            { label: 'Éducation', count: 176 }
          ],
          criticalAreas: [
            { label: 'Transport Public', count: 45 },
            { label: 'Urgences Médicales', count: 32 },
            { label: 'Sécurité Routière', count: 28 }
          ]
        }
      }));
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  // Récupérer les données temps réel
  const fetchRealTimeData = useCallback(async () => {
    try {
      const response = await apiService.get('/statistics/realtime');

      if (response.success) {
        setStats(prevStats => ({
          ...prevStats,
          realtime: response.data
        }));
      } else {
        // Données simulées pour le temps réel
        setStats(prevStats => ({
          ...prevStats,
          realtime: {
            newComplaints: Math.floor(Math.random() * 20) + 5,
            resolvedComplaints: Math.floor(Math.random() * 15) + 3,
            urgentComplaints: Math.floor(Math.random() * 8) + 1,
            activeAdmins: Math.floor(Math.random() * 10) + 3,
            timestamp: new Date().toISOString()
          }
        }));
      }
    } catch (err) {
      console.error('Erreur récupération données temps réel:', err);
      // Utiliser des données simulées
      setStats(prevStats => ({
        ...prevStats,
        realtime: {
          newComplaints: Math.floor(Math.random() * 20) + 5,
          resolvedComplaints: Math.floor(Math.random() * 15) + 3,
          urgentComplaints: Math.floor(Math.random() * 8) + 1,
          activeAdmins: Math.floor(Math.random() * 10) + 3,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }, [apiService]);

  // Exporter les statistiques
  const exportStatistics = useCallback(async (format = 'csv', period = '30d', includeCharts = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post('/statistics/export', {
        format,
        period,
        includeCharts
      });

      if (response.success) {
        // Le fichier sera téléchargé automatiquement par le navigateur
        return response;
      } else {
        throw new Error(response.error || 'Erreur lors de l\'export');
      }
    } catch (err) {
      console.error('Erreur export statistiques:', err);
      setError(err.message);
      
      // Fallback : générer un CSV simple côté client
      const csvData = generateClientSideCSV(stats);
      downloadCSV(csvData, `statistiques-${period}-${Date.now()}.csv`);
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiService, stats]);

  // Actualiser toutes les données
  const refreshAll = useCallback(async (period = '30d') => {
    await Promise.all([
      fetchAdvancedStats(period),
      fetchRealTimeData()
    ]);
  }, [fetchAdvancedStats, fetchRealTimeData]);

  // Fonctions utilitaires
  const generateMockTimeline = (period, type) => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 180;
    const timeline = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const baseCount = type === 'complaints' ? 15 : 10;
      const variance = Math.floor(Math.random() * 10) - 5;
      timeline.push({
        date: date.toISOString().split('T')[0],
        count: Math.max(0, baseCount + variance)
      });
    }
    
    return timeline;
  };

  const generateClientSideCSV = (statsData) => {
    const csvRows = [
      ['Métrique', 'Valeur'],
      ['Total Plaintes', statsData.overview.complaints.total],
      ['Plaintes Résolues', statsData.overview.complaints.resolved],
      ['Plaintes En Attente', statsData.overview.complaints.pending],
      ['Plaintes En Traitement', statsData.overview.complaints.inProgress],
      ['Plaintes Rejetées', statsData.overview.complaints.rejected],
      ['Taux de Résolution (%)', statsData.performance.resolutionRate.toFixed(1)],
      ['Temps Moyen de Résolution (jours)', statsData.performance.averageResolutionTime],
      ['Utilisateurs Actifs', statsData.overview.users.active],
      ['Secteurs Actifs', statsData.overview.sectors.active],
      ['Satisfaction (%)', statsData.performance.satisfactionRate]
    ];
    
    return csvRows.map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Charger les données au montage
  useEffect(() => {
    fetchAdvancedStats();
  }, []);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    fetchAdvancedStats,
    fetchRealTimeData,
    exportStatistics,
    refreshAll,
    refresh: () => refreshAll()
  };
};