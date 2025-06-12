// Modèle secteur
export const SectorSchema = {
  id: { type: 'string', description: 'ID unique du secteur' },
  name: { type: 'string', required: true, description: 'Nom du secteur' },
  description: { type: 'string', description: 'Description du secteur' },
  icon: { type: 'string', description: 'Icône FontAwesome' },
  color: { type: 'string', description: 'Couleur hexadécimale' },
  isActive: { type: 'boolean', default: true, description: 'Secteur actif' },
  order: { type: 'number', description: 'Ordre d\'affichage' },
  createdAt: { type: 'string', format: 'date-time', description: 'Date de création' },
  updatedAt: { type: 'string', format: 'date-time', description: 'Date de mise à jour' },
  createdBy: { type: 'string', description: 'UID du créateur' }
};

// Modèle sous-secteur
export const SubSectorSchema = {
  id: { type: 'string', description: 'ID unique du sous-secteur' },
  name: { type: 'string', required: true, description: 'Nom du sous-secteur' },
  description: { type: 'string', description: 'Description du sous-secteur' },
  sectorId: { type: 'string', required: true, description: 'ID du secteur parent' },
  icon: { type: 'string', description: 'Icône FontAwesome' },
  isActive: { type: 'boolean', default: true, description: 'Sous-secteur actif' },
  order: { type: 'number', description: 'Ordre d\'affichage' },
  createdAt: { type: 'string', format: 'date-time', description: 'Date de création' },
  updatedAt: { type: 'string', format: 'date-time', description: 'Date de mise à jour' },
  createdBy: { type: 'string', description: 'UID du créateur' }
};

// Modèle structure
export const StructureSchema = {
  id: { type: 'string', description: 'ID unique de la structure' },
  name: { type: 'string', required: true, description: 'Nom de la structure' },
  description: { type: 'string', description: 'Description de la structure' },
  sectorId: { type: 'string', required: true, description: 'ID du secteur' },
  subSectorId: { type: 'string', description: 'ID du sous-secteur' },
  type: { type: 'string', description: 'Type de structure' },
  location: {
    type: 'object',
    properties: {
      address: { type: 'string', description: 'Adresse' },
      city: { type: 'string', description: 'Ville' },
      zipCode: { type: 'string', description: 'Code postal' },
      coordinates: {
        type: 'object',
        properties: {
          lat: { type: 'number', description: 'Latitude' },
          lng: { type: 'number', description: 'Longitude' }
        }
      }
    }
  },
  contact: {
    type: 'object',
    properties: {
      phone: { type: 'string', description: 'Téléphone' },
      email: { type: 'string', description: 'Email' },
      website: { type: 'string', description: 'Site web' },
      manager: { type: 'string', description: 'Responsable' }
    }
  },
  isActive: { type: 'boolean', default: true, description: 'Structure active' },
  capacity: { type: 'number', description: 'Capacité' },
  operatingHours: {
    type: 'object',
    properties: {
      monday: { type: 'string', description: 'Horaires lundi' },
      tuesday: { type: 'string', description: 'Horaires mardi' },
      wednesday: { type: 'string', description: 'Horaires mercredi' },
      thursday: { type: 'string', description: 'Horaires jeudi' },
      friday: { type: 'string', description: 'Horaires vendredi' },
      saturday: { type: 'string', description: 'Horaires samedi' },
      sunday: { type: 'string', description: 'Horaires dimanche' }
    }
  },
  createdAt: { type: 'string', format: 'date-time', description: 'Date de création' },
  updatedAt: { type: 'string', format: 'date-time', description: 'Date de mise à jour' },
  createdBy: { type: 'string', description: 'UID du créateur' }
};

// Types de plaintes et cibles
export const ComplaintTypeSchema = {
  id: { type: 'string', description: 'ID unique du type' },
  name: { type: 'string', required: true, description: 'Nom du type' },
  description: { type: 'string', description: 'Description du type' },
  sectorId: { type: 'string', description: 'ID du secteur associé' },
  isActive: { type: 'boolean', default: true, description: 'Type actif' },
  severity: { 
    type: 'string', 
    enum: ['faible', 'moyenne', 'elevee', 'critique'],
    default: 'moyenne',
    description: 'Sévérité par défaut' 
  },
  autoAssignment: { type: 'boolean', default: false, description: 'Attribution automatique' },
  createdAt: { type: 'string', format: 'date-time', description: 'Date de création' },
  updatedAt: { type: 'string', format: 'date-time', description: 'Date de mise à jour' },
  createdBy: { type: 'string', description: 'UID du créateur' }
};

export const TargetTypeSchema = {
  id: { type: 'string', description: 'ID unique du type de cible' },
  name: { type: 'string', required: true, description: 'Nom du type de cible' },
  description: { type: 'string', description: 'Description du type de cible' },
  category: { type: 'string', description: 'Catégorie de cible' },
  isActive: { type: 'boolean', default: true, description: 'Type actif' },
  createdAt: { type: 'string', format: 'date-time', description: 'Date de création' },
  updatedAt: { type: 'string', format: 'date-time', description: 'Date de mise à jour' },
  createdBy: { type: 'string', description: 'UID du créateur' }
}; 