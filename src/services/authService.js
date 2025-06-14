// services/authService.js
class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    this.baseURL = 'http://localhost:3001/api';
  }

  // Connexion
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      // Vérifier si la réponse contient du JSON
      const contentType = response.headers.get('content-type');
      let data = {};
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error(`Erreur ${response.status}: Impossible de contacter le serveur`);
      }

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
        await fetch(`${this.baseURL}/auth/logout`, {
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

  // Mettre à jour les informations utilisateur
  updateUser(userData) {
    this.user = { ...this.user, ...userData };
    localStorage.setItem('user', JSON.stringify(this.user));
  }

  // Vérifier la validité du token
  async verifyToken() {
    if (!this.token) return false;

    // Pour éviter les déconnexions automatiques, on vérifie seulement 
    // si le token et l'utilisateur existent localement
    if (this.token && this.user) {
      return true;
    }
    
    return false;
  }
}

export const authService = new AuthService(); 
