import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * 📱 CONTRÔLEUR PLAINTES MOBILE - NIAXTU
 * 
 * Ce contrôleur suit exactement le PROMPT_ENREGISTREMENT_PLAINTES_MOBILE.md
 * Aucune déviation de la structure n'est autorisée !
 */

/**
 * Valide les données de plainte mobile selon le prompt
 */
function validateMobileComplaint(data) {
  console.log('[MOBILE] Début validation des données');
  
  const errors = [];
  
  // Validation titre
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Le titre est obligatoire et ne peut pas être vide');
  }
  
  // Validation description
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push('La description est obligatoire et ne peut pas être vide');
  }
  
  // Validation géolocalisation
  if (!data.latitude || typeof data.latitude !== 'number') {
    errors.push('La latitude est obligatoire et doit être un nombre');
  } else if (data.latitude < -90 || data.latitude > 90) {
    errors.push('La latitude doit être comprise entre -90 et 90');
  }
  
  if (!data.longitude || typeof data.longitude !== 'number') {
    errors.push('La longitude est obligatoire et doit être un nombre');
  } else if (data.longitude < -180 || data.longitude > 180) {
    errors.push('La longitude doit être comprise entre -180 et 180');
  }
  
  // Validation userId
  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('L\'ID utilisateur est obligatoire');
  }
  
  // Validation statut (si fourni)
  const validStatuses = ['new', 'in_progress', 'resolved', 'rejected'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push(`Le statut doit être l'un de: ${validStatuses.join(', ')}`);
  }
  
  const isValid = errors.length === 0;
  
  if (isValid) {
    console.log('[MOBILE] Validation OK');
  } else {
    console.log('[MOBILE] Erreurs de validation:', errors);
  }
  
  return { isValid, errors };
}

/**
 * Prépare le document Firestore selon la structure obligatoire
 */
function prepareFirestoreDocument(data) {
  console.log('[MOBILE] Préparation du document Firestore');
  
  const now = Timestamp.now();
  
  const document = {
    // === CHAMPS OBLIGATOIRES ===
    title: data.title.trim(),
    description: data.description.trim(),
    createdAt: now,
    lastUpdated: now,
    status: "new", // Toujours "new" pour une nouvelle plainte
    userId: data.userId,
    
    // === GÉOLOCALISATION OBLIGATOIRE ===
    latitude: data.latitude,
    longitude: data.longitude,
    address: `${data.latitude}, ${data.longitude}`, // Format exact requis
    
    // === STRUCTURE ADMINISTRATIVE ===
    ministere: data.ministere || null,
    direction: data.direction || null,
    service: data.service || null,
    
    // === STRUCTURE PRIVÉE (valeurs par défaut) ===
    isPrivee: data.isPrivee || false,
    nomStructurePrivee: data.nomStructurePrivee || "",
    emailStructurePrivee: data.emailStructurePrivee || "",
    telephoneStructurePrivee: data.telephoneStructurePrivee || "",
    
    // === CLASSIFICATION ===
    typologies: Array.isArray(data.typologies) ? data.typologies : [],
    
    // === MÉDIAS ===
    media: Array.isArray(data.media) ? data.media : []
  };
  
  console.log('[MOBILE] Document préparé:', {
    ...document,
    createdAt: 'Timestamp',
    lastUpdated: 'Timestamp'
  });
  
  return document;
}

/**
 * 📱 Créer une nouvelle plainte mobile
 * Suit exactement le prompt PROMPT_ENREGISTREMENT_PLAINTES_MOBILE.md
 */
export const createMobileComplaint = async (req, res) => {
  try {
    console.log('[MOBILE] Début enregistrement plainte');
    console.log('[MOBILE] Données reçues:', req.body);
    
    // Étape 1 : Validation obligatoire
    const validation = validateMobileComplaint(req.body);
    if (!validation.isValid) {
      console.log('[MOBILE] Validation échouée:', validation.errors);
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: validation.errors
      });
    }
    
    // Étape 2 : Préparation du document
    const documentFirestore = prepareFirestoreDocument(req.body);
    
    // Étape 3 : Enregistrement dans Firestore
    console.log('[MOBILE] Enregistrement dans Firestore...');
    const docRef = await db.collection('complaints').add(documentFirestore);
    console.log('[MOBILE] Plainte enregistrée avec ID:', docRef.id);
    
    // Étape 4 : Réponse de succès
    console.log('[MOBILE] Enregistrement terminé avec succès');
    
    res.status(201).json({
      success: true,
      message: "Plainte enregistrée avec succès",
      data: {
        id: docRef.id,
        status: "new",
        createdAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('[MOBILE] Erreur enregistrement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement de la plainte',
      details: error.message
    });
  }
};

