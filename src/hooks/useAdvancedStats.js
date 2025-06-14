import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export const useAdvancedStats = () => {
  const { apiService } = useAuth();
  
  const [stats, setStats] = useState({
    // Statistiques générales
    overview: {
      complaints: { total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 },
      users: { total: 0, active: 0, admins: 0 },
      structures: { ministries: 0, directions: 0, services: 0 },
      sectors: { total: 0, active: 0 }
    },
    
    // Évolution temporelle
    timeline: {
      complaints: [],
      resolutions: [],
      users: []
    },
    
    // Répartitions
    distributions: {
      complaintsByType: [],
      complaintsBySector: [],
      complaintsByStructure: [],
      complaintsByPriority: [],
      complaintsByStatus: [],
      usersByRole: [],
      resolutionTimes: []
    },
    
    // Performance
    performance: {
      averageResolutionTime: 0,
      resolutionRate: 0,
      satisfactionRate: 0,
      responseTime: 0,
      efficiency: {
        daily: [],
        weekly: [],
        monthly: []
      }
    },
    
    // Tendances
    trends: {
      complaintsGrowth: 0,
      resolutionImprovement: 0,
      userGrowth: 0,
      popularSectors: [],
      criticalAreas: []
    },
    
    // Comparaisons
    comparisons: {
      currentVsPrevious: {
        complaints: { current: 0, previous: 0, change: 0 },
        resolutions: { current: 0, previous: 0, change: 0 },
        users: { current: 0, previous: 0, change: 0 }
      },
      sectorPerformance: [],
      structureRankings: []
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Récupérer les statistiques générales
  const fetchOverviewStats = useCallback(async () => {
    try {
      const response = await apiService.get('/admin/dashboard/stats');
      if (response.success) {
        const { stats: dashStats } = response;
        setStats(prev => ({
          ...prev,
          overview: {
            complaints: {
              total: dashStats.complaints?.total || 0,
              pending: dashStats.complaints?.pending || 0,
              inProgress: dashStats.complaints?.inProgress || 0,
              resolved: dashStats.complaints?.resolved || 0,
              rejected: dashStats.complaints?.rejected || 0
            },
            users: {
              total: dashStats.admins?.total || 0,
              active: dashStats.admins?.active || 0,
              admins: dashStats.admins?.total || 0
            },
            structures: {
              ministries: dashStats.structures?.total || 0,
              directions: 0,
              services: 0
            },
            sectors: {
              total: dashStats.sectors?.total || 0,
              active: dashStats.sectors?.active || 0
            }
          }
        }));
      }
    } catch (err) {
      console.error('Erreur récupération stats overview:', err);
    }
  }, [apiService]);

  // Récupérer les données d'évolution temporelle
  const fetchTimelineStats = useCallback(async (period = '30d') => {
    try {
      const [complaintsResponse, resolutionsResponse] = await Promise.all([
        apiService.get('/complaints', { 
          limit: 1000, 
          period,
          includeTimeline: true 
        }),
        apiService.get('/complaints', { 
          status: 'resolue', 
          limit: 1000, 
          period,
          includeTimeline: true 
        })
      ]);

      // Traitement des données pour créer des séries temporelles
      const complaintsTimeline = processTimelineData(complaintsResponse.plaintes || [], period);
      const resolutionsTimeline = processTimelineData(resolutionsResponse.plaintes || [], period, 'resolvedAt');

      setStats(prev => ({
        ...prev,
        timeline: {
          complaints: complaintsTimeline,
          resolutions: resolutionsTimeline,
          users: prev.timeline.users
        }
      }));
    } catch (err) {
      console.error('Erreur récupération timeline:', err);
    }
  }, [apiService]);

  // Récupérer les répartitions
  const fetchDistributionStats = useCallback(async () => {
    try {
      const [complaintsResponse, typesResponse, sectorsResponse, usersResponse] = await Promise.all([
        apiService.get('/complaints', { limit: 1000, includeDetails: true }),
        apiService.get('/types/complaints'),
        apiService.get('/sectors'),
        apiService.get('/admin')
      ]);

      const complaints = complaintsResponse.plaintes || [];
      
      // Répartition par type
      const complaintsByType = processDistribution(complaints, 'complaintType');
      
      // Répartition par secteur
      const complaintsBySector = processDistribution(complaints, 'targetType');
      
      // Répartition par priorité
      const complaintsByPriority = processDistribution(complaints, 'priority');
      
      // Répartition par statut
      const complaintsByStatus = processDistribution(complaints, 'status');
      
      // Répartition des utilisateurs par rôle
      const users = usersResponse.users || [];
      const usersByRole = processDistribution(users, 'role');

      // Temps de résolution
      const resolutionTimes = calculateResolutionTimes(complaints);

      setStats(prev => ({
        ...prev,
        distributions: {
          complaintsByType,
          complaintsBySector,
          complaintsByStructure: prev.distributions.complaintsByStructure,
          complaintsByPriority,
          complaintsByStatus,
          usersByRole,
          resolutionTimes
        }
      }));
    } catch (err) {
      console.error('Erreur récupération distributions:', err);
    }
  }, [apiService]);

  // Récupérer les statistiques de performance
  const fetchPerformanceStats = useCallback(async () => {
    try {
      const complaintsResponse = await apiService.get('/complaints', { 
        limit: 1000, 
        includeResolutionData: true 
      });

      const complaints = complaintsResponse.plaintes || [];
      const resolvedComplaints = complaints.filter(c => c.status === 'resolue');
      
      // Temps de résolution moyen
      const averageResolutionTime = calculateAverageResolutionTime(resolvedComplaints);
      
      // Taux de résolution
      const resolutionRate = complaints.length > 0 
        ? (resolvedComplaints.length / complaints.length) * 100 
        : 0;
      
      // Efficacité par période
      const efficiency = calculateEfficiencyTrends(complaints);

      setStats(prev => ({
        ...prev,
        performance: {
          averageResolutionTime,
          resolutionRate,
          satisfactionRate: 85, // À récupérer depuis l'API si disponible
          responseTime: 2.5, // À récupérer depuis l'API si disponible
          efficiency
        }
      }));
    } catch (err) {
      console.error('Erreur récupération performance:', err);
    }
  }, [apiService]);

  // Récupérer les tendances
  const fetchTrendsStats = useCallback(async () => {
    try {
      const [currentResponse, previousResponse] = await Promise.all([
        apiService.get('/complaints', { period: '30d', limit: 1000 }),
        apiService.get('/complaints', { period: '60d', offset: '30d', limit: 1000 })
      ]);

      const currentComplaints = currentResponse.plaintes || [];
      const previousComplaints = previousResponse.plaintes || [];

      // Croissance des plaintes
      const complaintsGrowth = calculateGrowthRate(currentComplaints.length, previousComplaints.length);
      
      // Amélioration de la résolution
      const currentResolved = currentComplaints.filter(c => c.status === 'resolue').length;
      const previousResolved = previousComplaints.filter(c => c.status === 'resolue').length;
      const resolutionImprovement = calculateGrowthRate(currentResolved, previousResolved);

      // Secteurs populaires
      const popularSectors = getPopularSectors(currentComplaints);
      
      // Zones critiques
      const criticalAreas = getCriticalAreas(currentComplaints);

      setStats(prev => ({
        ...prev,
        trends: {
          complaintsGrowth,
          resolutionImprovement,
          userGrowth: 0, // À calculer
          popularSectors,
          criticalAreas
        }
      }));
    } catch (err) {
      console.error('Erreur récupération tendances:', err);
    }
  }, [apiService]);

  // Récupérer toutes les statistiques
  const fetchAllStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        fetchOverviewStats(),
        fetchTimelineStats(),
        fetchDistributionStats(),
        fetchPerformanceStats(),
        fetchTrendsStats()
      ]);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erreur récupération statistiques complètes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchOverviewStats, fetchTimelineStats, fetchDistributionStats, fetchPerformanceStats, fetchTrendsStats]);

  // Fonctions utilitaires
  const processTimelineData = (data, period, dateField = 'createdAt') => {
    const timeline = {};
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

    // Initialiser les dates
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      timeline[key] = 0;
    }

    // Compter les éléments par date
    data.forEach(item => {
      const date = new Date(item[dateField]);
      const key = date.toISOString().split('T')[0];
      if (timeline.hasOwnProperty(key)) {
        timeline[key]++;
      }
    });

    return Object.entries(timeline).map(([date, count]) => ({ date, count }));
  };

  const processDistribution = (data, field) => {
    const distribution = {};
    data.forEach(item => {
      const value = item[field] || 'Non spécifié';
      distribution[value] = (distribution[value] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  };

  const calculateResolutionTimes = (complaints) => {
    const resolvedComplaints = complaints.filter(c => c.status === 'resolue' && c.resolvedAt);
    const times = resolvedComplaints.map(c => {
      const created = new Date(c.createdAt);
      const resolved = new Date(c.resolvedAt);
      return Math.floor((resolved - created) / (1000 * 60 * 60 * 24)); // en jours
    });

    const ranges = {
      '0-1 jour': 0,
      '2-3 jours': 0,
      '4-7 jours': 0,
      '1-2 semaines': 0,
      '2-4 semaines': 0,
      '1+ mois': 0
    };

    times.forEach(days => {
      if (days <= 1) ranges['0-1 jour']++;
      else if (days <= 3) ranges['2-3 jours']++;
      else if (days <= 7) ranges['4-7 jours']++;
      else if (days <= 14) ranges['1-2 semaines']++;
      else if (days <= 28) ranges['2-4 semaines']++;
      else ranges['1+ mois']++;
    });

    return Object.entries(ranges).map(([label, count]) => ({ label, count }));
  };

  const calculateAverageResolutionTime = (resolvedComplaints) => {
    if (resolvedComplaints.length === 0) return 0;
    
    const totalDays = resolvedComplaints.reduce((sum, complaint) => {
      const created = new Date(complaint.createdAt);
      const resolved = new Date(complaint.resolvedAt);
      return sum + Math.floor((resolved - created) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / resolvedComplaints.length);
  };

  const calculateEfficiencyTrends = (complaints) => {
    // Calculer l'efficacité par jour, semaine, mois
    const daily = processTimelineData(complaints.filter(c => c.status === 'resolue'), '30d', 'resolvedAt');
    const weekly = []; // À implémenter
    const monthly = []; // À implémenter

    return { daily, weekly, monthly };
  };

  const calculateGrowthRate = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getPopularSectors = (complaints) => {
    const sectorCounts = processDistribution(complaints, 'targetType');
    return sectorCounts.slice(0, 5); // Top 5
  };

  const getCriticalAreas = (complaints) => {
    const urgentComplaints = complaints.filter(c => 
      c.priority === 'urgente' || c.priority === 'critique'
    );
    const criticalSectors = processDistribution(urgentComplaints, 'targetType');
    return criticalSectors.slice(0, 3); // Top 3 zones critiques
  };

  // Charger les données au montage
  useEffect(() => {
    fetchAllStats();
  }, []);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    fetchAllStats,
    fetchOverviewStats,
    fetchTimelineStats,
    fetchDistributionStats,
    fetchPerformanceStats,
    fetchTrendsStats,
    refresh: () => fetchAllStats()
  };
};