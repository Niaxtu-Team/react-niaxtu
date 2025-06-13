import { db } from '../config/firebase.js';
import { OrganizationUtils } from '../models/OrganizationStructure.js';

// ==================== MINISTÈRES ====================

// Créer un ministère
export const createMinistere = async (req, res) => {
  try {
    const { nom, code, description, ministre, adresse, contact, logo, couleur } = req.body;
    
    if (!nom || !code) {
      return res.status(400).json({
        success: false,
        error: 'Le nom et le code du ministère sont obligatoires'
      });
    }

    const ministereData = {
      nom: nom.trim(),
      code: code.toUpperCase(),
      description: description || '',
      ministre: ministre || '',
      adresse: adresse || {},
      contact: contact || {},
      logo: logo || '',
      couleur: couleur || '#3b82f6',
      isActif: true,
      dateCreation: new Date(),
      dateMiseAJour: new Date(),
      creePar: req.user.uid
    };

    const docRef = await db.collection('ministères').add(ministereData);
    
    res.status(201).json({
      success: true,
      message: 'Ministère créé avec succès',
      ministere: { id: docRef.id, ...ministereData }
    });

  } catch (error) {
    console.error('Erreur création ministère:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du ministère'
    });
  }
};

// Récupérer tous les ministères
export const getMinisteres = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    // Récupérer tous les ministères actifs (sans orderBy pour éviter l'erreur d'index)
    const snapshot = await db.collection('ministères')
      .where('isActif', '==', true)
      .get();
    
    let ministeres = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Trier côté application
    ministeres.sort((a, b) => a.nom.localeCompare(b.nom));
    
    if (search) {
      const searchLower = search.toLowerCase();
      ministeres = ministeres.filter(m => 
        m.nom.toLowerCase().includes(searchLower) ||
        m.code.toLowerCase().includes(searchLower)
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMinisteres = ministeres.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      ministeres: paginatedMinisteres,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(ministeres.length / limit),
        totalItems: ministeres.length,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération ministères:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des ministères'
    });
  }
};

// ==================== DIRECTIONS ====================

// Créer une direction
export const createDirection = async (req, res) => {
  try {
    const { nom, code, description, ministereId, directeur, typeDirection } = req.body;
    
    if (!nom || !code || !ministereId) {
      return res.status(400).json({
        success: false,
        error: 'Le nom, code et ministère parent sont obligatoires'
      });
    }

    const directionData = {
      nom: nom.trim(),
      code: code.toUpperCase(),
      description: description || '',
      ministereId,
      directeur: directeur || '',
      typeDirection: typeDirection || 'Générale',
      isActif: true,
      dateCreation: new Date(),
      dateMiseAJour: new Date(),
      creepar: req.user.uid
    };

    const docRef = await db.collection('directions').add(directionData);
    
    res.status(201).json({
      success: true,
      message: 'Direction créée avec succès',
      direction: { id: docRef.id, ...directionData }
    });

  } catch (error) {
    console.error('Erreur création direction:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la direction'
    });
  }
};

// ==================== SERVICES ====================

// Créer un service
export const createService = async (req, res) => {
  try {
    const { nom, code, description, directionId, chefService, typeService } = req.body;
    
    if (!nom || !code || !directionId) {
      return res.status(400).json({
        success: false,
        error: 'Le nom, code et direction parent sont obligatoires'
      });
    }

    const directionDoc = await db.collection('direction').doc(directionId).get();
    if (!directionDoc.exists) {
      return res.status(400).json({
        success: false,
        error: 'Direction parent introuvable'
      });
    }

    const serviceData = {
      nom: nom.trim(),
      code: code.toUpperCase(),
      description: description || '',
      directionId,
      ministereId: directionDoc.data().ministereId,
      chefService: chefService || '',
      typeService: typeService || 'Opérationnel',
      isActif: true,
      dateCreation: new Date(),
      dateMiseAJour: new Date(),
      creepar: req.user.uid
    };

    const docRef = await db.collection('service').add(serviceData);
    
    res.status(201).json({
      success: true,
      message: 'Service créé avec succès',
      service: { id: docRef.id, ...serviceData }
    });

  } catch (error) {
    console.error('Erreur création service:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du service'
    });
  }
};

// ==================== BUREAUX ====================

