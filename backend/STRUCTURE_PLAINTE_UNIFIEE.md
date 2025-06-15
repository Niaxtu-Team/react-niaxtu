# 🔄 STRUCTURE DE PLAINTE UNIFIÉE - NIAXTU

## 🎯 **OBJECTIF**
Combiner le meilleur de votre structure détaillée avec la structure mobile existante pour créer un modèle unifié et complet.

## 📋 **STRUCTURE COMPLÈTE UNIFIÉE**

### **Modèle Firestore Final :**

```javascript
{
  // === INFORMATIONS PRINCIPALES ===
  "id": "auto-generated-id",
  "title": "Retard de paiement", // Titre court
  "description": "Description détaillée du problème...", // Description complète
  
  // === CLASSIFICATION ===
  "type": "Infrastructure", // Type principal de plainte
  "secteur": "Transport", // Secteur concerné
  "sousSecteur": "Voirie", // Sous-secteur spécifique
  "typologies": ["Exposé", "Réclamation"], // Array des typologies
  "priorite": "elevee", // basse, moyenne, elevee, urgente, critique
  
  // === STRUCTURE ADMINISTRATIVE ===
  "ministere": "9EUW8muTQXMlXyC3P4f8", // ID du ministère
  "direction": "YtUQkyQpGjICl6lPVBog", // ID de la direction
  "service": "KHhejHYr7MzGgUYit7q8", // ID du service
  
  // === STRUCTURE PRIVÉE (optionnel) ===
  "isPrivee": false, // true si structure privée
  "nomStructurePrivee": "", // Nom si structure privée
  "emailStructurePrivee": "", // Email si structure privée
  "telephoneStructurePrivee": "", // Téléphone si structure privée
  
  // === GÉOLOCALISATION ===
  "localisation": {
    "adresse": "123 Avenue Victor Hugo, Dakar", // Adresse complète
    "ville": "Dakar", // Ville
    "quartier": "Plateau", // Quartier/Zone
    "region": "Dakar", // Région administrative
    "coordonnees": {
      "latitude": 14.7140483, // Coordonnée latitude
      "longitude": -17.4657383 // Coordonnée longitude
    }
  },
  // Compatibilité mobile (champs séparés)
  "latitude": 14.7140483,
  "longitude": -17.4657383,
  "address": "14.7140483, -17.4657383", // Format mobile
  
  // === PLAIGNANT ===
  "userId": "771282403", // ID utilisateur mobile
  "plaignantInfo": {
    "nom": "Jean Dupont", // Nom complet
    "telephone": "+221 77 123 45 67", // Téléphone
    "email": "jean.dupont@email.com", // Email
    "isAnonymous": false // Plainte anonyme ou non
  },
  
  // === MÉDIAS ET PIÈCES JOINTES ===
  "media": [], // Array des médias (format mobile)
  "pieceJointe": [ // Format détaillé
    {
      "url": "https://storage.googleapis.com/...",
      "nom": "photo_route.jpg",
      "type": "image/jpeg",
      "taille": 2048576, // en bytes
      "uploadedAt": "2025-06-14T21:46:22.000Z"
    }
  ],
  
  // === STATUT ET WORKFLOW ===
  "status": "new", // new, in_progress, resolved, rejected, closed
  "statusHistory": [ // Historique des changements de statut
    {
      "status": "new",
      "timestamp": "2025-06-14T21:46:22.000Z",
      "userId": "system",
      "comment": "Plainte créée"
    }
  ],
  
  // === DATES ===
  "createdAt": "2025-06-14T21:46:22.000Z", // Date de création
  "lastUpdated": "2025-06-14T21:46:22.000Z", // Dernière mise à jour
  "resolvedAt": null, // Date de résolution (si applicable)
  "closedAt": null, // Date de fermeture (si applicable)
  
  // === MÉTADONNÉES ===
  "source": "mobile", // mobile, web, api
  "version": "1.0", // Version du schéma
  "tags": ["urgent", "infrastructure"], // Tags pour recherche
  "visibility": "public", // public, private, restricted
  
  // === TRAITEMENT ===
  "assignedTo": null, // ID de l'agent assigné
  "estimatedResolution": null, // Date estimée de résolution
  "actualResolution": null, // Date réelle de résolution
  "satisfactionScore": null, // Note de satisfaction (1-5)
  "followUpRequired": false, // Suivi requis
  
  // === COMMUNICATION ===
  "comments": [], // Commentaires/échanges
  "notifications": { // Préférences de notification
    "email": true,
    "sms": false,
    "push": true
  }
}
```

## 🔄 **MIGRATION ET COMPATIBILITÉ**

### **1. Fonction de Conversion Mobile → Unifié :**

