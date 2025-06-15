# 🔐 GUIDE AUTHENTIFICATION FRONTEND - NIAXTU

## 🎯 **SYSTÈME DE TOKENS ET PERMISSIONS**

Le backend Niaxtu utilise un système d'authentification avancé basé sur les rôles et permissions. Voici comment l'intégrer côté frontend.

## 📋 **TYPES DE TOKENS SUPPORTÉS**

### **1. Tokens JWT (Recommandé)**
- Générés lors de la connexion via `/api/auth/login`
- Contiennent les informations utilisateur et permissions
- Durée de vie configurable (défaut: 24h)

### **2. Tokens Firebase**
- Pour l'authentification Firebase
- Gérés automatiquement par Firebase SDK

### **3. Tokens de Test**
- Pour le développement et les tests
- Générés via `/api/test-token`

## 🔑 **HIÉRARCHIE DES RÔLES**

```javascript
const ROLES = {
  SUPER_ADMIN: 'super_admin',     // Accès total sans exception
  ADMIN: 'admin',                 // Administration générale
  SECTOR_MANAGER: 'sector_manager', // Gestion de secteur
  STRUCTURE_MANAGER: 'structure_manager', // Gestion de structure
  MODERATOR: 'moderator',         // Modération
  ANALYST: 'analyst',             // Analyse de données
  USER: 'user'                    // Utilisateur standard
};

// IMPORTANT: Le SUPER_ADMIN a TOUJOURS accès à TOUT
```

## 🚀 **IMPLÉMENTATION FRONTEND**

### **1. Service d'Authentification**

```javascript
// services/authService.js
class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // Connexion
  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      if (data.success) {
        // Stocker le token et les informations utilisateur
        this.token = data.token;
        this.user = data.user;
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Connexion réussie:', {
          email: data.user.email,
          role: data.user.role,
          permissions: data.user.permissions?.length || 0
        });
        
        return { success: true, user: data.user };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  // Déconnexion
  async logout() {
    try {
      if (this.token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le stockage local
      this.token = null;
      this.user = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!(this.token && this.user);
  }

  // Obtenir le token
  getToken() {
    return this.token;
  }

  // Obtenir l'utilisateur
  getUser() {
    return this.user;
  }

  // Vérifier les permissions
  hasPermission(permission) {
    if (!this.user) return false;
    
    // SUPER ADMIN a TOUJOURS toutes les permissions
    if (this.user.role === 'super_admin') {
      console.log('Super admin détecté - permission accordée automatiquement');
      return true;
    }
    
    return this.user.permissions?.includes(permission) || false;
  }

  // Vérifier le rôle
  hasRole(role) {
    return this.user?.role === role;
  }

  // Vérifier si super admin
  isSuperAdmin() {
    return this.user?.role === 'super_admin';
  }
}

export const authService = new AuthService();
```

### **2. Service API avec Gestion des Erreurs**

```javascript
// services/apiService.js
import { authService } from './authService.js';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '/api';
  }

  // Requête API générique
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = authService.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
      const response = await fetch(url, config);
      const data = await response.json();

      // Gestion des erreurs d'authentification
      if (response.status === 401) {
        console.error('[API] Token invalide ou expiré');
        
        // Rediriger vers la page de connexion
        authService.logout();
        window.location.href = '/login';
        
        throw new Error(data.message || 'Session expirée. Veuillez vous reconnecter.');
      }

      // Gestion des erreurs de permissions
      if (response.status === 403) {
        console.error('[API] Accès refusé:', data);
        
        const errorMessage = data.message || 'Vous n\'avez pas accès à cette ressource';
        
        // Afficher une notification d'erreur
        this.showPermissionError(errorMessage, data);
        
        throw new Error(errorMessage);
      }

      // Autres erreurs
      if (!response.ok) {
        console.error(`[API] Erreur ${response.status}:`, data);
        throw new Error(data.message || `Erreur ${response.status}`);
      }

      console.log(`[API] Réponse ${response.status}:`, data);
      return data;

    } catch (error) {
      console.error(`[API] Exception sur ${endpoint}:`, error);
      throw error;
    }
  }

  // Afficher une erreur de permission
  showPermissionError(message, errorData) {
    // Personnaliser selon votre système de notifications
    console.error('🚫 ACCÈS REFUSÉ:', message);
    
    // Exemple avec une notification toast
    if (window.showToast) {
      window.showToast({
        type: 'error',
        title: 'Accès refusé',
        message: message,
        duration: 5000
      });
    }
    
    // Ou avec un alert simple
    alert(`⚠️ Accès refusé\n\n${message}`);
  }

  // Méthodes HTTP
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
```

### **3. Hook React pour l'Authentification**

```javascript
// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/authService.js';

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
          const response = await apiService.get('/auth/verify');
          if (response.success) {
            setUser(response.user);
          } else {
            throw new Error('Token invalide');
          }
        } catch (error) {
          console.error('Token invalide:', error);
          authService.logout();
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

  const hasPermission = (permission) => {
    return authService.hasPermission(permission);
  };

  const hasRole = (role) => {
    return authService.hasRole(role);
  };

  const isSuperAdmin = () => {
    return authService.isSuperAdmin();
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
    isSuperAdmin,
    isAuthenticated: authService.isAuthenticated()
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
```

