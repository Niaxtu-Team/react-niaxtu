import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook personnalisé pour la gestion des utilisateurs
 * Implémente les spécifications du prompt frontend NIAXTU
 */
const useUsers = () => {
  const { apiService } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Logger personnalisé avec horodatage
  const logWithTimestamp = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [useUsers] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'info':
        console.log(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'error':
        console.error(logMessage, data || '');
        break;
      case 'debug':
        console.debug(logMessage, data || '');
        break;
      default:
        console.log(logMessage, data || '');
    }
  };

  /**
   * Récupérer la liste des utilisateurs avec filtres et pagination
   * Endpoint: GET /users/all
   */
  const fetchUsers = useCallback(async (filters = {}) => {
    const filterInfo = {
      page: filters.page || pagination.page,
      limit: filters.limit || pagination.limit,
      search: filters.search || '',
      isActive: filters.isActive || 'all',
      role: filters.role || 'all',
      dateRange: filters.dateRange || 'all'
    };
    
    logWithTimestamp('info', 'Récupération des utilisateurs avec filtres', filterInfo);
    
    setLoading(true);
    setError(null);
    
    try {
      // Construction des paramètres de requête
      const params = {
        page: filterInfo.page.toString(),
        limit: filterInfo.limit.toString()
      };
      
      if (filterInfo.search) {
        params.search = filterInfo.search;
      }
      
      if (filterInfo.isActive !== 'all') {
        params.isActive = filterInfo.isActive;
      }
      
      if (filterInfo.role !== 'all') {
        params.role = filterInfo.role;
      }
      
      if (filterInfo.dateRange !== 'all') {
        params.dateRange = filterInfo.dateRange;
      }

      const startTime = performance.now();
      const response = await apiService.get('/users/all', params);
      const endTime = performance.now();
      
      logWithTimestamp('info', `Utilisateurs récupérés en ${(endTime - startTime).toFixed(2)}ms`);
      
      // LOG DÉTAILLÉ DE LA RÉPONSE
      logWithTimestamp('debug', 'Réponse complète de l\'API /users/all', {
        success: response.success,
        dataLength: response.data?.length,
        pagination: response.pagination,
        fullResponse: response
      });

      if (response.success && response.data) {
        // Normaliser les données utilisateur
        const normalizedUsers = response.data.map(user => {
          // Convertir les timestamps Firebase en dates JavaScript
          const convertFirebaseTimestamp = (timestamp) => {
            if (!timestamp) return null;
            if (typeof timestamp === 'string') return timestamp;
            if (timestamp._seconds) {
              return new Date(timestamp._seconds * 1000).toISOString();
            }
            return timestamp;
          };

          return {
            ...user,
            createdAt: convertFirebaseTimestamp(user.createdAt) || new Date().toISOString(),
            updatedAt: convertFirebaseTimestamp(user.updatedAt) || new Date().toISOString(),
            lastLogin: convertFirebaseTimestamp(user.lastLogin),
            isActive: user.isActive !== undefined ? user.isActive : true,
            role: user.role || 'user',
            displayName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
            // Normaliser l'historique de connexions si présent
            loginHistory: user.loginHistory?.map(entry => ({
              ...entry,
              timestamp: convertFirebaseTimestamp(entry.timestamp)
            })) || []
          };
        });
        
        setUsers(normalizedUsers);
        setPagination({
          page: response.pagination?.page || filterInfo.page,
          limit: response.pagination?.limit || filterInfo.limit,
          total: response.pagination?.total || normalizedUsers.length,
          pages: response.pagination?.pages || Math.ceil((response.pagination?.total || normalizedUsers.length) / filterInfo.limit)
        });
        
        logWithTimestamp('info', `${normalizedUsers.length} utilisateurs chargés avec succès`);
        logWithTimestamp('debug', 'Pagination mise à jour', {
          page: response.pagination?.page || filterInfo.page,
          total: response.pagination?.total || normalizedUsers.length,
          pages: response.pagination?.pages || Math.ceil((response.pagination?.total || normalizedUsers.length) / filterInfo.limit)
        });
        
        return {
          users: normalizedUsers,
          pagination: {
            page: response.pagination?.page || filterInfo.page,
            limit: response.pagination?.limit || filterInfo.limit,
            total: response.pagination?.total || normalizedUsers.length,
            pages: response.pagination?.pages || Math.ceil((response.pagination?.total || normalizedUsers.length) / filterInfo.limit)
          },
          success: true
        };
      } else {
        const errorMessage = response.message || 'Erreur lors de la récupération des utilisateurs';
        logWithTimestamp('error', 'Échec de la récupération des utilisateurs', response);
        setError(errorMessage);
        
        return {
          users: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la récupération des utilisateurs';
      logWithTimestamp('error', 'Exception lors de la récupération des utilisateurs', {
        message: error.message,
        stack: error.stack,
        filters: filterInfo
      });
      
      setError(errorMessage);
      return {
        users: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [apiService, pagination.page, pagination.limit]);

  /**
   * Récupérer un utilisateur par ID
   * Endpoint: GET /users/:id
   */
  const getUserById = useCallback(async (userId) => {
    logWithTimestamp('info', `Récupération de l'utilisateur ID: ${userId}`);
    
    setLoading(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      const response = await apiService.get(`/users/${userId}`);
      const endTime = performance.now();
      
      logWithTimestamp('info', `Utilisateur récupéré en ${(endTime - startTime).toFixed(2)}ms`);
      logWithTimestamp('debug', 'Données utilisateur reçues', {
        success: response.success,
        userId: response.data?.id,
        email: response.data?.email
      });

      if (response.success) {
        logWithTimestamp('info', `Utilisateur ${userId} récupéré avec succès`);
        return {
          user: response.data,
          success: true
        };
      } else {
        const errorMessage = response.message || 'Utilisateur non trouvé';
        logWithTimestamp('error', `Échec de la récupération de l'utilisateur ${userId}`, response);
        setError(errorMessage);
        
        return {
          user: null,
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la récupération de l\'utilisateur';
      logWithTimestamp('error', `Exception lors de la récupération de l'utilisateur ${userId}`, {
        message: error.message,
        stack: error.stack
      });
      
      setError(errorMessage);
      return {
        user: null,
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  /**
   * Créer un nouvel utilisateur
   * Endpoint: POST /users
   */
  const createUser = useCallback(async (userData) => {
    logWithTimestamp('info', 'Création d\'un nouvel utilisateur', {
      email: userData.email,
      role: userData.role,
      displayName: userData.displayName
    });
    
    setLoading(true);
    setError(null);
    
    try {
      // Validation côté client
      if (!userData.email || !userData.password || !userData.role) {
        const errorMessage = 'Données manquantes pour la création de l\'utilisateur';
        logWithTimestamp('error', errorMessage, userData);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const startTime = performance.now();
      const response = await apiService.post('/users', userData);
      const endTime = performance.now();
      
      logWithTimestamp('info', `Création utilisateur terminée en ${(endTime - startTime).toFixed(2)}ms`);
      logWithTimestamp('debug', 'Réponse création utilisateur', {
        success: response.success,
        userId: response.data?.id
      });

      if (response.success) {
        logWithTimestamp('info', `Utilisateur créé avec succès: ${response.data?.email}`);
        
        // Rafraîchir la liste des utilisateurs
        await fetchUsers();
        
        return {
          user: response.data,
          success: true,
          message: 'Utilisateur créé avec succès'
        };
      } else {
        const errorMessage = response.message || 'Erreur lors de la création de l\'utilisateur';
        logWithTimestamp('error', 'Échec de la création de l\'utilisateur', response);
        setError(errorMessage);
        
        return {
          user: null,
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la création de l\'utilisateur';
      logWithTimestamp('error', 'Exception lors de la création de l\'utilisateur', {
        message: error.message,
        stack: error.stack,
        userData: { ...userData, password: '[MASQUÉ]' }
      });
      
      setError(errorMessage);
      return {
        user: null,
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [apiService, fetchUsers]);

  /**
   * Mettre à jour un utilisateur
   * Endpoint: PUT /users/:id
   */
  const updateUser = useCallback(async (userId, updateData) => {
    logWithTimestamp('info', `Mise à jour de l'utilisateur ID: ${userId}`, updateData);
    
    setLoading(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      const response = await apiService.put(`/users/${userId}`, updateData);
      const endTime = performance.now();
      
      logWithTimestamp('info', `Mise à jour utilisateur terminée en ${(endTime - startTime).toFixed(2)}ms`);
      logWithTimestamp('debug', 'Réponse mise à jour utilisateur', {
        success: response.success,
        userId: userId
      });

      if (response.success) {
        logWithTimestamp('info', `Utilisateur ${userId} mis à jour avec succès`);
        
        // Mettre à jour la liste locale
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, ...response.data } : user
          )
        );
        
        return {
          user: response.data,
          success: true,
          message: 'Utilisateur mis à jour avec succès'
        };
      } else {
        const errorMessage = response.message || 'Erreur lors de la mise à jour de l\'utilisateur';
        logWithTimestamp('error', `Échec de la mise à jour de l'utilisateur ${userId}`, response);
        setError(errorMessage);
        
        return {
          user: null,
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la mise à jour de l\'utilisateur';
      logWithTimestamp('error', `Exception lors de la mise à jour de l'utilisateur ${userId}`, {
        message: error.message,
        stack: error.stack,
        updateData
      });
      
      setError(errorMessage);
      return {
        user: null,
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  /**
   * Supprimer un utilisateur
   * Endpoint: DELETE /users/:id
   */
  const deleteUser = useCallback(async (userId) => {
    logWithTimestamp('info', `Suppression de l'utilisateur ID: ${userId}`);
    
    setLoading(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      const response = await apiService.delete(`/users/${userId}`);
      const endTime = performance.now();
      
      logWithTimestamp('info', `Suppression utilisateur terminée en ${(endTime - startTime).toFixed(2)}ms`);
      logWithTimestamp('debug', 'Réponse suppression utilisateur', {
        success: response.success,
        userId: userId
      });

      if (response.success) {
        logWithTimestamp('info', `Utilisateur ${userId} supprimé avec succès`);
        
        // Retirer de la liste locale
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        
        return {
          success: true,
          message: 'Utilisateur supprimé avec succès'
        };
      } else {
        const errorMessage = response.message || 'Erreur lors de la suppression de l\'utilisateur';
        logWithTimestamp('error', `Échec de la suppression de l'utilisateur ${userId}`, response);
        setError(errorMessage);
        
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la suppression de l\'utilisateur';
      logWithTimestamp('error', `Exception lors de la suppression de l'utilisateur ${userId}`, {
        message: error.message,
        stack: error.stack
      });
      
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  /**
   * Calculer les statistiques des utilisateurs côté client
   * Puisque l'endpoint /users/stats n'existe pas, on calcule à partir des données existantes
   */
  const getUsersStats = useCallback(async () => {
    logWithTimestamp('info', 'Calcul des statistiques utilisateurs côté client');
    
    try {
      // Si on n'a pas encore de données utilisateurs, les récupérer d'abord
      let usersData = users;
      if (usersData.length === 0) {
        logWithTimestamp('info', 'Récupération des utilisateurs pour calculer les statistiques');
        const result = await fetchUsers({ limit: 1000 }); // Récupérer tous les utilisateurs
        if (result.success) {
          usersData = result.users;
        } else {
          throw new Error('Impossible de récupérer les données utilisateurs');
        }
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      // Convertir les timestamps Firebase si nécessaire
      const convertFirebaseTimestamp = (timestamp) => {
        if (!timestamp) return null;
        if (typeof timestamp === 'string') return new Date(timestamp);
        if (timestamp._seconds) {
          return new Date(timestamp._seconds * 1000);
        }
        return new Date(timestamp);
      };

      const stats = {
        total: usersData.length,
        active: usersData.filter(user => user.isActive).length,
        inactive: usersData.filter(user => !user.isActive).length,
        recentRegistrations: usersData.filter(user => {
          const createdDate = convertFirebaseTimestamp(user.createdAt);
          return createdDate && createdDate >= thirtyDaysAgo;
        }).length,
        byRole: usersData.reduce((acc, user) => {
          const role = user.role || 'user';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {}),
        recentLogins: usersData.filter(user => {
          const lastLogin = convertFirebaseTimestamp(user.lastLogin);
          return lastLogin && lastLogin >= thirtyDaysAgo;
        }).length
      };

      logWithTimestamp('info', 'Statistiques calculées avec succès', stats);
      
      return {
        stats,
        success: true
      };
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors du calcul des statistiques';
      logWithTimestamp('error', 'Exception lors du calcul des statistiques', {
        message: error.message,
        stack: error.stack
      });
      
      return {
        stats: null,
        success: false,
        error: errorMessage
      };
    }
  }, [users, fetchUsers]);

  /**
   * Recherche d'utilisateurs avec debouncing
   */
  const searchUsers = useCallback(async (searchTerm, filters = {}) => {
    logWithTimestamp('info', `Recherche d'utilisateurs: "${searchTerm}"`, filters);
    
    return await fetchUsers({
      ...filters,
      search: searchTerm,
      page: 1 // Reset à la première page pour une nouvelle recherche
    });
  }, [fetchUsers]);

  /**
   * Changer de page
   */
  const changePage = useCallback(async (newPage) => {
    logWithTimestamp('info', `Changement de page: ${pagination.page} -> ${newPage}`);
    
    return await fetchUsers({
      page: newPage,
      limit: pagination.limit
    });
  }, [fetchUsers, pagination.page, pagination.limit]);

  /**
   * Réinitialiser les erreurs
   */
  const clearError = useCallback(() => {
    logWithTimestamp('info', 'Réinitialisation des erreurs');
    setError(null);
  }, []);

  /**
   * Réinitialiser l'état complet
   */
  const resetState = useCallback(() => {
    logWithTimestamp('info', 'Réinitialisation complète de l\'état');
    setUsers([]);
    setError(null);
    setLoading(false);
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    });
  }, []);

  /**
   * Récupérer TOUS les utilisateurs sans pagination ni filtres
   * Endpoint: GET /users/all (sans paramètres)
   */
  const getAllUsers = useCallback(async () => {
    logWithTimestamp('info', 'Récupération de TOUS les utilisateurs sans pagination');
    
    setLoading(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      
      // Vérifier l'authentification
      const token = localStorage.getItem('authToken');
      console.log('[DEBUG] Token d\'authentification présent:', !!token);
      console.log('[DEBUG] Token (premiers caractères):', token ? token.substring(0, 20) + '...' : 'AUCUN');
      
      // Construire l'URL selon la documentation
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '100', // Limite élevée pour récupérer tous les utilisateurs
        isActive: 'all',
        role: 'all',
        dateRange: 'all'
      });
      
      const endpoint = `/users/all?${queryParams}`;
      console.log('[DEBUG] Endpoint complet:', endpoint);
      
      const response = await apiService.get(endpoint);
      const endTime = performance.now();
      
      console.log('[DEBUG] Réponse brute de /users/all:', response);
      console.log('[DEBUG] Type de réponse:', typeof response);
      console.log('[DEBUG] Clés de la réponse:', Object.keys(response || {}));
      
      logWithTimestamp('info', `Tous les utilisateurs récupérés en ${(endTime - startTime).toFixed(2)}ms`);
      
      // Structure selon la documentation : { success, data, count, total, page, totalPages }
      if (response.success) {
        const userData = response.data || [];
        
        console.log('[DEBUG] Données utilisateur extraites:', userData);
        console.log('[DEBUG] Nombre d\'utilisateurs:', userData?.length || 0);
        console.log('[DEBUG] Pagination selon doc:', {
          count: response.count,
          total: response.total,
          page: response.page,
          totalPages: response.totalPages
        });
        
        // Si aucun utilisateur mais réponse réussie
        if (userData.length === 0) {
          console.log('[DEBUG] AUCUN UTILISATEUR RETOURNÉ - Vérifiez les permissions ou les filtres côté serveur');
        }

        // Convertir les timestamps Firebase en dates JavaScript
        const convertFirebaseTimestamp = (timestamp) => {
          if (!timestamp) return null;
          if (typeof timestamp === 'string') return timestamp;
          if (timestamp._seconds) {
            return new Date(timestamp._seconds * 1000).toISOString();
          }
          return timestamp;
        };

        // Normaliser les données utilisateur selon la documentation
        const normalizedUsers = (userData || []).map(user => ({
          ...user,
          // Garder les champs de la doc : nom, prenom, email, telephone, role, isActive
          nom: user.nom || user.lastName || user.profile?.lastName || '',
          prenom: user.prenom || user.firstName || user.profile?.firstName || '',
          email: user.email || '',
          telephone: user.telephone || user.phone || user.profile?.phone || '',
          role: user.role || 'user',
          isActive: user.isActive !== undefined ? user.isActive : true,
          // Timestamps
          createdAt: convertFirebaseTimestamp(user.createdAt) || new Date().toISOString(),
          updatedAt: convertFirebaseTimestamp(user.updatedAt) || new Date().toISOString(),
          lastLogin: convertFirebaseTimestamp(user.lastLogin),
          // Garder les autres champs existants
          displayName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
          loginHistory: user.loginHistory?.map(entry => ({
            ...entry,
            timestamp: convertFirebaseTimestamp(entry.timestamp)
          })) || []
        }));
        
        logWithTimestamp('info', `${normalizedUsers.length} utilisateurs récupérés avec succès (tous)`);
        
        // Mettre à jour le state avec la structure de pagination de la doc
        setUsers(normalizedUsers);
        setPagination({
          page: response.page || 1,
          limit: response.count || normalizedUsers.length,
          total: response.total || normalizedUsers.length,
          pages: response.totalPages || 1
        });
        
        return {
          users: normalizedUsers,
          total: normalizedUsers.length,
          success: true
        };
      } else {
        const errorMessage = response?.error || 'Erreur lors de la récupération de tous les utilisateurs';
        logWithTimestamp('error', 'Échec de la récupération de tous les utilisateurs', response);
        setError(errorMessage);
        
        return {
          users: [],
          total: 0,
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la récupération de tous les utilisateurs';
      logWithTimestamp('error', 'Exception lors de la récupération de tous les utilisateurs', {
        message: error.message,
        stack: error.stack
      });
      
      console.log('[DEBUG] ERREUR COMPLÈTE:', error);
      
      setError(errorMessage);
      return {
        users: [],
        total: 0,
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  // Log de l'état actuel pour le debugging
  logWithTimestamp('debug', 'État actuel du hook useUsers', {
    usersCount: users.length,
    loading,
    error: error ? error.substring(0, 100) : null,
    pagination
  });

  return {
    // État
    users,
    loading,
    error,
    pagination,
    
    // Actions
    fetchUsers,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUsersStats,
    searchUsers,
    changePage,
    clearError,
    resetState
  };
};

export default useUsers;
