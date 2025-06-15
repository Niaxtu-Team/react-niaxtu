import express from 'express';
import { db } from '../config/firebase.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { UserPermissions } from '../models/User.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Plaintes Mobile
 *   description: 📱 API optimisée pour les plaintes provenant de l'application mobile
 */

// ===================== FONCTIONS UTILITAIRES =====================

/**
 * Convertit une plainte mobile vers le format unifié
 */
function convertMobileToUnified(mobileData, userId) {
  const now = new Date().toISOString();
  
  return {
    // === INFORMATIONS PRINCIPALES ===
    id: null, // Sera généré par Firestore
    title: mobileData.title || "Plainte mobile",
    description: mobileData.description || "",
    
    // === CLASSIFICATION ===
    type: mobileData.type || "Général",
    secteur: mobileData.secteur || "À classifier",
    sousSecteur: mobileData.sousSecteur || "",
    typologies: Array.isArray(mobileData.typologies) ? mobileData.typologies : [],
    priorite: mobileData.priorite || "moyenne",
    
    // === STRUCTURE ADMINISTRATIVE ===
    ministere: mobileData.ministere || null,
    direction: mobileData.direction || null,
    service: mobileData.service || null,
    
    // === STRUCTURE PRIVÉE ===
    isPrivee: mobileData.isPrivee || false,
    nomStructurePrivee: mobileData.nomStructurePrivee || "",
    emailStructurePrivee: mobileData.emailStructurePrivee || "",
    telephoneStructurePrivee: mobileData.telephoneStructurePrivee || "",
    
    // === GÉOLOCALISATION (format unifié) ===
    latitude: mobileData.latitude || null,
    longitude: mobileData.longitude || null,
    address: mobileData.address || `${mobileData.latitude}, ${mobileData.longitude}`,
    localisation: {
      coordonnees: {
        latitude: mobileData.latitude || null,
        longitude: mobileData.longitude || null
      },
      adresse: mobileData.address || `${mobileData.latitude}, ${mobileData.longitude}`,
      ville: "À déterminer", // À enrichir via géocodage
      quartier: "À déterminer",
      region: "Dakar" // Par défaut pour le Sénégal
    },
    
    // === PLAIGNANT ===
    userId: userId,
    plaignantInfo: {
      nom: "Utilisateur Mobile",
      telephone: "",
      email: "",
      isAnonymous: true
    },
    
    // === MÉDIAS ===
    media: Array.isArray(mobileData.media) ? mobileData.media : [],
    pieceJointe: Array.isArray(mobileData.media) ? mobileData.media.map(m => ({
      url: m.url || m.uri,
      nom: m.name || m.filename || "media_mobile",
      type: m.type || m.mimeType || "unknown",
      taille: m.size || 0,
      uploadedAt: now
    })) : [],
    
    // === STATUT ET WORKFLOW ===
    status: mobileData.status || "new",
    statusHistory: [{
      status: mobileData.status || "new",
      timestamp: now,
      userId: userId,
      comment: "Plainte créée depuis l'application mobile"
    }],
    
    // === DATES ===
    createdAt: mobileData.createdAt || now,
    lastUpdated: mobileData.lastUpdated || now,
    resolvedAt: null,
    closedAt: null,
    
    // === MÉTADONNÉES ===
    source: "mobile",
    version: "1.0",
    tags: [],
    visibility: "public",
    
    // === TRAITEMENT ===
    assignedTo: null,
    estimatedResolution: null,
    actualResolution: null,
    satisfactionScore: null,
    followUpRequired: false,
    
    // === COMMUNICATION ===
    comments: [],
    notifications: {
      email: false,
      sms: false,
      push: true
    }
  };
}

/**
 * Enrichit automatiquement une plainte
 */
async function enrichComplaint(complaint) {
  try {
    // Géocodage inverse pour enrichir l'adresse (simulation)
    if (complaint.latitude && complaint.longitude) {
      // TODO: Intégrer un service de géocodage réel
      complaint.localisation.ville = "Dakar"; // Par défaut
      complaint.localisation.region = "Dakar";
    }
    
    // Attribution automatique de structure si manquante
    if (!complaint.ministere && complaint.typologies.length > 0) {
      // TODO: Logique d'attribution automatique basée sur les typologies
      console.log('[MOBILE] Attribution automatique de structure à implémenter');
    }
    
    return complaint;
  } catch (error) {
    console.warn('[MOBILE] Erreur enrichissement:', error);
    return complaint;
  }
}

