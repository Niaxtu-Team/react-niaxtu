import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createMinistere,
  getMinisteres,
  createDirection,
  createService,
  createBureau,
  getArbreHierarchique
} from '../controllers/organizationController.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);

// ==================== MINISTÈRES ====================

/**
 * @swagger
 * /api/organization/ministeres:
 *   get:
 *     summary: 📋 Récupérer tous les ministères
 *     description: Liste paginée de tous les ministères actifs
 *     tags: [Structure Organisationnelle]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom ou code
 *     responses:
 *       200:
 *         description: Liste des ministères récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 ministeres:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ministere'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/ministeres', getMinisteres);

/**
 * @swagger
 * /api/organization/ministeres:
 *   post:
 *     summary: ➕ Créer un nouveau ministère
 *     description: Créer un nouveau ministère dans la structure organisationnelle
 *     tags: [Structure Organisationnelle]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - code
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du ministère
 *                 example: "Ministère de l'Intérieur"
 *               code:
 *                 type: string
 *                 description: Code unique du ministère
 *                 example: "MIN_INT"
 *               description:
 *                 type: string
 *                 description: Description du ministère
 *                 example: "Ministère chargé de la sécurité intérieure"
 *               ministre:
 *                 type: string
 *                 description: Nom du ministre
 *                 example: "Jean Dupont"
 *               couleur:
 *                 type: string
 *                 description: Couleur thématique (hex)
 *                 example: "#3b82f6"
 *           examples:
 *             ministere_interieur:
 *               summary: Ministère de l'Intérieur
 *               value:
 *                 nom: "Ministère de l'Intérieur"
 *                 code: "MIN_INT"
 *                 description: "Ministère chargé de la sécurité intérieure et de l'administration territoriale"
 *                 ministre: "Jean Dupont"
 *                 couleur: "#dc2626"
 *     responses:
 *       201:
 *         description: Ministère créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 */
router.post('/ministeres', createMinistere);

/**
 * @swagger
 * /api/organization/seed-data:
 *   post:
 *     summary: 🌱 Créer des données de test
 *     description: Créer des ministères, directions, services et bureaux de test
 *     tags: [Structure Organisationnelle]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Données de test créées avec succès
 *       401:
 *         description: Non authentifié
 */
router.post('/seed-data', async (req, res) => {
  try {
    const { db } = await import('../config/firebase.js');
    
    // Créer des ministères de test
    const ministeresTest = [
      {
        nom: "Ministère de l'Intérieur",
        code: "MIN_INT",
        description: "Ministère chargé de la sécurité intérieure et de l'administration territoriale",
        ministre: "Jean Dupont",
        couleur: "#dc2626",
        isActif: true,
        dateCreation: new Date(),
        dateMiseAJour: new Date(),
        creePar: req.user?.uid || 'system'
      },
      {
        nom: "Ministère de la Justice",
        code: "MIN_JUS",
        description: "Ministère chargé de la justice et des affaires juridiques",
        ministre: "Marie Martin",
        couleur: "#7c3aed",
        isActif: true,
        dateCreation: new Date(),
        dateMiseAJour: new Date(),
        creePar: req.user?.uid || 'system'
      },
      {
        nom: "Ministère de la Santé",
        code: "MIN_SAN",
        description: "Ministère chargé de la santé publique et des affaires sociales",
        ministre: "Pierre Durand",
        couleur: "#059669",
        isActif: true,
        dateCreation: new Date(),
        dateMiseAJour: new Date(),
        creePar: req.user?.uid || 'system'
      }
    ];
    
    const ministeresCreated = [];
    for (const ministere of ministeresTest) {
      const docRef = await db.collection('ministères').add(ministere);
      ministeresCreated.push({ id: docRef.id, ...ministere });
    }
    
    res.status(201).json({
      success: true,
      message: 'Données de test créées avec succès',
      data: {
        ministères: ministeresCreated
      }
    });
    
  } catch (error) {
    console.error('Erreur création données de test:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création des données de test'
    });
  }
});

// ==================== DIRECTIONS ====================

