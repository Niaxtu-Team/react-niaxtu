# 📚 DOCUMENTATION ENDPOINT `/api/users/all`

## 🎯 **VUE D'ENSEMBLE**

L'endpoint `GET /api/users/all` permet de récupérer une liste paginée et filtrée des utilisateurs du système Niaxtu.

### **URL de base**
```
GET /api/users/all
```

### **Authentification requise**
```javascript
Headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

## 📋 **PARAMÈTRES DE REQUÊTE**

### **Paramètres supportés**

| Paramètre | Type | Obligatoire | Valeur par défaut | Description |
|-----------|------|-------------|-------------------|-------------|
| `page` | number | Non | 1 | Numéro de page pour la pagination |
| `limit` | number | Non | 10 | Nombre d'utilisateurs par page |
| `search` | string | Non | - | Recherche textuelle (nom, email, etc.) |
| `isActive` | string | Non | 'all' | Statut d'activation : 'all', 'true', 'false' |
| `role` | string | Non | 'all' | Rôle utilisateur : 'all', 'admin', 'user', 'moderator' |
| `dateRange` | string | Non | 'all' | Période de création : 'all', '7d', '30d', '90d', '1y' |

### **Détails des paramètres**

#### **`page` (Pagination)**
- **Type** : Entier positif
- **Minimum** : 1
- **Exemple** : `page=1`, `page=5`

#### **`limit` (Limite par page)**
- **Type** : Entier positif
- **Minimum** : 1
- **Maximum** : 100
- **Défaut** : 10
- **Exemple** : `limit=20`, `limit=50`

#### **`search` (Recherche textuelle)**
- **Type** : Chaîne de caractères
- **Recherche dans** : nom, prénom, email, téléphone
- **Insensible à la casse** : Oui
- **Exemple** : `search=jean`, `search=admin@niaxtu.com`

#### **`isActive` (Statut d'activation)**
- **Valeurs acceptées** :
  - `'all'` : Tous les utilisateurs (actifs et inactifs)
  - `'true'` : Utilisateurs actifs uniquement
  - `'false'` : Utilisateurs inactifs uniquement

#### **`role` (Rôle utilisateur)**
- **Valeurs acceptées** :
  - `'all'` : Tous les rôles
  - `'admin'` : Administrateurs
  - `'user'` : Utilisateurs standards
  - `'moderator'` : Modérateurs
  - `'guest'` : Invités

#### **`dateRange` (Période de création)**
- **Valeurs acceptées** :
  - `'all'` : Toutes les dates
  - `'7d'` : Derniers 7 jours
  - `'30d'` : Derniers 30 jours
  - `'90d'` : Derniers 90 jours
  - `'1y'` : Dernière année

## 📤 **FORMAT DE RÉPONSE**

### **Structure de la réponse**
```javascript
{
  "success": true,
  "data": [
    {
      "id": "user_id_123",
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@email.com",
      "telephone": "+33123456789",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:22:00Z",
      "lastLogin": "2024-01-20T09:15:00Z"
    }
    // ... autres utilisateurs
  ],
  "count": 10,     // Nombre d'utilisateurs dans cette page
  "total": 157,    // Nombre total d'utilisateurs (avec filtres)
  "page": 1,       // Page actuelle
  "totalPages": 16 // Nombre total de pages
}
```

### **Réponse en cas d'erreur**
```javascript
{
  "success": false,
  "error": "Message d'erreur",
  "code": 400
}
```

## 🔧 **EXEMPLES D'UTILISATION**

### **1. Récupération simple (première page)**
```javascript
// URL
GET /api/users/all

// Réponse
{
  "success": true,
  "data": [...], // 10 premiers utilisateurs
  "count": 10,
  "total": 157,
  "page": 1,
  "totalPages": 16
}
```

### **2. Pagination**
```javascript
// URL - Page 3 avec 20 utilisateurs par page
GET /api/users/all?page=3&limit=20

// Réponse
{
  "success": true,
  "data": [...], // Utilisateurs 41-60
  "count": 20,
  "total": 157,
  "page": 3,
  "totalPages": 8
}
```

### **3. Recherche textuelle**
```javascript
// URL - Rechercher "martin"
GET /api/users/all?search=martin

// Réponse
{
  "success": true,
  "data": [
    {
      "id": "user_456",
      "nom": "Martin",
      "prenom": "Pierre",
      "email": "pierre.martin@email.com",
      // ...
    },
    {
      "id": "user_789",
      "nom": "Dupont",
      "prenom": "Martine",
      "email": "martine.dupont@email.com",
      // ...
    }
  ],
  "count": 2,
  "total": 2
}
```

### **4. Filtrage par statut**
```javascript
// URL - Utilisateurs actifs uniquement
GET /api/users/all?isActive=true

// URL - Utilisateurs inactifs uniquement
GET /api/users/all?isActive=false
```

### **5. Filtrage par rôle**
```javascript
// URL - Administrateurs uniquement
GET /api/users/all?role=admin

// URL - Utilisateurs standards
GET /api/users/all?role=user
```

### **6. Filtrage par date de création**
```javascript
// URL - Utilisateurs créés dans les 7 derniers jours
GET /api/users/all?dateRange=7d

