import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useAdminHistory = () => {
  const { apiService } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0
  });

  const fetchHistory = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await apiService.get('/admin/history', params);
      
      if (response.success) {
        setHistory(response.history);
        setPagination(prev => ({
          ...prev,
          total: response.total,
          totalPages: response.totalPages
        }));
      } else {
        throw new Error(response.message || 'Erreur lors du chargement de l\'historique');
      }
    } catch (err) {
      console.error('Erreur chargement historique:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryByAdmin = async (adminId, filters = {}) => {
    try {
      const params = {
        adminId,
        page: 1,
        limit: 50,
        ...filters
      };

      const response = await apiService.get('/admin/history', params);
      
      if (response.success) {
        return response.history;
      } else {
        throw new Error(response.message || 'Erreur lors du chargement de l\'historique');
      }
    } catch (err) {
      console.error('Erreur chargement historique admin:', err);
      throw err;
    }
  };

  const fetchHistoryByAction = async (action, filters = {}) => {
    try {
      const params = {
        action,
        page: 1,
        limit: 50,
        ...filters
      };

      const response = await apiService.get('/admin/history', params);
      
      if (response.success) {
        return response.history;
      } else {
        throw new Error(response.message || 'Erreur lors du chargement de l\'historique');
      }
    } catch (err) {
      console.error('Erreur chargement historique action:', err);
      throw err;
    }
  };

  const getHistoryStats = async (period = '30d') => {
    try {
      const response = await apiService.get('/admin/history/stats', { period });
      
      if (response.success) {
        return response.stats;
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des statistiques');
      }
    } catch (err) {
      console.error('Erreur statistiques historique:', err);
      throw err;
    }
  };

  const exportHistory = async (filters = {}, format = 'csv') => {
    try {
      const params = {
        format,
        ...filters
      };

      const response = await apiService.get('/admin/history/export', params);
      
      if (response.success) {
        // Créer et télécharger le fichier
        const blob = new Blob([response.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `historique-admins-${new Date().toISOString().split('T')[0]}.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error(response.message || 'Erreur lors de l\'export');
      }
    } catch (err) {
      console.error('Erreur export historique:', err);
      throw err;
    }
  };

  const setPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const setLimit = (limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  useEffect(() => {
    fetchHistory();
  }, [pagination.page, pagination.limit]);

  return {
    history,
    loading,
    error,
    pagination,
    fetchHistory,
    fetchHistoryByAdmin,
    fetchHistoryByAction,
    getHistoryStats,
    exportHistory,
    setPage,
    setLimit,
    refresh: () => fetchHistory()
  };
}; 