/**
 * @swagger
 * /api/organization/directions:
 *   post:
 *     summary: ➕ Créer une nouvelle direction
 *     description: Créer une direction rattachée à un ministère
 *     tags: [Structure Organisationnelle]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - code
 *               - ministereId
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de la direction
 *                 example: "Direction Générale de la Sécurité Publique"
 *               code:
 *                 type: string
 *                 description: Code unique de la direction
 *                 example: "DGSP"
 *               description:
 *                 type: string
 *                 description: Description de la direction
 *               ministereId:
 *                 type: string
 *                 description: ID du ministère parent
 *                 example: "ministere_123"
 *               directeur:
 *                 type: string
 *                 description: Nom du directeur
 *                 example: "Marie Martin"
 *               typeDirection:
 *                 type: string
 *                 enum: [Générale, Régionale, Départementale]
 *                 description: Type de direction
 *                 example: "Générale"
 *     responses:
 *       201:
 *         description: Direction créée avec succès
 *       400:
 *         description: Données invalides ou ministère parent introuvable
 */
router.post('/directions', createDirection);

// ==================== SERVICES ====================

/**
 * @swagger
 * /api/organization/services:
 *   post:
 *     summary: ➕ Créer un nouveau service
 *     description: Créer un service rattaché à une direction
 *     tags: [Structure Organisationnelle]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - code
 *               - directionId
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du service
 *                 example: "Service de Police Municipale"
 *               code:
 *                 type: string
 *                 description: Code unique du service
 *                 example: "SPM"
 *               description:
 *                 type: string
 *                 description: Description du service
 *               directionId:
 *                 type: string
 *                 description: ID de la direction parent
 *                 example: "direction_456"
 *               chefService:
 *                 type: string
 *                 description: Nom du chef de service
 *                 example: "Pierre Durand"
 *               typeService:
 *                 type: string
 *                 enum: [Opérationnel, Support, Administratif]
 *                 description: Type de service
 *                 example: "Opérationnel"
 *     responses:
 *       201:
 *         description: Service créé avec succès
 *       400:
 *         description: Données invalides ou direction parent introuvable
 */
router.post('/services', createService);

// ==================== BUREAUX ====================

/**
 * @swagger
 * /api/organization/bureaux:
 *   post:
 *     summary: ➕ Créer un nouveau bureau
 *     description: Créer un bureau rattaché à un service
 *     tags: [Structure Organisationnelle]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - code
 *               - serviceId
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du bureau
 *                 example: "Bureau des Permis de Conduire"
 *               code:
 *                 type: string
 *                 description: Code unique du bureau
 *                 example: "BPC"
 *               description:
 *                 type: string
 *                 description: Description du bureau
 *               serviceId:
 *                 type: string
 *                 description: ID du service parent
 *                 example: "service_789"
 *               responsable:
 *                 type: string
 *                 description: Nom du responsable
 *                 example: "Sophie Leblanc"
 *               typeBureau:
 *                 type: string
 *                 enum: [Accueil, Traitement, Contrôle]
 *                 description: Type de bureau
 *                 example: "Accueil"
 *     responses:
 *       201:
 *         description: Bureau créé avec succès
 *       400:
 *         description: Données invalides ou service parent introuvable
 */
router.post('/bureaux', createBureau);

// ==================== HIÉRARCHIE COMPLÈTE ====================

/**
 * @swagger
 * /api/organization/arbre:
 *   get:
 *     summary: 🌳 Récupérer l'arbre hiérarchique complet
 *     description: Obtenir la structure organisationnelle complète avec tous les niveaux
 *     tags: [Structure Organisationnelle]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Arbre hiérarchique récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 arbre:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "ministere_123"
 *                       nom:
 *                         type: string
 *                         example: "Ministère de l'Intérieur"
 *                       code:
 *                         type: string
 *                         example: "MIN_INT"
 *                       directions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             nom:
 *                               type: string
 *                             services:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   nom:
 *                                     type: string
 *                                   bureaux:
 *                                     type: array
 *                                     items:
 *                                       type: object
 *                 statistiques:
 *                   type: object
 *                   properties:
 *                     ministeres:
 *                       type: number
 *                       example: 5
 *                     directions:
 *                       type: number
 *                       example: 25
 *                     services:
 *                       type: number
 *                       example: 120
 *                     bureaux:
 *                       type: number
 *                       example: 450
 *       401:
 *         description: Non authentifié
 */
router.get('/arbre', getArbreHierarchique);

export default router; 