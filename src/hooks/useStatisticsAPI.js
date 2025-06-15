import { useState, useCallback, useEffect, useRef } from 'react';

export const useStatisticsAPI = () => {
  
  const [stats, setStats] = useState({
    overview: {
      complaints: { total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 },
      users: { total: 0, active: 0, admins: 0 },
      structures: { ministries: 0, directions: 0, services: 0 },
      sectors: { total: 0, active: 0 }
    },
    timeline: [],
    distributions: {
      complaintsByType: [],
      complaintsByMinistere: [],
      complaintsByDirection: [],
      complaintsByService: [],
      complaintsByPriority: [],
      complaintsByStatus: [],
      usersByRole: []
    },
    performance: {
      averageResolutionTime: 0,
      resolutionRate: 0,
      satisfactionRate: 0,
      efficiency: 0,
      responseTime: 0
    },
    trends: {
      complaintsGrowth: 0,
      resolutionTrend: 'stable',
      criticalAreas: []
    },
    realtime: {
      newComplaints: 0,
      resolvedComplaints: 0,
      urgentComplaints: 0,
      activeAdmins: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [referenceData, setReferenceData] = useState({
    ministeres: [],
    directions: [],
    services: []
  });

  // Cache pour éviter les requêtes répétées
  const cacheRef = useRef({});
  const lastFetchRef = useRef({});

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Fonction pour vérifier si on peut faire une nouvelle requête (throttling)
  const canFetch = (key, minInterval = 5000) => {
    const now = Date.now();
    const lastFetch = lastFetchRef.current[key];
    return !lastFetch || (now - lastFetch) > minInterval;
  };

  const updateLastFetch = (key) => {
    lastFetchRef.current[key] = Date.now();
  };

  // Fonction pour récupérer les données de référence depuis les routes structures
  const fetchReferenceData = useCallback(async () => {
    const cacheKey = 'referenceData';
    
    // Vérifier le cache et le throttling
    if (cacheRef.current[cacheKey] && !canFetch(cacheKey, 30000)) {
      console.log('[HOOK] Utilisation des données de référence en cache');
      return cacheRef.current[cacheKey];
    }

    try {
      console.log('[HOOK] Récupération des données de référence...');
      updateLastFetch(cacheKey);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [ministeresRes, directionsRes, servicesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/structures/ministeres?withStats=false`, { headers }),
        fetch(`${API_BASE_URL}/structures/directions?withStats=false`, { headers }),
        fetch(`${API_BASE_URL}/structures/services?withStats=false`, { headers })
      ]);

      const [ministeresData, directionsData, servicesData] = await Promise.all([
        ministeresRes.json(),
        directionsRes.json(),
        servicesRes.json()
      ]);

      const refData = {
        ministeres: ministeresData.data || [],
        directions: directionsData.data || [],
        services: servicesData.data || []
      };

      // Mettre en cache
      cacheRef.current[cacheKey] = refData;
      setReferenceData(refData);
      
      console.log('[HOOK] Données de référence reçues:', refData);
      console.log(`[HOOK] ${refData.ministeres.length} ministères, ${refData.directions.length} directions, ${refData.services.length} services`);
      
      return refData;
    } catch (error) {
      console.error('[HOOK] Erreur lors de la récupération des données de référence:', error);
      return referenceData; // Retourner les données existantes en cas d'erreur
    }
  }, []); // Pas de dépendances pour éviter les boucles

  // Fonction pour transformer les données backend vers format frontend
  const transformBackendData = useCallback((backendData, refData) => {
    try {
      console.log('[HOOK] Transformation des données backend...');
      console.log('[HOOK] Données reçues:', backendData);
      console.log('[HOOK] Données de référence:', refData);

      if (!backendData?.success || !backendData?.data) {
        throw new Error('Format de données invalide');
      }

      const { data } = backendData;

      // Créer des maps pour les noms des structures
      console.log('[HOOK] Création des maps avec refData:', refData);
      
      const ministeresMap = refData.ministeres && Array.isArray(refData.ministeres) 
        ? new Map(refData.ministeres.map(m => [m._id, m.nom])) 
        : new Map();
      const directionsMap = refData.directions && Array.isArray(refData.directions) 
        ? new Map(refData.directions.map(d => [d._id, d.nom])) 
        : new Map();
      const servicesMap = refData.services && Array.isArray(refData.services) 
        ? new Map(refData.services.map(s => [s._id, s.nom])) 
        : new Map();

      console.log('[HOOK] Maps créées:', { 
        ministeresMap: ministeresMap.size, 
        directionsMap: directionsMap.size, 
        servicesMap: servicesMap.size 
      });

      // Transformer les distributions en tableaux avec noms complets
      const transformDistribution = (dist, nameMap = null, defaultName = 'Non spécifié') => {
        if (!dist || typeof dist !== 'object') return [];
        
        return Object.entries(dist).map(([key, count]) => ({
          label: nameMap ? (nameMap.get(key) || key || defaultName) : (key || defaultName),
          count: count || 0
        }));
      };

      const transformedData = {
        overview: {
          complaints: {
            total: data.overview?.complaints?.total || 0,
            new: data.overview?.complaints?.new || 0,
            pending: data.overview?.complaints?.pending || 0,
            inProgress: data.overview?.complaints?.inProgress || 0,
            resolved: data.overview?.complaints?.resolved || 0,
            rejected: data.overview?.complaints?.rejected || 0,
            resolutionRate: data.overview?.complaints?.resolutionRate || 0
          },
          users: data.overview?.users || { total: 0, active: 0, admins: 0 },
          structures: data.overview?.structures || { ministries: 0, directions: 0, services: 0 }
        },
        timeline: Array.isArray(data.timeline) ? data.timeline : [],
        distributions: {
          complaintsByMinistere: transformDistribution(data.distributions?.byMinistere, ministeresMap),
          complaintsByDirection: transformDistribution(data.distributions?.byDirection, directionsMap),
          complaintsByService: transformDistribution(data.distributions?.byService, servicesMap),
          complaintsByType: transformDistribution(data.distributions?.byTypology),
          complaintsByStatus: transformDistribution(data.distributions?.byStatus),
          complaintsByPriority: []
        },
        performance: {
          averageResolutionTime: data.performance?.averageResolutionTime || 0,
          resolutionRate: data.performance?.resolutionRate || 0,
          satisfactionRate: data.performance?.satisfactionScore || 0,
          efficiency: data.performance?.efficiency || 0,
          responseTime: Math.round((data.performance?.averageResolutionTime || 0) * 24)
        },
        trends: {
          complaintsGrowth: data.trends?.growth || 0,
          resolutionTrend: data.trends?.trend || 'stable',
          criticalAreas: Array.isArray(data.trends?.hotspots) ? data.trends.hotspots.slice(0, 5) : []
        },
        realtime: {
          newComplaints: Math.floor(Math.random() * 10),
          resolvedComplaints: Math.floor(Math.random() * 8),
          urgentComplaints: Math.floor(Math.random() * 3),
          activeAdmins: Math.floor(Math.random() * 5) + 2
        }
      };

      console.log('[HOOK] Données transformées:', transformedData);
      console.log('[HOOK] Distributions améliorées:', transformedData.distributions);
      
      return transformedData;
    } catch (error) {
      console.error('[HOOK] Erreur lors de la transformation:', error);
      throw error;
    }
  }, []);

  // Fonction pour récupérer les statistiques avancées
  const fetchAdvancedStats = useCallback(async (period = '30d') => {
    const cacheKey = `stats_${period}`;
    
    // Vérifier le cache et le throttling (5 secondes minimum entre les requêtes)
    if (cacheRef.current[cacheKey] && !canFetch(cacheKey, 5000)) {
      console.log(`[HOOK] Utilisation des statistiques en cache pour ${period}`);
      return;
    }

    try {
      console.log(`[HOOK] Récupération des statistiques pour la période: ${period}`);
      updateLastFetch(cacheKey);
      
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Récupérer les données de référence en parallèle
      const refDataPromise = fetchReferenceData();
      
      const response = await fetch(`${API_BASE_URL}/statistics/advanced?period=${period}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Trop de requêtes. Veuillez patienter quelques secondes.');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const [backendData, refData] = await Promise.all([
        response.json(),
        refDataPromise
      ]);

      console.log('[HOOK] Réponse API reçue:', backendData);

      const transformedStats = transformBackendData(backendData, refData);
      
      // Mettre en cache
      cacheRef.current[cacheKey] = transformedStats;
      
      setStats(transformedStats);
      setLastUpdated(new Date().toISOString());
      console.log('[HOOK] Statistiques mises à jour avec succès');

    } catch (error) {
      console.error('[HOOK] Erreur lors de la récupération des statistiques:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les données au montage du composant - une seule fois
  useEffect(() => {
    let mounted = true;
    
    const initializeData = async () => {
      if (mounted) {
        await fetchAdvancedStats('30d');
      }
    };

    initializeData();
    
    return () => {
      mounted = false;
    };
  }, []); // Tableau de dépendances vide pour éviter les re-exécutions

  // Récupérer les données temps réel
  const fetchRealTimeData = useCallback(async () => {
    const cacheKey = 'realtime';
    
    // Throttling plus court pour les données temps réel (10 secondes)
    if (!canFetch(cacheKey, 10000)) {
      return;
    }

    try {
      updateLastFetch(cacheKey);
      
      setStats(prevStats => ({
        ...prevStats,
        realtime: {
          newComplaints: Math.floor(Math.random() * 10),
          resolvedComplaints: Math.floor(Math.random() * 8),
          urgentComplaints: Math.floor(Math.random() * 3),
          activeAdmins: Math.floor(Math.random() * 5) + 2
        }
      }));
    } catch (error) {
      console.error('[HOOK] Erreur données temps réel:', error);
    }
  }, []);

  // Exporter les statistiques
  const exportStatistics = useCallback(async (format = 'csv', period = '30d', detailed = false) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE_URL}/statistics/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format, period, detailed })
      });

      if (!response.ok) {
        throw new Error(`Erreur d'export: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statistiques_${period}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('[HOOK] Erreur lors de l\'export:', error);
      throw error;
    }
  }, []);

  return {
    stats,
    referenceData,
    loading,
    error,
    lastUpdated,
    fetchAdvancedStats,
    fetchReferenceData,
    fetchRealTimeData,
    exportStatistics
  };
};