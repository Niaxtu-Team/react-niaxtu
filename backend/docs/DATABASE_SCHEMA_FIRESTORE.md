# 📊 Documentation Base de Données Firestore - Niaxtu

## 🏗️ Architecture NoSQL Firebase

Cette documentation décrit la structure complète de la base de données Firestore pour la plateforme Niaxtu, adaptée du schéma relationnel vers une architecture NoSQL optimisée.

---

## 📋 Collections Principales

### 🏛️ **Structure Organisationnelle Gouvernementale**

#### 1. Collection `ministere` (Racine hiérarchique)
```javascript
{
  id: "ministere_123",
  nom: "Ministère de l'Intérieur",
  code: "MIN_INT",
  description: "Ministère chargé de la sécurité intérieure",
  ministre: "Jean Dupont",
  adresse: {
    rue: "1 Place Beauvau",
    ville: "Paris", 
    codePostal: "75008",
    pays: "France"
  },
  contact: {
    telephone: "+33 1 49 27 49 27",
    email: "contact@interieur.gouv.fr",
    siteWeb: "https://www.interieur.gouv.fr"
  },
  logo: "https://example.com/logo.png",
  couleur: "#dc2626",
  isActif: true,
  dateCreation: "2025-06-11T21:00:00.000Z",
  dateMiseAJour: "2025-06-11T21:00:00.000Z",
  creePar: "admin_123"
}
```

#### 2. Collection `direction` (Niveau 2)
```javascript
{
  id: "direction_456",
  nom: "Direction Générale de la Sécurité Publique",
  code: "DGSP",
  description: "Direction chargée de la sécurité publique",
  ministereId: "ministere_123", // Référence parent
  directeur: "Marie Martin",
  typeDirection: "Générale", // Générale|Régionale|Départementale
  adresse: {
    rue: "2 Avenue de la République",
    ville: "Paris",
    codePostal: "75011"
  },
  contact: {
    telephone: "+33 1 40 07 60 60",
    email: "dgsp@interieur.gouv.fr"
  },
  budget: 2500000,
  effectifs: 150,
  isActif: true,
  dateCreation: "2025-06-11T21:00:00.000Z",
  dateMiseAJour: "2025-06-11T21:00:00.000Z",
  creepar: "admin_123"
}
```

#### 3. Collection `service` (Niveau 3)
```javascript
{
  id: "service_789",
  nom: "Service de Police Municipale",
  code: "SPM",
  description: "Service de police de proximité",
  directionId: "direction_456", // Référence parent
  ministereId: "ministere_123", // Référence rapide
  chefService: "Pierre Durand",
  typeService: "Opérationnel", // Opérationnel|Support|Administratif
  specialites: ["Sécurité", "Circulation", "Proximité"],
  adresse: {
    rue: "15 Rue de la Paix",
    ville: "Lyon",
    codePostal: "69001"
  },
  contact: {
    telephone: "+33 4 72 00 00 00",
    email: "spm@lyon.fr"
  },
  horaires: {
    ouverture: "08:00",
    fermeture: "18:00",
    joursOuverture: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
  },
  budget: 500000,
  effectifs: 25,
  isActif: true,
  dateCreation: "2025-06-11T21:00:00.000Z",
  dateMiseAJour: "2025-06-11T21:00:00.000Z",
  creepar: "admin_123"
}
```

#### 4. Collection `bureau` (Niveau 4 - Feuille)
```javascript
{
  id: "bureau_012",
  nom: "Bureau des Permis de Conduire",
  code: "BPC",
  description: "Bureau de délivrance des permis",
  serviceId: "service_789", // Référence parent
  directionId: "direction_456", // Référence navigation
  ministereId: "ministere_123", // Référence navigation
  responsable: "Sophie Leblanc",
  typeBureau: "Accueil", // Accueil|Traitement|Contrôle
  competences: ["Délivrance permis", "Renouvellement", "Duplicata"],
  adresse: {
    rue: "15 Rue de la Paix",
    ville: "Lyon",
    codePostal: "69001",
    etage: "2ème étage",
    bureau: "Bureau 205"
  },
  contact: {
    telephone: "+33 4 72 00 00 01",
    email: "permis@lyon.fr",
    responsableEmail: "s.leblanc@lyon.fr"
  },
  horaires: {
    ouverture: "08:30",
    fermeture: "17:00",
    joursOuverture: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
    pauseDejeneur: {
      debut: "12:00",
      fin: "14:00"
    }
  },
  capaciteAccueil: 50,
  effectifs: 8,
  isActif: true,
  dateCreation: "2025-06-11T21:00:00.000Z",
  dateMiseAJour: "2025-06-11T21:00:00.000Z",
  creepar: "admin_123"
}
```