### **4. Composant de Protection des Routes**

```javascript
// components/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ 
  children, 
  permission, 
  role, 
  fallback = <div>Vous n'avez pas accès à cette page</div> 
}) => {
  const { user, isAuthenticated, hasPermission, hasRole, isSuperAdmin } = useAuth();

  // Vérifier l'authentification
  if (!isAuthenticated) {
    return <div>Veuillez vous connecter</div>;
  }

  // SUPER ADMIN a accès à tout
  if (isSuperAdmin()) {
    return children;
  }

  // Vérifier la permission spécifique
  if (permission && !hasPermission(permission)) {
    console.log(`Accès refusé - Permission manquante: ${permission}`);
    return fallback;
  }

  // Vérifier le rôle spécifique
  if (role && !hasRole(role)) {
    console.log(`Accès refusé - Rôle manquant: ${role}`);
    return fallback;
  }

  return children;
};

export default ProtectedRoute;
```

### **5. Utilisation dans les Composants**

```javascript
// components/UsersList.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../services/apiService';
import ProtectedRoute from './ProtectedRoute';

const UsersList = () => {
  const { hasPermission, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: 1,
        limit: 20,
        ...filters
      };
      
      const response = await apiService.get('/users/all', params);
      
      if (response.success) {
        setUsers(response.data);
        console.log(`${response.data.length} utilisateurs chargés`);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setError(error.message);
      
      // Gérer les erreurs spécifiques
      if (error.message.includes('accès')) {
        setError('Vous n\'avez pas les droits pour voir les utilisateurs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error">❌ {error}</div>;

  return (
    <div>
      <h2>Liste des Utilisateurs</h2>
      
      {/* Affichage conditionnel selon les permissions */}
      {isSuperAdmin() && (
        <div className="admin-badge">
          🔐 Mode Super Administrateur - Accès total
        </div>
      )}
      
      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <h3>{user.prenom} {user.nom}</h3>
            <p>Email: {user.email}</p>
            <p>Rôle: {user.role}</p>
            <p>Statut: {user.isActive ? '✅ Actif' : '❌ Inactif'}</p>
            
            {/* Actions conditionnelles */}
            {hasPermission('edit_users') && (
              <button onClick={() => editUser(user.id)}>
                Modifier
              </button>
            )}
            
            {hasPermission('delete_users') && (
              <button onClick={() => deleteUser(user.id)}>
                Supprimer
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Export avec protection
export default () => (
  <ProtectedRoute 
    permission="view_users"
    fallback={
      <div className="access-denied">
        🚫 Vous n'avez pas accès à la liste des utilisateurs
      </div>
    }
  >
    <UsersList />
  </ProtectedRoute>
);
```

## ⚠️ **GESTION DES ERREURS**

### **Messages d'Erreur Standard**

```javascript
const ERROR_MESSAGES = {
  NO_TOKEN: 'Veuillez vous connecter pour accéder à cette ressource',
  INVALID_TOKEN: 'Votre session a expiré. Veuillez vous reconnecter.',
  INSUFFICIENT_PERMISSIONS: 'Vous n\'avez pas accès à cette ressource',
  ACCOUNT_DISABLED: 'Votre compte a été désactivé. Contactez l\'administrateur.',
  SERVER_ERROR: 'Une erreur est survenue. Veuillez réessayer.'
};
```

### **Codes d'Erreur à Gérer**

- **401** : Token manquant/invalide → Redirection login
- **403** : Permissions insuffisantes → Message d'erreur
- **500** : Erreur serveur → Retry ou message d'erreur

## 🔧 **BONNES PRATIQUES**

### **1. Stockage Sécurisé**
```javascript
// Utiliser localStorage pour la persistance
// Vérifier l'expiration du token
// Ne pas stocker d'informations sensibles
```

### **2. Vérification Continue**
```javascript
// Vérifier le token à chaque requête API
// Revalider les permissions périodiquement
// Gérer la déconnexion automatique
```

### **3. Interface Utilisateur**
```javascript
// Masquer les éléments non autorisés
// Afficher des messages d'erreur clairs
// Indicateurs de statut utilisateur
```

## 🎭 **EXEMPLE COMPLET D'UTILISATION**

```javascript
// App.js
import React from 'react';
import { AuthProvider } from './hooks/useAuth';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import UsersList from './components/UsersList';
import Login from './components/Login';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute permission="view_users">
                <UsersList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

## 🚀 **RÉSUMÉ**

1. **Authentifiez-vous** via `/api/auth/login`
2. **Stockez le token** dans localStorage
3. **Envoyez le token** dans le header `Authorization: Bearer TOKEN`
4. **Gérez les erreurs** 401 (reconnexion) et 403 (accès refusé)
5. **Le SUPER_ADMIN** a accès à TOUT sans exception
6. **Vérifiez les permissions** avant d'afficher les éléments UI
7. **Affichez des messages clairs** en cas d'accès refusé

Ce système vous permet de créer une interface utilisateur sécurisée avec des permissions granulaires ! 🔐 