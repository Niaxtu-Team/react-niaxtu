# Workflow Mobile - Système de Plaintes

Ce document décrit l'intégration du workflow mobile Flutter dans le backend Express/Firebase.

## 🎯 Aperçu du Workflow Mobile

Le système mobile utilise un processus en 5 étapes pour l'enregistrement des plaintes :

1. **Typologie de la plainte** - Sélection du type et de la cible
2. **Structure** - Choix entre structure publique ou privée
3. **Exposé** - Description détaillée + enregistrement vocal optionnel
4. **Localisation** - Géolocalisation GPS obligatoire
5. **Médias** - Ajout d'images (max 5) et audio

## 📋 Types de Plaintes Supportés

```javascript
const ComplaintTypes = {
  PAYMENT_DELAY: 'Retard de paiement',
  UNSATISFACTORY_SERVICE: 'Prestation insatisfaisante',
  ADMINISTRATIVE_PROBLEM: 'Problème administratif',
  OTHER: 'Autre'
};

const TargetTypes = {
  PUBLIC_STRUCTURE: 'Structure publique',
  PRIVATE_STRUCTURE: 'Structure privée',
  INDIVIDUAL: 'Particulier'
};

const SubmissionTypes = {
  VOCAL: 'Vocal',
  WRITTEN: 'Exposé',
  FOLLOW_UP: 'Suite exposé'
};
```

## 🏛️ Hiérarchie des Structures Publiques

### Ministère > Direction > Service

Le système utilise une hiérarchie à 3 niveaux :

```
Ministère de l'Éducation Nationale
├── Direction de l'Enseignement Élémentaire
│   ├── Service de la Planification
│   ├── Service des Ressources Humaines
│   └── Service des Programmes
└── Direction de l'Enseignement Moyen et Secondaire
    ├── Service des Examens
    └── Service de l'Orientation
```

## 🔧 Configuration et Installation

### 1. Installation des dépendances
```bash
cd backend
npm install
```

### 2. Peupler la base de données
```bash
# Créer les ministères, directions et services
npm run seed:mobile

# Nettoyer et recréer (avec --clean)
npm run seed:mobile:clean
```

### 3. Démarrer le serveur
```bash
npm run dev
```

## 📡 API Endpoints

### Plaintes (Mobile Workflow)

```http
# Obtenir les types disponibles
GET /api/complaints/types

# Créer une plainte (avec workflow mobile)
POST /api/complaints
Content-Type: application/json

{
  "complaintType": "Retard de paiement",
  "targetType": "Structure publique",
  "submissionTypes": ["Exposé"],
  "description": "Description détaillée du problème",
  "location": {
    "latitude": 14.6937,
    "longitude": -17.4441,
    "address": "Dakar, Sénégal"
  },
  "publicStructure": {
    "ministereId": "ministere_id",
    "ministereName": "Ministère de l'Éducation",
    "directionId": "direction_id",
    "directionName": "Direction de l'Enseignement",
    "serviceId": "service_id",
    "serviceName": "Service de la Planification"
  },
  "mediaFiles": [
    {
      "type": "image",
      "url": "https://...",
      "filename": "photo1.jpg",
      "size": 1024000,
      "mimeType": "image/jpeg"
    }
  ],
  "vocalRecording": {
    "url": "https://...",
    "duration": 45,
    "filename": "recording.m4a"
  },
  "isDraft": false
}

# Finaliser un brouillon
PUT /api/complaints/{id}/finalize

# Obtenir les plaintes avec filtres mobile
GET /api/complaints?complaintType=Retard%20de%20paiement&targetType=Structure%20publique&isDraft=false
```

### Structures (Hiérarchie Administrative)

```http
# Ministères
GET /api/structures/ministeres
POST /api/structures/ministeres

# Directions par ministère
GET /api/structures/ministeres/{ministereId}/directions
POST /api/structures/directions

# Services par direction
GET /api/structures/directions/{directionId}/services
GET /api/structures/ministeres/{ministereId}/directions/{directionId}/services
POST /api/structures/services
```

## 🎨 Validation des Données

### Structure Privée
- **Nom** : Requis
- **Téléphone** : 9 chiffres commençant par 70, 76, 77 ou 78
- **Email** : Format email valide

