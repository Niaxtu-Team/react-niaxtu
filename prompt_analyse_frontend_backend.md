# Prompt d'Analyse Frontend-Backend Niaxtu

## Contexte d'Analyse

Tu es un expert en développement fullstack React/Node.js. Tu dois analyser la structure actuelle du frontend Niaxtu Admin et établir la correspondance entre les routes backend (APIs) et les formulaires/pages frontend, particulièrement pour la partie administration.

## Objectifs de l'Analyse

1. **Mapping API-Frontend** : Identifier quelles routes API sont utilisées par quels composants
2. **Audit des Formulaires** : Vérifier que tous les champs requis par les APIs sont présents dans les formulaires
3. **Validation de la Structure** : S'assurer que la structure des données frontend correspond aux modèles backend
4. **Identification des Lacunes** : Détecter les fonctionnalités manquantes ou incomplètes

## Structure Backend Identifiée

### Collections Firebase et APIs Correspondantes

#### 1. Collection `admin` (Gestion des Administrateurs)
**Contrôleur** : `userController.js` + `adminController.js`
**Modèle Principal** :
```javascript
{
  uid: "string",
  email: "string", 
  displayName: "string",
  role: "user|moderator|admin|super_admin",
  permissions: ["array"],
  isActive: "boolean",
  profile: {
    firstName: "string",
    lastName: "string",
    phone: "string"
  },
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

**Routes API Identifiées** :
- GET `/api/users` - Récupérer tous les utilisateurs (avec filtres)
- GET `/api/users/:id` - Récupérer un utilisateur par ID
- POST `/api/users` - Créer un utilisateur
- PUT `/api/users/:id` - Mettre à jour un utilisateur
- PUT `/api/users/:id/role` - Modifier le rôle
- PUT `/api/users/:id/activate` - Activer/désactiver
- DELETE `/api/users/:id` - Supprimer un utilisateur
- GET `/api/admin/stats/dashboard` - Statistiques dashboard

#### 2. Collection `complaints` (Gestion des Plaintes)
**Contrôleur** : `complaintController.js`
**Modèle Principal** :
```javascript
{
  id: "string",
  complaintType: "string",
  targetType: "Structure publique|Structure privée|Particulier",
  submissionTypes: ["Vocal", "Exposé", "Suite exposé"],
  description: "string",
  location: {
    latitude: "number",
    longitude: "number", 
    address: "string"
  },
  publicStructure: {
    ministereId: "string",
    ministereName: "string",
    directionId: "string",
    directionName: "string", 
    serviceId: "string",
    serviceName: "string"
  },
  privateStructure: {
    nom: "string",
    email: "string",
    telephone: "string"
  },
  status: "en-attente|en-traitement|resolue|rejetee",
  priority: "faible|moyenne|elevee|critique",
  isDraft: "boolean",
  submittedBy: "string",
  assignedTo: "string",
  createdAt: "timestamp"
}
```

**Routes API Identifiées** :
- GET `/api/complaints` - Récupérer toutes les plaintes (avec filtres)
- POST `/api/complaints` - Créer une plainte
- PUT `/api/complaints/:id/status` - Modifier le statut
- POST `/api/complaints/:id/comments` - Ajouter un commentaire
- GET `/api/complaints/types` - Types de plaintes disponibles

#### 3. Collection `structures` (Structures Publiques)
**Contrôleur** : `structureController.js`
**Modèles Principaux** :

**Ministères** :
```javascript
{
  id: "string",
  nom: "string", 
  description: "string",
  code: "string",
  actif: "boolean",
  contact: {
    telephone: "string",
    email: "string", 
    adresse: "string"
  },
  statistiques: {},
  createdAt: "timestamp"
}
```

**Directions** :
```javascript
{
  id: "string",
  nom: "string",
  ministereId: "string",
  ministereName: "string",
  description: "string",
  code: "string", 
  actif: "boolean",
  responsable: {},
  createdAt: "timestamp"
}
```

**Services** :
```javascript
{
  id: "string",
  nom: "string",
  ministereId: "string",
  directionId: "string",
  ministereName: "string",
  directionName: "string",
  description: "string",
  code: "string",
  actif: "boolean",
  responsable: {},
  localisation: {
    latitude: "number",
    longitude: "number",
    adresse: "string"
  },
  createdAt: "timestamp"
}
```

**Routes API Identifiées** :
- GET `/api/structures` - Toutes les structures
- GET `/api/structures/ministeres` - Tous les ministères
- POST `/api/structures/ministeres` - Créer ministère
- GET `/api/structures/ministeres/:id/directions` - Directions par ministère
- POST `/api/structures/directions` - Créer direction
- GET `/api/structures/directions/:id/services` - Services par direction
- POST `/api/structures/services` - Créer service

#### 4. Collection `sectors` (Secteurs et Sous-secteurs)
**Contrôleur** : `sectorController.js`
**Modèles** :
```javascript
// Secteur
{
  id: "string",
  name: "string",
  description: "string", 
  isActive: "boolean",
  statistics: {},
  createdAt: "timestamp"
}

