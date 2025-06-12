import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL de base de l'API
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Fonction pour faire des requêtes API
  const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de requête');
    }

    return data;
  };

  // Connexion avec email et mot de passe
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success) {
        // Stocker le token JWT
        localStorage.setItem('authToken', response.token);
        
        // Stocker les données utilisateur
        setUser(response.user);
        
        return response.user;
      } else {
        throw new Error(response.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec Google (Firebase) - pour compatibilité
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Importer Firebase Auth dynamiquement
      const { auth, googleProvider } = await import('../firebase/config');
      const { signInWithPopup } = await import('firebase/auth');
      
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Envoyer le token Firebase au backend pour vérification
      const response = await apiRequest('/auth/firebase-login', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });

      if (response.success) {
        localStorage.setItem('authToken', response.token || idToken);
        setUser(response.user);
        return response.user;
      } else {
        throw new Error(response.message || 'Erreur de connexion Google');
      }
    } catch (error) {
      console.error('Erreur de connexion Google:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      setLoading(true);
      
      // Appeler l'API de déconnexion si un token existe
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          await apiRequest('/auth/logout', {
            method: 'POST',
          });
        } catch (error) {
          console.warn('Erreur lors de la déconnexion côté serveur:', error);
        }
      }
      
      // Nettoyer le stockage local
      localStorage.removeItem('authToken');
      setUser(null);
      setError(null);
      
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier le token au chargement
  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiRequest('/auth/verify-token');
      
      if (response.success) {
        setUser(response.user);
      } else {
        // Token invalide, nettoyer
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer le profil utilisateur
  const getProfile = async () => {
    try {
      const response = await apiRequest('/auth/profile');
      
      if (response.success) {
        setUser(response.user);
        return response.user;
      }
    } catch (error) {
      console.error('Erreur de récupération du profil:', error);
      throw error;
    }
  };

  // Changer le mot de passe
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Erreur de changement de mot de passe:', error);
      throw error;
    }
  };

  // Créer un administrateur (pour les super admins)
  const createAdmin = async (adminData) => {
    try {
      const response = await apiRequest('/auth/create-admin', {
        method: 'POST',
        body: JSON.stringify(adminData),
      });

      if (response.success) {
        return response.user;
      } else {
        throw new Error(response.message || 'Erreur lors de la création de l\'administrateur');
      }
    } catch (error) {
      console.error('Erreur de création d\'administrateur:', error);
      throw error;
    }
  };

  // Vérifier les permissions
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  // Vérifier le rôle
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = () => {
    if (!user) return false;
    const adminRoles = ['super_admin', 'admin', 'sector_manager', 'structure_manager', 'moderator', 'analyst'];
    return adminRoles.includes(user.role);
  };

  // Effet pour vérifier le token au chargement
  useEffect(() => {
    verifyToken();
  }, []);

  const value = {
    user,
    loading,
    error,
    setError,
    login,
    loginWithGoogle,
    logout,
    verifyToken,
    getProfile,
    changePassword,
    createAdmin,
    hasPermission,
    hasRole,
    isAdmin,
    apiRequest, // Exposer pour d'autres composants
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 