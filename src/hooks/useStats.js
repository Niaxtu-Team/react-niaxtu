import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useStats = () => {
  const { apiService } = useAuth();
  const [stats, setStats] = useState({
    complaints: {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
      today: 0,
      thisWeek: 0
    },
    users: {
      total: 0,
      active: 0,
      admins: 0,
      newThisMonth: 0
    },
    structures: {
      ministries: 0,
      directions: 0,
      services: 0,
      sectors: 0
    },
    performance: {
      responseTime: 0,
      resolutionRate: 0,
      satisfactionRate: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les statistiques depuis l'API
      const response = await apiService.get('/admin/stats');
      
      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des statistiques');
      }
    } catch (err) {
      console.error('Erreur chargement statistiques:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaintStats = async (period = '7d') => {
    try {
      const response = await apiService.get('/admin/stats/complaints', { period });
      
      if (response.success) {
        setStats(prev => ({
          ...prev,
          complaints: response.data
        }));
      }
      
      return response.data;
    } catch (err) {
      console.error('Erreur statistiques plaintes:', err);
      throw err;
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await apiService.get('/admin/stats/users');
      
      if (response.success) {
        setStats(prev => ({
          ...prev,
          users: response.data
        }));
      }
      
      return response.data;
    } catch (err) {
      console.error('Erreur statistiques utilisateurs:', err);
      throw err;
    }
  };

  const fetchStructureStats = async () => {
    try {
      const response = await apiService.get('/admin/stats/structures');
      
      if (response.success) {
        setStats(prev => ({
          ...prev,
          structures: response.data
        }));
      }
      
      return response.data;
    } catch (err) {
      console.error('Erreur statistiques structures:', err);
      throw err;
    }
  };

  const fetchPerformanceStats = async (period = '30d') => {
    try {
      const response = await apiService.get('/admin/stats/performance', { period });
      
      if (response.success) {
        setStats(prev => ({
          ...prev,
          performance: response.data
        }));
      }
      
      return response.data;
    } catch (err) {
      console.error('Erreur statistiques performance:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
    fetchComplaintStats,
    fetchUserStats,
    fetchStructureStats,
    fetchPerformanceStats,
    refresh: fetchStats
  };
}; 