---

### 👥 **Gestion des Utilisateurs**

#### 5. Collection `plaignant` (Utilisateurs de base)
```javascript
{
  id: "plaignant_123",
  uid: "firebase_uid_abc123", // Firebase Auth UID
  email: "citoyen@example.com",
  pseudo: "CitoyenLyon",
  prenom: "Jean",
  nom: "Dupont",
  telephone: "+33 6 12 34 56 78",
  age: 35,
  sexe: "M", // M|F|Autre
  avatar: "https://example.com/avatar.jpg",
  adresse: {
    rue: "123 Avenue de la République",
    ville: "Lyon",
    codePostal: "69001",
    pays: "France"
  },
  localisation: {
    latitude: 45.7640,
    longitude: 4.8357,
    precision: 100 // mètres
  },
  preferences: {
    notifications: true,
    newsletter: false,
    langue: "fr"
  },
  statistiques: {
    nombrePlaintes: 3,
    dernierePlainte: "2025-06-10T15:30:00.000Z",
    scoreReputation: 85
  },
  isActif: true,
  isVerifie: true,
  dateInscription: "2025-01-15T10:00:00.000Z",
  dernierConnexion: "2025-06-11T20:45:00.000Z",
  dateMiseAJour: "2025-06-11T20:45:00.000Z"
}
```

#### 6. Collection `admin` (Administrateurs système)
```javascript
{
  id: "admin_456",
  uid: "admin_1749675455099_mx7hrs83e",
  email: "admin@niaxtu.com",
  displayName: "Super Administrateur",
  role: "super_admin", // analyst|moderator|structure_manager|sector_manager|admin|super_admin
  permissions: ["MANAGE_USERS", "VIEW_REPORTS", "EXPORT_DATA"],
  profile: {
    firstName: "Super",
    lastName: "Administrateur", 
    phone: "+221 77 123 45 67",
    organization: "Niaxtu Administration",
    position: "Super Administrateur Système",
    bio: "Compte super administrateur du système Niaxtu"
  },
  assignedStructures: ["ministere_123"], // Structures gérées
  isActive: true,
  lastLogin: "2025-06-11T21:00:00.000Z",
  createdAt: "2025-06-11T20:00:00.000Z",
  updatedAt: "2025-06-11T21:00:00.000Z"
}
```

---

### 📝 **Système de Plaintes**

#### 7. Collection `plainte` (Plaintes principales)
```javascript
{
  id: "plainte_789",
  plaignantId: "plaignant_123",
  plaignantPseudo: "CitoyenLyon", // Dénormalisation pour performance
  prenom: "Jean",
  nom: "Dupont",
  tel1: "+33 6 12 34 56 78",
  tel2: null,
  email: "citoyen@example.com",
  age: 35,
  sexe: "M",
  
  // Détails de la plainte
  titre: "Route dégradée avenue Victor Hugo",
  description: "Nids de poule importants rendant la circulation dangereuse",
  typePlainteId: "type_infrastructure",
  typePlainteLibelle: "Infrastructure", // Dénormalisation
  
  // Localisation
  localisation: {
    adresse: "123 Avenue Victor Hugo, Lyon",
    ville: "Lyon",
    codePostal: "69001",
    latitude: 45.7640,
    longitude: 4.8357,
    precision: 50
  },
  
  // Assignation structure
  secteurId: "secteur_transport",
  secteurLibelle: "Transport",
  structureId: "bureau_012", // Bureau assigné
  structureNom: "Bureau des Permis de Conduire",
  cheminHierarchique: "Ministère de l'Intérieur > DGSP > SPM > BPC",
  
  // Statut et priorité
  statut: "en-attente", // en-attente|en-traitement|resolue|rejetee
  priorite: "elevee", // faible|moyenne|elevee|urgente
  
  // Dates importantes
  dateCreation: "2025-06-11T15:30:00.000Z",
  dateReception: "2025-06-11T15:30:00.000Z",
  dateTransfert: null,
  dateResolution: null,
  dateMiseAJour: "2025-06-11T15:30:00.000Z",
  
  // Métadonnées
  source: "web", // web|mobile|telephone|courrier
  canal: "plateforme",
  reference: "PLT-2025-001234",
  tags: ["urgence", "infrastructure", "sécurité"],
  
  // Assignation
  assigneA: null, // ID admin assigné
  assignePar: null,
  dateAssignation: null,
  
  // Fichiers joints
  fichiers: [
    {
      id: "fichier_001",
      nom: "photo_nid_poule.jpg",
      url: "https://storage.googleapis.com/niaxtu/fichiers/...",
      type: "image/jpeg",
      taille: 2048576,
      dateUpload: "2025-06-11T15:32:00.000Z"
    }
  ],
  
  // Statistiques
  nombreVues: 5,
  nombreCommentaires: 2,
  scoreUrgence: 85,
  
  isActive: true
}
```

