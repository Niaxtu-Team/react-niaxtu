// Modèle pour la structure organisationnelle hiérarchique
// Ministère > Direction > Service > Bureau/Département

export const OrganizationStructure = {
  // Structure Ministère (niveau racine)
  ministères: {
    id: String, // ministere_123
    nom: String, // "Ministère de l'Intérieur"
    code: String, // "MIN_INT"
    description: String,
    ministre: String, // Nom du ministre
    adresse: {
      rue: String,
      ville: String,
      codePostal: String,
      pays: String
    },
    contact: {
      telephone: String,
      email: String,
      siteWeb: String
    },
    logo: String, // URL du logo
    couleur: String, // Couleur thématique #hex
    isActif: Boolean,
    dateCreation: Date,
    dateMiseAJour: Date,
    creePar: String // UID admin
  },

  // Structure Direction (niveau 2)
  direction: {
    id: String, // direction_456
    nom: String, // "Direction Générale de la Sécurité Publique"
    code: String, // "DGSP"
    description: String,
    ministereId: String, // Référence au ministère parent
    directeur: String, // Nom du directeur
    typeDirection: String, // "Générale", "Régionale", "Départementale"
    adresse: {
      rue: String,
      ville: String,
      codePostal: String,
      pays: String
    },
    contact: {
      telephone: String,
      email: String,
      siteWeb: String
    },
    budget: Number, // Budget alloué
    effectifs: Number, // Nombre d'employés
    isActif: Boolean,
    dateCreation: Date,
    dateMiseAJour: Date,
    creepar: String
  },

  // Structure Service (niveau 3)
  service: {
    id: String, // service_789
    nom: String, // "Service de Police Municipale"
    code: String, // "SPM"
    description: String,
    directionId: String, // Référence à la direction parent
    ministereId: String, // Référence au ministère (pour navigation rapide)
    chefService: String, // Nom du chef de service
    typeService: String, // "Opérationnel", "Support", "Administratif"
    specialites: [String], // ["Sécurité", "Circulation", "Proximité"]
    adresse: {
      rue: String,
      ville: String,
      codePostal: String,
      pays: String
    },
    contact: {
      telephone: String,
      email: String,
      siteWeb: String
    },
    horaires: {
      ouverture: String, // "08:00"
      fermeture: String, // "18:00"
      joursOuverture: [String] // ["Lundi", "Mardi", ...]
    },
    budget: Number,
    effectifs: Number,
    isActif: Boolean,
    dateCreation: Date,
    dateMiseAJour: Date,
    creepar: String
  },

  // Structure Bureau/Département (niveau 4)
  bureau: {
    id: String, // bureau_012
    nom: String, // "Bureau des Permis de Conduire"
    code: String, // "BPC"
    description: String,
    serviceId: String, // Référence au service parent
    directionId: String, // Référence à la direction (navigation)
    ministereId: String, // Référence au ministère (navigation)
    responsable: String, // Nom du responsable
    typeBureau: String, // "Accueil", "Traitement", "Contrôle"
    competences: [String], // ["Délivrance permis", "Renouvellement", "Duplicata"]
    adresse: {
      rue: String,
      ville: String,
      codePostal: String,
      pays: String,
      etage: String, // "2ème étage"
      bureau: String // "Bureau 205"
    },
    contact: {
      telephone: String,
      email: String,
      responsableEmail: String
    },
    horaires: {
      ouverture: String,
      fermeture: String,
      joursOuverture: [String],
      pauseDejeneur: {
        debut: String, // "12:00"
        fin: String // "14:00"
      }
    },
    capaciteAccueil: Number, // Nombre de personnes max
    effectifs: Number,
    isActif: Boolean,
    dateCreation: Date,
    dateMiseAJour: Date,
    creepar: String
  }
};

// Fonctions utilitaires pour la hiérarchie
export const OrganizationUtils = {
  // Construire le chemin hiérarchique complet
  buildHierarchyPath: (bureau, service, direction, ministere) => {
    return `${ministere.nom} > ${direction.nom} > ${service.nom} > ${bureau.nom}`;
  },

  // Générer un code unique basé sur la hiérarchie
  generateHierarchyCode: (ministereCode, directionCode, serviceCode, bureauCode) => {
    return `${ministereCode}_${directionCode}_${serviceCode}_${bureauCode}`;
  },

  // Valider la cohérence hiérarchique
  validateHierarchy: (item, parentId, level) => {
    const requiredParents = {
      'direction': 'ministereId',
      'service': 'directionId', 
      'bureau': 'serviceId'
    };
    
    if (level !== 'ministere' && !item[requiredParents[level]]) {
      throw new Error(`${level} doit avoir un parent ${requiredParents[level]}`);
    }
    
    return true;
  },

  // Obtenir tous les enfants d'un élément
  getChildren: async (parentId, childLevel, db) => {
    const parentField = {
      'direction': 'ministereId',
      'service': 'directionId',
      'bureau': 'serviceId'
    };

    const snapshot = await db.collection(childLevel)
      .where(parentField[childLevel], '==', parentId)
      .where('isActif', '==', true)
      .orderBy('nom')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Obtenir la hiérarchie complète d'un élément
  getFullHierarchy: async (itemId, level, db) => {
    const item = await db.collection(level).doc(itemId).get();
    if (!item.exists) return null;

    const data = { id: item.id, ...item.data() };
    const hierarchy = { [level]: data };

    // Remonter la hiérarchie
    if (level === 'bureau' && data.serviceId) {
      const service = await db.collection('service').doc(data.serviceId).get();
      if (service.exists) {
        hierarchy.service = { id: service.id, ...service.data() };
        
        if (service.data().directionId) {
          const direction = await db.collection('direction').doc(service.data().directionId).get();
          if (direction.exists) {
            hierarchy.direction = { id: direction.id, ...direction.data() };
            
            if (direction.data().ministereId) {
              const ministere = await db.collection('ministères').doc(direction.data().ministereId).get();
              if (ministere.exists) {
                hierarchy.ministères = { id: ministere.id, ...ministere.data() };
              }
            }
          }
        }
      }
    }
    // Logique similaire pour service et direction...

    return hierarchy;
  }
};

export default OrganizationStructure; 