// Créer un bureau
export const createBureau = async (req, res) => {
  try {
    const { nom, code, description, serviceId, responsable, typeBureau } = req.body;
    
    if (!nom || !code || !serviceId) {
      return res.status(400).json({
        success: false,
        error: 'Le nom, code et service parent sont obligatoires'
      });
    }

    const serviceDoc = await db.collection('service').doc(serviceId).get();
    if (!serviceDoc.exists) {
      return res.status(400).json({
        success: false,
        error: 'Service parent introuvable'
      });
    }

    const serviceData = serviceDoc.data();

    const bureauData = {
      nom: nom.trim(),
      code: code.toUpperCase(),
      description: description || '',
      serviceId,
      directionId: serviceData.directionId,
      ministereId: serviceData.ministereId,
      responsable: responsable || '',
      typeBureau: typeBureau || 'Accueil',
      isActif: true,
      dateCreation: new Date(),
      dateMiseAJour: new Date(),
      creepar: req.user.uid
    };

    const docRef = await db.collection('bureau').add(bureauData);
    
    res.status(201).json({
      success: true,
      message: 'Bureau créé avec succès',
      bureau: { id: docRef.id, ...bureauData }
    });

  } catch (error) {
    console.error('Erreur création bureau:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du bureau'
    });
  }
};

// ==================== HIÉRARCHIE COMPLÈTE ====================

// Obtenir la hiérarchie complète
export const getHierarchieComplete = async (req, res) => {
  try {
    const { itemId, level } = req.params;
    
    const hierarchy = await OrganizationUtils.getFullHierarchy(itemId, level, db);
    
    if (!hierarchy) {
      return res.status(404).json({
        success: false,
        error: 'Élément introuvable'
      });
    }
    
    res.json({
      success: true,
      hierarchy
    });

  } catch (error) {
    console.error('Erreur récupération hiérarchie:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la hiérarchie'
    });
  }
};

// Obtenir l'arbre hiérarchique complet
export const getArbreHierarchique = async (req, res) => {
  try {
    // Récupérer tous les ministères actifs
    const ministeresSnapshot = await db.collection('ministères')
      .where('actif', '==', true)
      .get();
    
    // Convertir en array et trier côté application
    let ministeresArray = ministeresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    ministeresArray.sort((a, b) => a.nom.localeCompare(b.nom));
    
    const arbre = [];
    
    for (const ministere of ministeresArray) {
      // Récupérer les directions
      const directionsSnapshot = await db.collection('directions')
        .where('ministereId', '==', ministere.id)
        .where('actif', '==', true)
        .get();
      
      let directionsArray = directionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      directionsArray.sort((a, b) => a.nom.localeCompare(b.nom));
      ministere.directions = [];
      
      for (const direction of directionsArray) {
        // Récupérer les services
        const servicesSnapshot = await db.collection('services')
          .where('directionId', '==', direction.id)
          .where('actif', '==', true)
          .get();
        
        let servicesArray = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        servicesArray.sort((a, b) => a.nom.localeCompare(b.nom));
        direction.services = servicesArray;
        ministere.directions.push(direction);
      }
      
      arbre.push({
        id: ministere.id,
        nom: ministere.nom,
        code: ministere.code,
        description: ministere.description,
        contact: ministere.contact,
        directions: ministere.directions.map(direction => ({
          id: direction.id,
          nom: direction.nom,
          code: direction.code,
          description: direction.description,
          services: direction.services.map(service => ({
            id: service.id,
            nom: service.nom,
            code: service.code,
            description: service.description,
            localisation: service.localisation
          }))
        }))
      });
    }
    
    res.json({
      success: true,
      arbre,
      statistiques: {
        ministères: arbre.length,
        directions: arbre.reduce((acc, m) => acc + m.directions.length, 0),
        services: arbre.reduce((acc, m) => acc + m.directions.reduce((acc2, d) => acc2 + d.services.length, 0), 0)
      }
    });

  } catch (error) {
    console.error('Erreur récupération arbre hiérarchique:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'arbre hiérarchique'
    });
  }
};

// Recherche dans toute la hiérarchie
export const rechercherDansHierarchie = async (req, res) => {
  try {
    const { query: searchQuery, type } = req.query;
    
    if (!searchQuery || searchQuery.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'La recherche doit contenir au moins 2 caractères'
      });
    }
    
    const resultats = {
      ministères: [],
      directions: [],
      services: [],
      bureaux: []
    };
    
    const collections = type ? [type] : ['ministères', 'directions', 'services', 'bureaux'];
    const searchLower = searchQuery.toLowerCase();
    
    for (const collection of collections) {
      const snapshot = await db.collection(collection)
        .where('isActif', '==', true)
        .get();
      
      const items = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => 
          item.nom.toLowerCase().includes(searchLower) ||
          item.code.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
        );
      
      resultats[collection === 'ministères' ? 'ministères' : collection + 's'] = items;
    }
    
    const totalResultats = Object.values(resultats).reduce((acc, arr) => acc + arr.length, 0);
    
    res.json({
      success: true,
      query: searchQuery,
      resultats,
      totalResultats
    });

  } catch (error) {
    console.error('Erreur recherche hiérarchie:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche'
    });
  }
};

export default {
  createMinistere,
  getMinisteres,
  createDirection,
  createService,
  createBureau,
  getHierarchieComplete,
  getArbreHierarchique,
  rechercherDansHierarchie
}; 