---

### 🏷️ **Système de Classification**

#### 8. Collection `secteur` (Secteurs d'activité)
```javascript
{
  id: "secteur_transport",
  libelle: "Transport",
  description: "Secteur des transports publics et voirie",
  ordre: 1,
  email: "transport@ville.fr",
  tel1: "+33 4 72 00 10 00",
  tel2: null,
  modeCles: "transport,voirie,circulation,bus,métro",
  couleur: "#3b82f6",
  icone: "fa-bus",
  isActif: true,
  dateCreation: "2025-06-11T10:00:00.000Z",
  dateMiseAJour: "2025-06-11T10:00:00.000Z",
  creePar: "admin_123"
}
```

#### 9. Collection `type_plainte` (Types de plaintes)
```javascript
{
  id: "type_infrastructure",
  code: "INFRA",
  libelle: "Infrastructure",
  description: "Problèmes liés aux infrastructures publiques",
  ordre: 1,
  couleur: "#dc2626",
  icone: "fa-road",
  isActif: true,
  dateCreation: "2025-06-11T10:00:00.000Z",
  dateMiseAJour: "2025-06-11T10:00:00.000Z",
  creePar: "admin_123"
}
```

---

### 💬 **Système de Communication**

#### 10. Collection `commentaire` (Commentaires sur plaintes)
```javascript
{
  id: "commentaire_001",
  plainteId: "plainte_789",
  auteurId: "admin_456",
  auteurType: "admin", // plaignant|admin
  auteurNom: "Super Administrateur",
  contenu: "Plainte transférée au service compétent pour traitement",
  type: "interne", // public|interne|systeme
  dateCreation: "2025-06-11T16:00:00.000Z",
  dateMiseAJour: "2025-06-11T16:00:00.000Z",
  isVisible: true,
  
  // Métadonnées
  adresseIP: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  
  // Réponse à un autre commentaire
  reponseA: null, // ID commentaire parent
  
  // Fichiers joints
  fichiers: [],
  
  // Modération
  isModere: false,
  moderePar: null,
  raisonModeration: null
}
```

#### 11. Collection `fichier` (Fichiers joints)
```javascript
{
  id: "fichier_001",
  plainteId: "plainte_789",
  nom: "photo_probleme.jpg",
  nomOriginal: "IMG_20250611_153000.jpg",
  chemin: "plaintes/2025/06/plainte_789/",
  url: "https://storage.googleapis.com/niaxtu/plaintes/2025/06/plainte_789/photo_probleme.jpg",
  type: "image/jpeg",
  taille: 2048576,
  largeur: 1920,
  hauteur: 1080,
  
  // Métadonnées upload
  uploadePar: "plaignant_123",
  dateUpload: "2025-06-11T15:32:00.000Z",
  adresseIP: "192.168.1.50",
  
  // Sécurité
  hashMD5: "d41d8cd98f00b204e9800998ecf8427e",
  scanVirus: "clean",
  dateScan: "2025-06-11T15:32:30.000Z",
  
  // Traitement image
  miniature: "https://storage.googleapis.com/niaxtu/thumbs/fichier_001_thumb.jpg",
  taillesMiniatures: {
    small: "150x150",
    medium: "300x300",
    large: "600x600"
  },
  
  isActif: true,
  isPublic: false
}
```

---

### 📊 **Collections Système**

#### 12. Collection `cible_privee` (Données privées/sensibles)
```javascript
{
  id: "cible_001",
  nom: "Données Personnelles Plaignants",
  tel2: "+33 6 XX XX XX XX", // Numéro masqué
  adresse: "Adresse confidentielle",
  auteur: "system",
  modeCles: "confidentiel,rgpd,données personnelles",
  dateCreation: "2025-06-11T10:00:00.000Z",
  dateMiseAJour: "2025-06-11T10:00:00.000Z",
  
  // Contrôle d'accès
  niveauAcces: "confidentiel", // public|interne|confidentiel|secret
  autorisations: ["super_admin", "admin"],
  
  // Audit
  derniereConsultation: "2025-06-11T20:00:00.000Z",
  consultePar: "admin_456",
  nombreConsultations: 5
}
```