```javascript
function convertMobileToUnified(mobileComplaint) {
  return {
    // Mapping des champs existants
    title: mobileComplaint.title,
    description: mobileComplaint.description,
    ministere: mobileComplaint.ministere,
    direction: mobileComplaint.direction,
    service: mobileComplaint.service,
    typologies: mobileComplaint.typologies || [],
    status: mobileComplaint.status,
    userId: mobileComplaint.userId,
    createdAt: mobileComplaint.createdAt,
    lastUpdated: mobileComplaint.lastUpdated,
    media: mobileComplaint.media || [],
    
    // Géolocalisation unifiée
    latitude: mobileComplaint.latitude,
    longitude: mobileComplaint.longitude,
    address: mobileComplaint.address,
    localisation: {
      coordonnees: {
        latitude: mobileComplaint.latitude,
        longitude: mobileComplaint.longitude
      },
      adresse: mobileComplaint.address || `${mobileComplaint.latitude}, ${mobileComplaint.longitude}`,
      ville: "À déterminer", // À enrichir via géocodage
      quartier: "À déterminer"
    },
    
    // Structure privée
    isPrivee: mobileComplaint.isPrivee || false,
    nomStructurePrivee: mobileComplaint.nomStructurePrivee || "",
    emailStructurePrivee: mobileComplaint.emailStructurePrivee || "",
    telephoneStructurePrivee: mobileComplaint.telephoneStructurePrivee || "",
    
    // Champs par défaut
    type: "Général",
    secteur: "À classifier",
    sousSecteur: "À classifier",
    priorite: "moyenne",
    source: "mobile",
    version: "1.0",
    visibility: "public",
    
    // Plaignant (à enrichir si possible)
    plaignantInfo: {
      nom: "Utilisateur Mobile",
      telephone: "",
      email: "",
      isAnonymous: true
    },
    
    // Workflow
    statusHistory: [{
      status: mobileComplaint.status,
      timestamp: mobileComplaint.createdAt,
      userId: "system",
      comment: "Migration depuis format mobile"
    }],
    
    // Métadonnées
    tags: [],
    notifications: {
      email: false,
      sms: false,
      push: true
    }
  };
}
```

### **2. Fonction de Création Web → Unifié :**

```javascript
function createWebComplaint(webData) {
  return {
    // Données complètes du web
    title: webData.titre,
    description: webData.description,
    type: webData.type,
    secteur: webData.secteur,
    sousSecteur: webData.sousSecteur,
    priorite: webData.priorite,
    
    // Géolocalisation complète
    localisation: webData.localisation,
    latitude: webData.localisation.coordonnees.latitude,
    longitude: webData.localisation.coordonnees.longitude,
    address: `${webData.localisation.coordonnees.latitude}, ${webData.localisation.coordonnees.longitude}`,
    
    // Plaignant complet
    plaignantInfo: webData.plaignantInfo,
    
    // Pièces jointes
    pieceJointe: webData.pieceJointe || [],
    media: webData.pieceJointe?.map(pj => ({
      url: pj.url,
      type: pj.type,
      name: pj.nom
    })) || [],
    
    // Métadonnées
    source: "web",
    version: "1.0",
    visibility: "public",
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    status: "new",
    
    // Workflow initial
    statusHistory: [{
      status: "new",
      timestamp: new Date().toISOString(),
      userId: "web-user",
      comment: "Plainte créée via interface web"
    }],
    
    // Structure administrative (à mapper)
    ministere: null, // À déterminer selon la classification
    direction: null,
    service: null,
    isPrivee: false,
    
    // Notifications par défaut
    notifications: {
      email: true,
      sms: false,
      push: false
    }
  };
}
```

## 🔧 **IMPLÉMENTATION DANS L'API**

### **Route de Création Unifiée :**

```javascript
// routes/complaints.js
router.post('/create', async (req, res) => {
  try {
    const { source = 'web', ...data } = req.body;
    
    let unifiedComplaint;
    
    switch (source) {
      case 'mobile':
        unifiedComplaint = convertMobileToUnified(data);
        break;
      case 'web':
        unifiedComplaint = createWebComplaint(data);
        break;
      default:
        unifiedComplaint = data; // Format déjà unifié
    }
    
    // Enrichissement automatique
    unifiedComplaint = await enrichComplaint(unifiedComplaint);
    
    // Validation
    const validation = validateComplaint(unifiedComplaint);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }
    
    // Sauvegarde
    const docRef = await db.collection('complaints').add(unifiedComplaint);
    
    res.status(201).json({
      success: true,
      id: docRef.id,
      complaint: unifiedComplaint
    });
    
  } catch (error) {
    console.error('Erreur création plainte:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la plainte'
    });
  }
});
```

### **Fonction d'Enrichissement :**

```javascript
async function enrichComplaint(complaint) {
  // Géocodage inverse pour enrichir l'adresse
  if (complaint.latitude && complaint.longitude && !complaint.localisation?.ville) {
    try {
      const geoData = await reverseGeocode(complaint.latitude, complaint.longitude);
      complaint.localisation = {
        ...complaint.localisation,
        ville: geoData.city || "Dakar",
        quartier: geoData.district || "Non spécifié",
        region: geoData.region || "Dakar"
      };
    } catch (error) {
      console.warn('Erreur géocodage:', error);
    }
  }
  
  // Classification automatique si manquante
  if (!complaint.type || complaint.type === "Général") {
    complaint.type = await classifyComplaint(complaint.description);
  }
  
  // Attribution automatique de structure si possible
  if (!complaint.ministere && complaint.type) {
    const structure = await findBestStructure(complaint);
    if (structure) {
      complaint.ministere = structure.ministere;
      complaint.direction = structure.direction;
      complaint.service = structure.service;
    }
  }
  
  // Génération d'ID unique si manquant
  if (!complaint.id) {
    complaint.id = generateComplaintId();
  }
  
  return complaint;
}
```

## 📊 **AVANTAGES DE CETTE STRUCTURE**

### ✅ **Compatibilité :**
- **Mobile** : Tous les champs existants préservés
- **Web** : Structure riche et détaillée supportée
- **API** : Format unifié pour tous les clients

### ✅ **Flexibilité :**
- **Évolutive** : Facile d'ajouter de nouveaux champs
- **Rétrocompatible** : Anciens formats toujours supportés
- **Modulaire** : Champs optionnels selon la source

### ✅ **Richesse :**
- **Géolocalisation** : Double format (détaillé + mobile)
- **Workflow** : Historique complet des statuts
- **Médias** : Support multiple formats
- **Classification** : Système hiérarchique complet

Cette structure unifiée vous permet de garder la compatibilité avec l'existant tout en ajoutant la richesse nécessaire pour une gestion complète des plaintes ! 🚀 