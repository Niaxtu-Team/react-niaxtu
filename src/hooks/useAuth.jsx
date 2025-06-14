import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import { apiService } from '../services/apiService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Vérifier le token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      if (authService.isAuthenticated()) {
        setLoading(true);
        try {
          const isValid = await authService.verifyToken();
          if (isValid) {
            setUser(authService.getUser());
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Erreur vérification token:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  // Inscription (réservée aux super admins)
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      if (!user || user.role !== 'super_admin') {
        throw new Error('Seuls les super administrateurs peuvent créer de nouveaux comptes');
      }

      const response = await apiService.post('/auth/register', userData);

      if (response.success) {
        return response.user;
      } else {
        throw new Error(response.message || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer le profil utilisateur
  const getUserProfile = async () => {
    try {
      const response = await apiService.get('/users/profile');
      if (response.success) {
        setUser(response.user);
        authService.updateUser(response.user);
        return response.user;
      }
    } catch (error) {
      console.error('Erreur profil:', error);
      throw error;
    }
  };

  // Mettre à jour le profil
  const updateProfile = async (updates) => {
    const response = await apiService.put('/users/profile', updates);
    
    if (response.success) {
      const updatedUser = { ...user, ...response.user };
      setUser(updatedUser);
      authService.updateUser(updatedUser);
      return response.user;
    }
  };

  const hasPermission = (permission) => {
    return authService.hasPermission(permission);
  };

  const hasRole = (role) => {
    if (Array.isArray(role)) {
      return role.includes(user?.role);
    }
    return authService.hasRole(role);
  };

  const isSuperAdmin = () => {
    return authService.isSuperAdmin();
  };

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = async () => {
    try {
      await getUserProfile();
    } catch (error) {
      console.error('Erreur rafraîchissement utilisateur:', error);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    getUserProfile,
    updateProfile,
    hasPermission,
    hasRole,
    isSuperAdmin,
    refreshUser,
    setError,
    isAuthenticated: authService.isAuthenticated(),
    // Exposer les services pour usage avancé
    authService,
    apiService
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
