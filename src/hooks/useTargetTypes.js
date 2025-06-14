import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useTargetTypes = () => {
  const { apiService } = useAuth();
  const [targetTypes, setTargetTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTargetTypes = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 50,
        ...(filters.search && { search: filters.search }),
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters.category && { category: filters.category })
      });

      const response = await apiService.get(`/types/targets?${params}`);
      
      if (response.success) {
        setTargetTypes(response.data || []);
        return {
          targetTypes: response.data || [],
          total: response.count || 0,
          success: true
        };
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des types de cibles');
      }
    } catch (err) {
      console.error('Erreur chargement types de cibles:', err);
      setError(err.message);
      return {
        targetTypes: [],
        total: 0,
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  const createTargetType = async (targetTypeData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.post('/types/targets', targetTypeData);
      
      if (response.success) {
        // Recharger la liste après création
        await fetchTargetTypes();
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Erreur lors de la création du type de cible');
      }
    } catch (err) {
      console.error('Erreur création type de cible:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateTargetType = async (id, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.put(`/types/targets/${id}`, updateData);
      
      if (response.success) {
        // Mettre à jour localement
        setTargetTypes(prev => prev.map(type => 
          type.id === id ? { ...type, ...updateData } : type
        ));
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour du type de cible');
      }
    } catch (err) {
      console.error('Erreur mise à jour type de cible:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteTargetType = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.delete(`/types/targets/${id}`);
      
      if (response.success) {
        setTargetTypes(prev => prev.filter(type => type.id !== id));
        return { success: true };
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression du type de cible');
      }
    } catch (err) {
      console.error('Erreur suppression type de cible:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const toggleTargetTypeStatus = async (id, currentStatus) => {
    try {
      const response = await apiService.put(`/types/targets/${id}`, {
        isActive: !currentStatus
      });
      
      if (response.success) {
        setTargetTypes(prev => prev.map(type => 
          type.id === id ? { ...type, isActive: !currentStatus } : type
        ));
        return { success: true };
      } else {
        throw new Error(response.message || 'Erreur lors du changement de statut');
      }
    } catch (err) {
      console.error('Erreur changement statut:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchTargetTypes();
  }, []);

  return {
    targetTypes,
    loading,
    error,
    fetchTargetTypes,
    createTargetType,
    updateTargetType,
    deleteTargetType,
    toggleTargetTypeStatus,
    refresh: fetchTargetTypes
  };
}; 