// URL - Utilisateurs créés dans les 30 derniers jours
GET /api/users/all?dateRange=30d
```

### **7. Combinaison de filtres**
```javascript
// URL - Recherche complexe
GET /api/users/all?search=jean&isActive=true&role=admin&dateRange=30d&page=1&limit=5

// Réponse : Administrateurs actifs nommés "jean" créés dans les 30 derniers jours
```

## 💻 **EXEMPLES DE CODE**

### **JavaScript/Fetch**
```javascript
const fetchUsers = async (filters = {}) => {
  const params = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 10,
    ...(filters.search && { search: filters.search }),
    ...(filters.isActive && filters.isActive !== 'all' && { isActive: filters.isActive }),
    ...(filters.role && filters.role !== 'all' && { role: filters.role }),
    ...(filters.dateRange && filters.dateRange !== 'all' && { dateRange: filters.dateRange })
  });

  const response = await fetch(`/api/users/all?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  return response.json();
};

// Utilisation
try {
  const result = await fetchUsers({
    page: 1,
    limit: 20,
    search: 'martin',
    isActive: 'true',
    role: 'admin',
    dateRange: '30d'
  });
  
  console.log('Utilisateurs:', result.data);
  console.log('Total:', result.total);
} catch (error) {
  console.error('Erreur:', error.message);
}
```

### **React Hook personnalisé**
```javascript
import { useState, useEffect } from 'react';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchUsers = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: filters.page || pagination.page,
        limit: filters.limit || pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.isActive && filters.isActive !== 'all' && { isActive: filters.isActive }),
        ...(filters.role && filters.role !== 'all' && { role: filters.role }),
        ...(filters.dateRange && filters.dateRange !== 'all' && { dateRange: filters.dateRange })
      });

      const response = await fetch(`/api/users/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        setPagination({
          page: data.page,
          limit: filters.limit || pagination.limit,
          total: data.total,
          totalPages: data.totalPages
        });
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers
  };
};

// Utilisation dans un composant
const UsersList = () => {
  const { users, loading, error, pagination, fetchUsers } = useUsers();
  const [filters, setFilters] = useState({
    search: '',
    isActive: 'all',
    role: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    fetchUsers(filters);
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    fetchUsers({ ...filters, page: newPage });
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      {/* Filtres */}
      <div>
        <input
          type="text"
          placeholder="Rechercher..."
          value={filters.search}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
        />
        
        <select
          value={filters.isActive}
          onChange={(e) => handleFilterChange({ isActive: e.target.value })}
        >
          <option value="all">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>

        <select
          value={filters.role}
          onChange={(e) => handleFilterChange({ role: e.target.value })}
        >
          <option value="all">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="moderator">Modérateur</option>
        </select>

        <select
          value={filters.dateRange}
          onChange={(e) => handleFilterChange({ dateRange: e.target.value })}
        >
          <option value="all">Toutes les dates</option>
          <option value="7d">7 derniers jours</option>
          <option value="30d">30 derniers jours</option>
          <option value="90d">90 derniers jours</option>
          <option value="1y">1 an</option>
        </select>
      </div>

      {/* Liste des utilisateurs */}
      <div>
        {users.map(user => (
          <div key={user.id}>
            <h3>{user.prenom} {user.nom}</h3>
            <p>Email: {user.email}</p>
            <p>Rôle: {user.role}</p>
            <p>Statut: {user.isActive ? 'Actif' : 'Inactif'}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div>
        <button
          disabled={pagination.page === 1}
          onClick={() => handlePageChange(pagination.page - 1)}
        >
          Précédent
        </button>
        
        <span>
          Page {pagination.page} sur {pagination.totalPages}
          ({pagination.total} utilisateurs)
        </span>
        
        <button
          disabled={pagination.page === pagination.totalPages}
          onClick={() => handlePageChange(pagination.page + 1)}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};
```

## ⚠️ **GESTION D'ERREURS**

### **Codes d'erreur courants**

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Paramètres invalides | Vérifier les paramètres de requête |
| 401 | Token manquant/invalide | Vérifier l'authentification |
| 403 | Permissions insuffisantes | Vérifier les droits utilisateur |
| 404 | Endpoint non trouvé | Vérifier l'URL |
| 500 | Erreur serveur | Réessayer ou contacter l'admin |

### **Exemple de gestion d'erreur**
```javascript
const handleApiError = (error, response) => {
  switch (response.status) {
    case 400:
      console.error('Paramètres invalides:', error);
      break;
    case 401:
      console.error('Non authentifié');
      // Rediriger vers login
      window.location.href = '/login';
      break;
    case 403:
      console.error('Permissions insuffisantes');
      break;
    case 500:
      console.error('Erreur serveur');
      break;
    default:
      console.error('Erreur inconnue:', error);
  }
};
```

## 🚀 **BONNES PRATIQUES**

### **Performance**
- Utilisez la pagination pour éviter de charger trop de données
- Implémentez le debouncing pour la recherche textuelle
- Mettez en cache les résultats quand possible

### **UX/UI**
- Affichez un indicateur de chargement pendant les requêtes
- Gérez les états vides (aucun résultat)
- Persistez les filtres dans l'URL pour la navigation

### **Sécurité**
- Toujours inclure le token d'authentification
- Validez les paramètres côté client avant l'envoi
- Gérez les erreurs d'authentification

Cette documentation complète vous permettra d'intégrer efficacement l'endpoint `/api/users/all` dans votre application frontend ! 🎯 