/**
 * 📱 Récupérer les plaintes d'un utilisateur mobile
 */
export const getUserMobileComplaints = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 20, page = 1 } = req.query;
    
    console.log('[MOBILE] Récupération plaintes utilisateur:', userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur requis'
      });
    }
    
    let query = db.collection('complaints').where('userId', '==', userId);
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    query = query.orderBy('createdAt', 'desc').limit(parseInt(limit)).offset(offset);
    
    const snapshot = await query.get();
    const complaints = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      complaints.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        status: data.status,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        typologies: data.typologies || [],
        media: data.media || [],
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        lastUpdated: data.lastUpdated?.toDate?.() || data.lastUpdated
      });
    });
    
    console.log('[MOBILE] Trouvé', complaints.length, 'plaintes pour utilisateur', userId);
    
    res.json({
      success: true,
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: complaints.length
      }
    });
    
  } catch (error) {
    console.error('[MOBILE] Erreur récupération plaintes utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des plaintes'
    });
  }
};

/**
 * 📱 Récupérer une plainte spécifique
 */
export const getMobileComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query; // Pour vérifier la propriété
    
    console.log('[MOBILE] Récupération plainte:', id);
    
    const doc = await db.collection('complaints').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Plainte non trouvée'
      });
    }
    
    const complaint = doc.data();
    
    // Vérifier que l'utilisateur est propriétaire (si userId fourni)
    if (userId && complaint.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé à cette plainte'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...complaint,
        createdAt: complaint.createdAt?.toDate?.() || complaint.createdAt,
        lastUpdated: complaint.lastUpdated?.toDate?.() || complaint.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('[MOBILE] Erreur récupération plainte:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la plainte'
    });
  }
};

/**
 * 📱 Mettre à jour le statut d'une plainte (admin uniquement)
 */
export const updateMobileComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    
    console.log('[MOBILE] Mise à jour statut plainte:', id, 'vers', status);
    
    // Validation du statut
    const validStatuses = ['new', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Statut invalide. Doit être l'un de: ${validStatuses.join(', ')}`
      });
    }
    
    const doc = await db.collection('complaints').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Plainte non trouvée'
      });
    }
    
    const updateData = {
      status: status,
      lastUpdated: Timestamp.now()
    };
    
    // Ajouter resolvedAt si résolu
    if (status === 'resolved') {
      updateData.resolvedAt = Timestamp.now();
    }
    
    await db.collection('complaints').doc(id).update(updateData);
    
    console.log('[MOBILE] Statut mis à jour avec succès');
    
    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: {
        id: id,
        status: status,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('[MOBILE] Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du statut'
    });
  }
};

/**
 * 📊 Statistiques des plaintes mobiles
 */
export const getMobileComplaintsStats = async (req, res) => {
  try {
    console.log('[MOBILE] Récupération statistiques plaintes');
    
    const snapshot = await db.collection('complaints').get();
    
    const stats = {
      total: 0,
      new: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
      byTypology: {},
      byMinistere: {}
    };
    
    snapshot.forEach(doc => {
      const data = doc.data();
      stats.total++;
      
      // Compter par statut
      if (data.status) {
        stats[data.status] = (stats[data.status] || 0) + 1;
      }
      
      // Compter par typologie
      if (data.typologies && Array.isArray(data.typologies)) {
        data.typologies.forEach(typo => {
          stats.byTypology[typo] = (stats.byTypology[typo] || 0) + 1;
        });
      }
      
      // Compter par ministère
      if (data.ministere) {
        stats.byMinistere[data.ministere] = (stats.byMinistere[data.ministere] || 0) + 1;
      }
    });
    
    console.log('[MOBILE] Statistiques calculées:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('[MOBILE] Erreur récupération statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
}; 