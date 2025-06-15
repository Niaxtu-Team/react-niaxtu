import express from 'express';
import { 
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaintStatus,
  addComplaintComment,
  finalizeDraft,
  getComplaintTypes
} from '../controllers/complaintController.js';
import { 
  createMobileComplaint,
  getUserMobileComplaints,
  getMobileComplaint,
  updateMobileComplaintStatus,
  getMobileComplaintsStats
} from '../controllers/mobileComplaintController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { UserPermissions } from '../models/User.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Plaintes
 *   description: 📱 API unifiée pour la gestion des plaintes (structure mobile + web)
 */

// ===================== ROUTES PUBLIQUES =====================
router.get('/types', getComplaintTypes);

// ===================== ROUTES MOBILE SPÉCIALISÉES =====================
/**
 * @swagger
 * /api/complaints/mobile:
 *   post:
 *     summary: 📱 Créer une plainte mobile (structure unifiée)
 *     description: Crée une plainte selon la structure mobile avec validation stricte
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, latitude, longitude, userId]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Retard de paiement"
 *               description:
 *                 type: string
 *                 example: "Description du problème"
 *               latitude:
 *                 type: number
 *                 example: 14.7140483
 *               longitude:
 *                 type: number
 *                 example: -17.4657383
 *               userId:
 *                 type: string
 *                 example: "771282403"
 *               ministere:
 *                 type: string
 *                 example: "9EUW8muTQXMlXyC3P4f8"
 *               direction:
 *                 type: string
 *                 example: "YtUQkyQpGjICl6lPVBog"
 *               service:
 *                 type: string
 *                 example: "KHhejHYr7MzGgUYit7q8"
 *               typologies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Exposé"]
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Plainte créée avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/mobile', authenticateToken, createMobileComplaint);

/**
 * @swagger
 * /api/complaints/mobile/user/{userId}:
 *   get:
 *     summary: 📱 Récupérer les plaintes d'un utilisateur mobile
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 */
router.get('/mobile/user/:userId', authenticateToken, getUserMobileComplaints);

/**
 * @swagger
 * /api/complaints/mobile/stats:
 *   get:
 *     summary: 📊 Statistiques des plaintes mobiles
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 */
router.get('/mobile/stats', authenticateToken, requirePermission(UserPermissions.VIEW_REPORTS), getMobileComplaintsStats);

/**
 * @swagger
 * /api/complaints/mobile/{id}:
 *   get:
 *     summary: 📱 Récupérer une plainte mobile spécifique
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 */
router.get('/mobile/:id', authenticateToken, getMobileComplaint);

/**
 * @swagger
 * /api/complaints/mobile/{id}/status:
 *   put:
 *     summary: 📱 Mettre à jour le statut d'une plainte mobile
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 */
router.put('/mobile/:id/status', authenticateToken, requirePermission(UserPermissions.MANAGE_COMPLAINTS), updateMobileComplaintStatus);

// ===================== ROUTES GÉNÉRALES (ADAPTÉES) =====================
/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: 📋 Lister toutes les plaintes (structure unifiée)
 *     description: Récupère les plaintes avec filtres adaptés à la nouvelle structure
 *     tags: [Plaintes]
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
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrer par type
 *       - in: query
 *         name: secteur
 *         schema:
 *           type: string
 *         description: Filtrer par secteur
 *       - in: query
 *         name: ministere
 *         schema:
 *           type: string
 *         description: Filtrer par ministère (ID)
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *         description: Filtrer par direction (ID)
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *         description: Filtrer par service (ID)
 *       - in: query
 *         name: priorite
 *         schema:
 *           type: string
 *           enum: [basse, moyenne, elevee, urgente, critique]
 *         description: Filtrer par priorité
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filtrer par utilisateur
 *       - in: query
 *         name: isPrivee
 *         schema:
 *           type: boolean
 *         description: Filtrer par structure privée/publique
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre de résultats
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page de résultats
 *     responses:
 *       200:
 *         description: Liste des plaintes avec structure unifiée
 */
router.get('/', authenticateToken, getComplaints);

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: 📄 Récupérer une plainte spécifique (structure unifiée)
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 */
router.get('/:id', authenticateToken, getComplaint);

// Routes de création (rétrocompatibilité)
router.post('/', authenticateToken, createComplaint);

// Routes pour les brouillons (rétrocompatibilité)
router.put('/:id/finalize', authenticateToken, finalizeDraft);

// ===================== ROUTES ADMINISTRATIVES =====================
/**
 * @swagger
 * /api/complaints/{id}/status:
 *   put:
 *     summary: 🔧 Mettre à jour le statut d'une plainte (structure unifiée)
 *     description: Met à jour le statut selon la nouvelle structure avec historique
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, in_progress, resolved, rejected]
 *                 example: "in_progress"
 *               comment:
 *                 type: string
 *                 example: "Prise en charge de la plainte"
 *               assignedTo:
 *                 type: string
 *                 example: "admin_user_id"
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
 */
router.put('/:id/status', authenticateToken, requirePermission(UserPermissions.MANAGE_COMPLAINTS), updateComplaintStatus);

/**
 * @swagger
 * /api/complaints/{id}/comments:
 *   post:
 *     summary: 💬 Ajouter un commentaire à une plainte
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 */
router.post('/:id/comments', authenticateToken, addComplaintComment);

export default router; 