#### 13. Collection `reponse_cible` (Réponses automatiques)
```javascript
{
  id: "reponse_001",
  plainteId: "plainte_789",
  reponseDate: "2025-06-11T16:30:00.000Z",
  reponseExpose: "Votre plainte a été reçue et sera traitée dans les meilleurs délais",
  reponseSuite: "Un agent vous contactera sous 48h pour faire le point",
  reponseStatut: "automatique", // automatique|manuelle|systeme
  
  // Template utilisé
  templateId: "template_accuse_reception",
  templateNom: "Accusé de réception standard",
  
  // Envoi
  envoiEmail: true,
  envoiSMS: false,
  dateEnvoi: "2025-06-11T16:31:00.000Z",
  statutEnvoi: "envoye", // en-attente|envoye|echec
  
  // Personnalisation
  variables: {
    nomPlaignant: "Jean Dupont",
    numeroPlainte: "PLT-2025-001234",
    delaiTraitement: "48 heures"
  }
}
```

---

## 🔗 Relations et Index

### Relations Principales
```javascript
// Hiérarchie organisationnelle
ministere (1) -> direction (N)
direction (1) -> service (N)  
service (1) -> bureau (N)

// Plaintes et utilisateurs
plaignant (1) -> plainte (N)
bureau (1) -> plainte (N)
secteur (1) -> plainte (N)
type_plainte (1) -> plainte (N)

// Communication
plainte (1) -> commentaire (N)
plainte (1) -> fichier (N)
plainte (1) -> reponse_cible (N)
```

### Index Composites Recommandés
```javascript
// Collection plainte
{
  fields: ["statut", "dateCreation"],
  order: "DESC"
}
{
  fields: ["plaignantId", "dateCreation"], 
  order: "DESC"
}
{
  fields: ["structureId", "statut", "priorite"],
  order: "ASC"
}
{
  fields: ["secteurId", "dateCreation"],
  order: "DESC"
}

// Collection commentaire
{
  fields: ["plainteId", "dateCreation"],
  order: "ASC"
}

// Collection admin
{
  fields: ["role", "isActive"],
  order: "ASC"
}
```

---

## 🛡️ Règles de Sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Plaignants - accès à leurs propres données
    match /plaignant/{plaignantId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Plaintes - lecture publique, écriture par propriétaire
    match /plainte/{plainteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.plaignantId;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.plaignantId || 
         get(/databases/$(database)/documents/admin/$(request.auth.uid)).data.role in ['admin', 'super_admin']);
    }
    
    // Admins - accès selon rôle
    match /admin/{adminId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/admin/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/admin/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    // Structure organisationnelle - lecture publique, écriture admin
    match /{collection}/{document} {
      allow read: if collection in ['ministere', 'direction', 'service', 'bureau', 'secteur', 'type_plainte'];
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/admin/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    // Données sensibles - accès restreint
    match /cible_privee/{document} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/admin/$(request.auth.uid)).data.role == 'super_admin';
    }
  }
}
```

---

## 📈 Optimisations NoSQL

### Dénormalisation Stratégique
- **Noms et libellés** copiés dans les documents enfants pour éviter les jointures
- **Chemins hiérarchiques** précalculés pour l'affichage
- **Compteurs** maintenus en temps réel

### Stratégies de Requête
- **Pagination** avec `startAfter()` pour les grandes collections
- **Filtres composites** avec index appropriés
- **Recherche textuelle** avec champs de mots-clés
- **Agrégations** via Cloud Functions

### Performance
- **Batch writes** pour les opérations multiples
- **Transactions** pour la cohérence des données
- **Cache** côté client avec persistance offline
- **Listeners temps réel** pour les mises à jour

---

## 🔄 Migration depuis SQL

### Étapes de Migration
1. **Export** des données SQL existantes
2. **Transformation** des relations en documents imbriqués
3. **Import** par batch dans Firestore
4. **Validation** de l'intégrité des données
5. **Mise à jour** des index et règles de sécurité

### Scripts de Migration Disponibles
- `scripts/migrate-plaignants.js`
- `scripts/migrate-plaintes.js`
- `scripts/migrate-structure.js`
- `scripts/validate-migration.js`

---

*Documentation générée le 11 juin 2025 - Version 1.0* 