// services/apiService.js
import { authService } from './authService.js';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
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
      
      // Vérifier si la réponse contient du JSON
      const contentType = response.headers.get('content-type');
      let data = {};
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Si pas de JSON, créer un objet d'erreur
        data = {
          success: false,
          message: `Erreur ${response.status}: ${response.statusText}`
        };
      }

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
    } else {
      // Ou avec un alert simple
      alert(`⚠️ Accès refusé\n\n${message}`);
    }
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

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Méthodes spécialisées pour les uploads
  async uploadFile(endpoint, formData) {
    const token = authService.getToken();
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
        // Ne pas définir Content-Type pour FormData
      },
      body: formData
    };

    try {
      console.log(`[API] UPLOAD ${endpoint}`);
      const response = await fetch(url, config);
      const data = await response.json();

      if (response.status === 401) {
        authService.logout();
        window.location.href = '/login';
        throw new Error('Session expirée');
      }

      if (response.status === 403) {
        this.showPermissionError(data.message || 'Accès refusé pour l\'upload');
        throw new Error(data.message);
      }

      if (!response.ok) {
        throw new Error(data.message || `Erreur upload ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`[API] Erreur upload ${endpoint}:`, error);
      throw error;
    }
  }

  // Méthode pour télécharger des fichiers
  async downloadFile(endpoint, filename) {
    const token = authService.getToken();
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (response.status === 401) {
        authService.logout();
        window.location.href = '/login';
        throw new Error('Session expirée');
      }

      if (response.status === 403) {
        throw new Error('Accès refusé pour le téléchargement');
      }

      if (!response.ok) {
        throw new Error(`Erreur téléchargement ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return true;
    } catch (error) {
      console.error(`[API] Erreur téléchargement ${endpoint}:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService(); 
