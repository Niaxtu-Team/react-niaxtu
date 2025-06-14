# PROMPT POUR IA FRONTEND - PLATEFORME NIAXTU

## CONTEXTE DU PROJET
Tu es une IA frontend spécialisée dans le développement React. Tu dois créer une interface complète pour la plateforme **Niaxtu**, un système de gestion des plaintes administratives.

## BACKEND API DISPONIBLE
L'API backend Node.js/Express avec Firebase est déployée et documentée avec Swagger. Voici les endpoints principaux :

### 👥 GESTION UTILISATEURS
- **GET /users/all** - Liste paginée des utilisateurs avec filtres avancés
  - Paramètres : `page`, `limit=10`, `search`, `isActive`, `role`, `dateRange`
  - Réponse : `{data: [], count: number, total: number}`
- **GET /users/profile** - Profil utilisateur connecté
- **PUT /users/profile** - Mise à jour profil
- **DELETE /users/:id** - Suppression utilisateur

### 📋 SYSTÈME DE PLAINTES
- **GET /plaintes** - Liste des plaintes avec pagination/filtres
- **POST /plaintes** - Créer nouvelle plainte (avec géolocalisation)
- **GET /plaintes/:id** - Détails d'une plainte
- **PUT /plaintes/:id** - Modifier plainte
- **DELETE /plaintes/:id** - Supprimer plainte
- **PUT /plaintes/:id/status** - Changer statut plainte
- **GET /plaintes/statistics** - Statistiques des plaintes

### 🏢 DONNÉES STRUCTURELLES
- **GET /structures/ministeres** - Liste des ministères
- **GET /structures/directions** - Liste des directions
- **GET /structures/services** - Liste des services

### 🗂️ DONNÉES GÉNÉRIQUES
- **GET /data/:collection** - Lire collection Firestore
- **POST /data/:collection** - Créer document
- **PUT /data/:collection/:id** - Modifier document
- **DELETE /data/:collection/:id** - Supprimer document

## SPÉCIFICATIONS TECHNIQUES

### AUTHENTIFICATION
- Utiliser **Bearer Token** dans header Authorization
- Stocker token dans localStorage/sessionStorage
- Gérer expiration et refresh automatique
- Redirection vers login si non authentifié

### INTERFACE UTILISATEUR REQUISE

#### 1. **PAGE CONNEXION/INSCRIPTION**
- Formulaires responsive avec validation
- Gestion erreurs (email invalide, mot de passe faible)
- Design moderne avec animations CSS

#### 2. **DASHBOARD PRINCIPAL**
- Statistiques en temps réel (cartes métriques)
- Graphiques des plaintes par période
- Alertes et notifications
- Navigation sidebar/topbar

#### 3. **GESTION UTILISATEURS** (Déjà développé - référence)
```jsx
// Fonctionnalités requises :
- Tableau paginé avec filtres avancés
- Recherche textuelle en temps réel
- Filtres : isActive, role, dateRange
- Actions : voir, modifier, supprimer
- Design responsive mobile-first
```

#### 4. **GESTION PLAINTES**
- **Liste des plaintes** : tableau avec colonnes (titre, statut, date, localisation)
- **Création plainte** : formulaire multi-étapes avec géolocalisation
- **Détails plainte** : vue détaillée avec historique des modifications
- **Carte interactive** : affichage géographique des plaintes

#### 5. **PAGES ADMINISTRATION**
- Gestion des ministères/directions/services
- Configuration système
- Logs et audit trail

### STANDARDS DE DÉVELOPPEMENT

#### TECHNOLOGIES RECOMMANDÉES
```javascript
// Frontend Stack
- React 18+ avec hooks
- React Router v6 pour navigation
- Axios pour requêtes HTTP
- CSS Modules ou Styled Components
- Context API pour state management
- React Hook Form pour formulaires

// UI/UX
- Design System cohérent
- Responsive mobile-first
- Animations CSS fluides
- Accessibilité WCAG 2.1
- Dark/Light mode
```

#### STRUCTURE DE PROJET
```
src/
├── components/
│   ├── common/         # Composants réutilisables
│   ├── forms/          # Formulaires
│   ├── layout/         # Layout components
│   └── ui/             # UI primitives
├── pages/              # Pages principales
├── hooks/              # Custom hooks
├── services/           # API calls
├── utils/              # Utilitaires
├── context/            # Context providers
└── styles/             # CSS globaux
```

#### EXEMPLE D'IMPLÉMENTATION
```jsx
// Service API
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

// Hook personnalisé
const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1, limit: 10, total: 0
  });
  
  const fetchUsers = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      
      const data = await apiRequest(`/users/all?${params}`);
      setUsers(data.data);
      setPagination(prev => ({ ...prev, total: data.total }));
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { users, loading, pagination, fetchUsers };
};
```

## PRIORITÉS DE DÉVELOPPEMENT

### PHASE 1 - FONDATIONS (Priorité haute)
1. Configuration projet React
2. Système d'authentification complet
3. Layout principal avec navigation
4. Service API centralisé

### PHASE 2 - CORE FEATURES (Priorité haute)
1. Dashboard avec statistiques
2. Gestion des plaintes (CRUD complet)
3. Interface utilisateurs (adaptation du code existant)
4. Système de notifications

### PHASE 3 - FONCTIONNALITÉS AVANCÉES (Priorité moyenne)
1. Carte interactive des plaintes
2. Système de rapports/exports
3. Configuration administration
4. Optimisations performances

### PHASE 4 - AMÉLIORATION UX (Priorité basse)
1. Mode sombre
2. Animations avancées
3. PWA (Progressive Web App)
4. Internationalisation

## CONSIGNES SPÉCIALES

### GESTION D'ERREURS
- Toujours wrapper les appels API dans try/catch
- Afficher messages d'erreur contextuels
- Gérer les cas de perte de connexion
- Logging côté client pour debug

### PERFORMANCE
- Lazy loading des composants
- Pagination côté serveur
- Debouncing des recherches
- Mise en cache des données statiques

### SÉCURITÉ
- Validation côté client ET serveur
- Échappement des données utilisateur
- Gestion des permissions par rôle
- Pas de données sensibles dans localStorage

### TESTS
- Tests unitaires pour les hooks
- Tests d'intégration pour les formulaires
- Tests E2E pour les flux critiques
- Coverage minimum 80%

## RESSOURCES COMPLÉMENTAIRES
- Documentation Swagger : `http://localhost:3000/api-docs`
- Postman collection disponible
- Mockups UI/UX fournis séparément
- Guide de style et charte graphique

**Mission : Créer une interface utilisateur moderne, intuitive et performante qui exploite pleinement les capacités de l'API backend Niaxtu.** 