/**
 * Valide une plainte mobile
 */
function validateMobileComplaint(data) {
  const errors = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push("Le titre est requis");
  }
  
  if (!data.description || data.description.trim().length === 0) {
    errors.push("La description est requise");
  }
  
  if (!data.latitude || !data.longitude) {
    errors.push("La géolocalisation est requise");
  }
  
  if (data.latitude && (data.latitude < -90 || data.latitude > 90)) {
    errors.push("Latitude invalide");
  }
  
  if (data.longitude && (data.longitude < -180 || data.longitude > 180)) {
    errors.push("Longitude invalide");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ===================== ROUTES API =====================

/**
 * @swagger
 * /api/complaints-mobile:
 *   post:
 *     summary: 📱 Créer une plainte depuis l'application mobile
 *     description: Crée une nouvelle plainte avec le format mobile actuel, convertie automatiquement vers le format unifié
 *     tags: [Plaintes Mobile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - latitude
 *               - longitude
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre de la plainte
 *                 example: "Retard de paiement"
 *               description:
 *                 type: string
 *                 description: Description détaillée
 *                 example: "Description du problème rencontré"
 *               latitude:
 *                 type: number
 *                 description: Latitude GPS
 *                 example: 14.7140483
 *               longitude:
 *                 type: number
 *                 description: Longitude GPS
 *                 example: -17.4657383
 *               address:
 *                 type: string
 *                 description: Adresse formatée
 *                 example: "14.7140483, -17.4657383"
 *               ministere:
 *                 type: string
 *                 description: ID du ministère
 *                 example: "9EUW8muTQXMlXyC3P4f8"
 *               direction:
 *                 type: string
 *                 description: ID de la direction
 *                 example: "YtUQkyQpGjICl6lPVBog"
 *               service:
 *                 type: string
 *                 description: ID du service
 *                 example: "KHhejHYr7MzGgUYit7q8"
 *               typologies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des typologies
 *                 example: ["Exposé"]
 *               isPrivee:
 *                 type: boolean
 *                 description: Structure privée ou publique
 *                 example: false
 *               nomStructurePrivee:
 *                 type: string
 *                 description: Nom structure privée (si applicable)
 *               emailStructurePrivee:
 *                 type: string
 *                 description: Email structure privée (si applicable)
 *               telephoneStructurePrivee:
 *                 type: string
 *                 description: Téléphone structure privée (si applicable)
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     type:
 *                       type: string
 *                     name:
 *                       type: string
 *                     size:
 *                       type: number
 *                 description: Fichiers médias attachés
 *     responses:
 *       201:
 *         description: Plainte créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Plainte créée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "abc123def456"
 *                     numero:
 *                       type: string
 *                       example: "PLT-2024-001234"
 *                     status:
 *                       type: string
 *                       example: "new"
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Authentification requise
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('[MOBILE] Création plainte mobile:', req.body);
    
    // Validation des données
    const validation = validateMobileComplaint(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: validation.errors
      });
    }
    
    // Conversion vers format unifié
    let unifiedComplaint = convertMobileToUnified(req.body, req.user.uid);
    
    // Enrichissement automatique
    unifiedComplaint = await enrichComplaint(unifiedComplaint);
    
    // Génération du numéro de plainte
    const numero = `PLT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    unifiedComplaint.numero = numero;
    
    // Sauvegarde dans Firestore
    const docRef = await db.collection('complaints').add(unifiedComplaint);
    
    console.log('[MOBILE] Plainte créée avec ID:', docRef.id);
    
    res.status(201).json({
      success: true,
      message: "Plainte créée avec succès",
      data: {
        id: docRef.id,
        numero: numero,
        status: unifiedComplaint.status,
        createdAt: unifiedComplaint.createdAt
      }
    });
    
  } catch (error) {
    console.error('[MOBILE] Erreur création plainte:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la plainte',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/complaints-mobile/user:
 *   get:
 *     summary: 📱 Récupérer les plaintes de l'utilisateur mobile
 *     description: Récupère toutes les plaintes soumises par l'utilisateur connecté
 *     tags: [Plaintes Mobile]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, in_progress, resolved, rejected]
 *         description: Filtrer par statut
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre de résultats
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page de résultats
 *     responses:
 *       200:
 *         description: Liste des plaintes de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 */
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const userId = req.user.uid;
    
    console.log('[MOBILE] Récupération plaintes utilisateur:', userId);
    
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
      // Retourner un format optimisé pour le mobile
      complaints.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        status: data.status,
        createdAt: data.createdAt,
        lastUpdated: data.lastUpdated,
        numero: data.numero,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        typologies: data.typologies || [],
        media: data.media || []
      });
    });
    
    // Compter le total
    const countQuery = db.collection('complaints').where('userId', '==', userId);
    const countSnapshot = await countQuery.get();
    const total = countSnapshot.size;
    
    res.json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('[MOBILE] Erreur récupération plaintes utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des plaintes'
    });
  }
});