### Géolocalisation
- **Latitude/Longitude** : Coordonnées GPS obligatoires pour les plaintes finalisées
- **Adresse** : Chaîne formatée optionnelle

### Médias
- **Images** : Maximum 5 fichiers
- **Audio** : Obligatoire si type "Vocal" sélectionné
- **Taille** : Limitée selon les contraintes Firebase

## 💾 Structure de la Base de Données

### Collection `complaints`
```javascript
{
  id: "complaint_123",
  title: "Retard de paiement",
  description: "Description détaillée...",
  complaintType: "Retard de paiement",
  targetType: "Structure publique",
  submissionTypes: ["Exposé", "Vocal"],
  
  // Structure publique
  publicStructure: {
    ministereId: "min_123",
    ministereName: "Ministère de l'Éducation",
    directionId: "dir_456",
    directionName: "Direction de l'Enseignement",
    serviceId: "srv_789",
    serviceName: "Service de la Planification"
  },
  
  // Structure privée
  privateStructure: {
    name: "Entreprise XYZ",
    phone: "771234567",
    email: "contact@xyz.com"
  },
  
  // Localisation
  location: {
    latitude: 14.6937,
    longitude: -17.4441,
    address: "Dakar, Sénégal"
  },
  
  // Médias
  mediaFiles: [...],
  vocalRecording: {...},
  
  // Métadonnées
  status: "en-attente",
  priority: "moyenne",
  isDraft: false,
  submittedBy: "user_uid",
  createdAt: "2024-01-15T10:30:00Z",
  
  // Suivi
  comments: [...],
  history: [...]
}
```

### Collections de Structure
```javascript
// ministeres
{
  id: "min_123",
  nom: "Ministère de l'Éducation Nationale",
  code: "MEN",
  description: "...",
  actif: true,
  contact: {...},
  statistiques: {...}
}

// directions
{
  id: "dir_456",
  nom: "Direction de l'Enseignement Élémentaire",
  code: "DEE",
  ministereId: "min_123",
  ministereName: "Ministère de l'Éducation Nationale",
  actif: true,
  statistiques: {...}
}

// services
{
  id: "srv_789",
  nom: "Service de la Planification",
  code: "SP",
  ministereId: "min_123",
  directionId: "dir_456",
  ministereName: "Ministère de l'Éducation Nationale",
  directionName: "Direction de l'Enseignement Élémentaire",
  actif: true,
  localisation: {...},
  statistiques: {...}
}
```

## 🔄 Système de Brouillons

Les utilisateurs peuvent :
1. **Sauvegarder** une plainte incomplète comme brouillon (`isDraft: true`)
2. **Modifier** le brouillon autant de fois que nécessaire
3. **Finaliser** le brouillon quand toutes les validations passent

### Validation Différée
- **Brouillons** : Validation minimale (description OU type de plainte)
- **Plaintes finalisées** : Validation complète obligatoire

## 🚀 Intégration Mobile

### Flutter Integration
Le mobile appelle séquentiellement :

1. `GET /api/complaints/types` - Récupérer les types
2. `GET /api/structures/ministeres` - Charger les ministères
3. `GET /api/structures/ministeres/{id}/directions` - Charger directions
4. `GET /api/structures/ministeres/{ministereId}/directions/{directionId}/services` - Charger services
5. `POST /api/complaints` - Soumettre la plainte

### Gestion des Erreurs
Toutes les endpoints retournent des messages d'erreur détaillés en français pour l'interface mobile.

## 📊 Statistiques et Monitoring

Le système track automatiquement :
- Nombre de plaintes par ministère/direction/service
- Types de plaintes les plus fréquents
- Temps de résolution moyen
- Utilisation des différents types de soumission (vocal/écrit)

## 🔒 Sécurité et Permissions

- **Authentification Firebase** requise pour toutes les opérations
- **Permissions hiérarchiques** selon les rôles utilisateur
- **Validation côté serveur** de toutes les données
- **Audit trail** complet de toutes les modifications

---

*Ce système est conçu pour être 100% compatible avec le workflow mobile Flutter existant tout en maintenant la flexibilité pour les futurs développements.* 