// Sous-secteur  
{
  id: "string",
  name: "string",
  sectorId: "string",
  description: "string",
  isActive: "boolean", 
  createdAt: "timestamp"
}
```

#### 5. Collection `complaintTypes` & `targetTypes`
**Contrôleur** : `typesController.js`

## Structure Frontend Identifiée

### Pages d'Administration Mappées

#### Pages de Gestion des Utilisateurs
- `/admin/utilisateurs` → `Utilisateurs.jsx`
- `/admin/gestion-admins` → `GestionAdmins.jsx`

#### Pages de Gestion des Plaintes
- `/admin/plaintes` → `ToutesPlaintes.jsx`
- `/admin/plaintes/en-attente` → `PlaintesEnAttente.jsx`
- `/admin/plaintes/en-traitement` → `PlaintesEnTraitement.jsx`
- `/admin/plaintes/resolues` → `PlaintesResolues.jsx`
- `/admin/plaintes/rejetees` → `PlaintesRejetees.jsx`

#### Pages de Configuration
- `/admin/plaintes/types` → `ListeTypesPlainte.jsx`
- `/admin/plaintes/types/nouveau` → `NouveauTypePlainte.jsx`
- `/admin/cibles/types` → `ListeTypesCible.jsx`
- `/admin/cibles/types/nouveau` → `NouveauTypeCible.jsx`

#### Pages Secteurs & Structures
- `/admin/secteurs` → `ListeSecteurs.jsx`
- `/admin/secteurs/nouveau` → `NouveauSecteur.jsx`
- `/admin/sous-secteurs` → `ListeSousSecteurs.jsx`
- `/admin/sous-secteurs/nouveau` → `NouveauSousSecteur.jsx`
- `/admin/structures` → `ListeStructures.jsx`
- `/admin/structures/nouveau` → `NouvelleStructure.jsx`

## Mission d'Analyse

### Étape 1 : Audit des Correspondances API-Frontend

Pour chaque page identifiée, tu dois :

1. **Analyser le composant React** pour identifier :
   - Les appels d'API utilisés (fetch, axios, etc.)
   - La structure des données manipulées
   - Les champs des formulaires présents
   - Les validations implémentées

2. **Comparer avec les routes backend** pour vérifier :
   - Si tous les endpoints nécessaires sont appelés
   - Si la structure des données correspond aux modèles backend
   - Si tous les champs requis sont présents dans les formulaires
   - Si les permissions sont correctement gérées

3. **Identifier les écarts** :
   - Champs manquants dans les formulaires
   - Routes API non utilisées
   - Fonctionnalités backend non exposées au frontend
   - Incohérences dans la structure des données

### Étape 2 : Analyse Spécifique par Collection

#### Pour la Collection `admin` (Priorité Haute)
- Vérifier que `GestionAdmins.jsx` implémente tous les CRUD
- S'assurer que la gestion des rôles et permissions est complète
- Vérifier les appels aux routes `/api/users/*`

#### Pour la Collection `complaints` (Priorité Haute) 
- Analyser le workflow complet de gestion des plaintes
- Vérifier les filtres par statut, type, ministère
- S'assurer que tous les champs du modèle sont gérables

#### Pour les Collections `structures` (Priorité Moyenne)
- Vérifier la hiérarchie Ministère → Direction → Service
- S'assurer des cascades de sélection
- Vérifier la création/modification de chaque niveau

#### Pour les Collections `types` (Priorité Moyenne)
- Vérifier les formulaires de création de types
- S'assurer de la liaison avec les secteurs

### Étape 3 : Recommandations d'Amélioration

Tu dois proposer :

1. **Corrections Immédiates** :
   - Champs manquants à ajouter
   - Routes API à implémenter côté frontend
   - Bugs de correspondance à corriger

2. **Améliorations Recommandées** :
   - Optimisations des appels API
   - Améliorations UX des formulaires
   - Gestion d'erreurs à renforcer

3. **Nouvelles Fonctionnalités** :
   - Fonctionnalités backend non exploitées
   - Workflows à compléter
   - Intégrations manquantes

### Format de Réponse Attendu

Pour chaque page analysée, présenter :

```markdown
## [Nom de la Page] - [Route Frontend]

### ✅ Correspondances Correctes
- API utilisée : [Route backend]
- Champs alignés : [Liste]
- Fonctionnalités implémentées : [Liste]

### ❌ Écarts Identifiés  
- Champs manquants : [Liste avec justification]
- Routes API non utilisées : [Liste]
- Problèmes de structure : [Description]

### 🔧 Corrections Recommandées
- [Liste prioritisée des corrections]

### 💡 Améliorations Suggérées
- [Liste des améliorations possibles]
```

### Outils d'Analyse Disponibles

Tu as accès aux outils pour :
- Lire les fichiers frontend (composants React)
- Chercher dans le code (patterns, imports, etc.)
- Analyser la structure des dossiers
- Comparer les structures de données

Commence ton analyse par les pages d'administration les plus critiques (GestionAdmins, ToutesPlaintes) puis continue avec les autres pages selon leur priorité. 