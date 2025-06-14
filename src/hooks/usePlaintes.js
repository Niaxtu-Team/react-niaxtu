import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const usePlaintes = () => {
  const { apiService } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupérer les plaintes avec filtres
  const getPlaintes = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Construire les paramètres de requête
      const params = {};
      
      if (filters.status) params.status = filters.status;
      if (filters.complaintType) params.complaintType = filters.complaintType;
      if (filters.targetType) params.targetType = filters.targetType;
      if (filters.priority) params.priority = filters.priority;
      if (filters.assignedTo) params.assignedTo = filters.assignedTo;
      if (filters.ministereId) params.ministereId = filters.ministereId;
      if (filters.limit) params.limit = filters.limit;
      if (filters.page) params.page = filters.page;
      if (filters.isDraft !== undefined) params.isDraft = filters.isDraft;
      
      const response = await apiService.get('/complaints', params);
      
      return {
        plaintes: response.complaints || response.data || [],
        total: response.total || 0,
        pagination: response.pagination || {}
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer une plainte spécifique
  const getPlainte = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get(`/complaints/${id}`);
      return response.data || response.complaint;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'une plainte
  const updatePlainteStatus = async (id, status, comment = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.put(`/complaints/${id}/status`, { 
        status, 
        comment 
      });
      
      return response.data || response.complaint;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un commentaire à une plainte
  const addComment = async (id, text, isInternal = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.post(`/complaints/${id}/comments`, {
        text, 
        isInternal
      });
      
      return response.data || response.comment;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une plainte
  const deletePlainte = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.delete(`/complaints/${id}`);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les types de plaintes
  const getComplaintTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get('/complaints/types');
      return {
        complaintTypes: response.complaintTypes || [],
        targetTypes: response.targetTypes || [],
        submissionTypes: response.submissionTypes || []
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques des plaintes
  const getPlaintesStats = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.dateDebut) params.dateDebut = filters.dateDebut;
      if (filters.dateFin) params.dateFin = filters.dateFin;
      if (filters.secteur) params.secteur = filters.secteur;
      
      const response = await apiService.get('/plainte/stats', params);
      return response.data || response.stats;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Exporter les plaintes
  const exportPlaintes = async (filters = {}, format = 'excel') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { ...filters, format };
      const response = await apiService.get('/complaints/export', params);
      
      // Si c'est un fichier, déclencher le téléchargement
      if (response.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPlaintes,
    getPlainte,
    updatePlainteStatus,
    addComment,
    deletePlainte,
    getComplaintTypes,
    getPlaintesStats,
    exportPlaintes,
    setError
  };
};

export default usePlaintes;
