// Modèle plainte basé sur le workflow mobile Flutter
export const ComplaintStatus = {
  PENDING: 'en-attente',
  IN_PROGRESS: 'en-traitement',
  RESOLVED: 'resolue',
  REJECTED: 'rejetee'
};

export const ComplaintPriority = {
  LOW: 'faible',
  MEDIUM: 'moyenne',
  HIGH: 'elevee',
  URGENT: 'urgente'
};

// Types de plaintes correspondant au mobile
export const ComplaintTypes = {
  PAYMENT_DELAY: 'Retard de paiement',
  UNSATISFACTORY_SERVICE: 'Prestation insatisfaisante',
  ADMINISTRATIVE_PROBLEM: 'Problème administratif',
  OTHER: 'Autre'
};

// Types de cibles correspondant au mobile
export const TargetTypes = {
  PUBLIC_STRUCTURE: 'Structure publique',
  PRIVATE_STRUCTURE: 'Structure privée',
  INDIVIDUAL: 'Particulier'
};

// Types de typologie (méthodes de soumission)
export const SubmissionTypes = {
  VOCAL: 'Vocal',
  WRITTEN: 'Exposé',
  FOLLOW_UP: 'Suite exposé'
};

export const ComplaintSchema = {
  id: { type: 'string', description: 'ID unique de la plainte' },
  title: { type: 'string', required: true, description: 'Titre/Type de la plainte' },
  description: { type: 'string', required: true, description: 'Description détaillée' },
  
  // Types selon le workflow mobile
  complaintType: { 
    type: 'string', 
    enum: Object.values(ComplaintTypes),
    required: true, 
    description: 'Type de plainte sélectionné' 
  },
  targetType: { 
    type: 'string', 
    enum: Object.values(TargetTypes),
    required: true, 
    description: 'Type de cible (publique/privée/particulier)' 
  },
  submissionTypes: {
    type: 'array',
    items: { type: 'string', enum: Object.values(SubmissionTypes) },
    description: 'Types de soumission (vocal, écrit, suite)'
  },
  
  // Structure publique (hiérarchie ministère > direction > service)
  publicStructure: {
    type: 'object',
    properties: {
      ministereId: { type: 'string', description: 'ID du ministère' },
      ministereName: { type: 'string', description: 'Nom du ministère' },
      directionId: { type: 'string', description: 'ID de la direction' },
      directionName: { type: 'string', description: 'Nom de la direction' },
      serviceId: { type: 'string', description: 'ID du service' },
      serviceName: { type: 'string', description: 'Nom du service' }
    },
    description: 'Informations de la structure publique'
  },
  
  // Structure privée
  privateStructure: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Nom de la structure privée' },
      phone: { type: 'string', description: 'Téléphone (9 chiffres, commence par 70/76/77/78)' },
      email: { type: 'string', description: 'Email de la structure' }
    },
    description: 'Informations de la structure privée'
  },
  
  // Géolocalisation
  location: {
    type: 'object',
    properties: {
      latitude: { type: 'number', description: 'Latitude GPS' },
      longitude: { type: 'number', description: 'Longitude GPS' },
      address: { type: 'string', description: 'Adresse formatée' }
    },
    required: true,
    description: 'Localisation de la plainte'
  },
  
  // Médias
  mediaFiles: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['image', 'audio'], description: 'Type de média' },
        url: { type: 'string', description: 'URL du fichier' },
        filename: { type: 'string', description: 'Nom du fichier' },
        size: { type: 'number', description: 'Taille en bytes' },
        mimeType: { type: 'string', description: 'Type MIME' },
        duration: { type: 'number', description: 'Durée en secondes (pour audio)' }
      }
    },
    description: 'Fichiers médias attachés (max 5 images + 1 audio)'
  },
  
  // Audio vocal
  vocalRecording: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'URL de l\'enregistrement' },
      duration: { type: 'number', description: 'Durée en secondes' },
      filename: { type: 'string', description: 'Nom du fichier audio' }
    },
    description: 'Enregistrement vocal si activé'
  },
  
  // Statut et suivi
  status: { 
    type: 'string', 
    enum: Object.values(ComplaintStatus), 
    default: ComplaintStatus.PENDING,
    description: 'Statut de la plainte' 
  },
  priority: { 
    type: 'string', 
    enum: Object.values(ComplaintPriority), 
    default: ComplaintPriority.MEDIUM,
    description: 'Priorité de la plainte' 
  },
  
  // Métadonnées
  submittedBy: { type: 'string', required: true, description: 'UID de l\'utilisateur' },
  assignedTo: { type: 'string', description: 'UID de l\'agent assigné' },
  
  // Horodatage
  createdAt: { type: 'string', format: 'date-time', description: 'Date de création' },
  updatedAt: { type: 'string', format: 'date-time', description: 'Date de mise à jour' },
  resolvedAt: { type: 'string', format: 'date-time', description: 'Date de résolution' },
  
  // Commentaires et suivi
  comments: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID du commentaire' },
        text: { type: 'string', description: 'Contenu du commentaire' },
        authorId: { type: 'string', description: 'ID de l\'auteur' },
        authorName: { type: 'string', description: 'Nom de l\'auteur' },
        createdAt: { type: 'string', format: 'date-time', description: 'Date de création' },
        isInternal: { type: 'boolean', description: 'Commentaire interne' }
      }
    }
  },
  
  // Brouillon
  isDraft: { type: 'boolean', default: false, description: 'Plainte en brouillon' },
  
  // Tags et classification
  tags: {
    type: 'array',
    items: { type: 'string' },
    description: 'Tags associés'
  },
  
  // Historique des modifications
  history: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'Action effectuée' },
        userId: { type: 'string', description: 'ID de l\'utilisateur' },
        timestamp: { type: 'string', format: 'date-time', description: 'Horodatage' },
        changes: { type: 'object', description: 'Détails des modifications' }
      }
    }
  }
};

// Validation pour numéro de téléphone sénégalais
export const validateSenegalPhoneNumber = (phone) => {
  if (!phone || phone.length !== 9) return false;
  const validPrefixes = ['70', '76', '77', '78'];
  const prefix = phone.substring(0, 2);
  return validPrefixes.includes(prefix) && /^\d{9}$/.test(phone);
};

// Validation email
export const validateEmail = (email) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
}; 