/**
 * @swagger
 * /api/complaints-mobile/{id}:
 *   get:
 *     summary: 📱 Récupérer une plainte spécifique
 *     description: Récupère les détails d'une plainte par son ID (utilisateur propriétaire uniquement)
 *     tags: [Plaintes Mobile]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la plainte
 *     responses:
 *       200:
 *         description: Détails de la plainte
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Plainte non trouvée
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const doc = await db.collection('complaints').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Plainte non trouvée'
      });
    }
    
    const complaint = doc.data();
    
    // Vérifier que l'utilisateur est propriétaire de la plainte
    if (complaint.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé à cette plainte'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...complaint
      }
    });
    
  } catch (error) {
    console.error('[MOBILE] Erreur récupération plainte:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la plainte'
    });
  }
});

/**
 * @swagger
 * /api/complaints-mobile/{id}/status:
 *   get:
 *     summary: 📱 Vérifier le statut d'une plainte
 *     description: Récupère uniquement le statut et les informations de suivi d'une plainte
 *     tags: [Plaintes Mobile]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la plainte
 *     responses:
 *       200:
 *         description: Statut de la plainte
 */
router.get('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const doc = await db.collection('complaints').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Plainte non trouvée'
      });
    }
    
    const complaint = doc.data();
    
    if (complaint.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: doc.id,
        status: complaint.status,
        createdAt: complaint.createdAt,
        lastUpdated: complaint.lastUpdated,
        resolvedAt: complaint.resolvedAt,
        statusHistory: complaint.statusHistory || [],
        assignedTo: complaint.assignedTo,
        estimatedResolution: complaint.estimatedResolution
      }
    });
    
  } catch (error) {
    console.error('[MOBILE] Erreur vérification statut:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du statut'
    });
  }
});

// ===================== ROUTES ADMINISTRATIVES =====================

/**
 * @swagger
 * /api/complaints-mobile/admin/all:
 *   get:
 *     summary: 🔧 Lister toutes les plaintes (Admin)
 *     description: Récupère toutes les plaintes avec filtres avancés (accès admin requis)
 *     tags: [Plaintes Mobile]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrer par statut
 *       - in: query
 *         name: ministere
 *         schema:
 *           type: string
 *         description: Filtrer par ministère
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre de résultats
 *     responses:
 *       200:
 *         description: Liste des plaintes
 *       403:
 *         description: Accès admin requis
 */
router.get('/admin/all', authenticateToken, requirePermission(UserPermissions.VIEW_COMPLAINTS), async (req, res) => {
  try {
    const { status, ministere, direction, limit = 50, page = 1 } = req.query;
    
    console.log('[MOBILE-ADMIN] Récupération toutes plaintes');
    
    let query = db.collection('complaints');
    
    if (status) query = query.where('status', '==', status);
    if (ministere) query = query.where('ministere', '==', ministere);
    if (direction) query = query.where('direction', '==', direction);
    
    const offset = (page - 1) * limit;
    query = query.orderBy('createdAt', 'desc').limit(parseInt(limit)).offset(offset);
    
    const snapshot = await query.get();
    const complaints = [];
    
    snapshot.forEach(doc => {
      complaints.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      data: complaints,
      count: complaints.length
    });
    
  } catch (error) {
    console.error('[MOBILE-ADMIN] Erreur récupération plaintes:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des plaintes'
    });
  }
});

export default router; 