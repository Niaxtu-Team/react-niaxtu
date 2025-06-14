import express from 'express';
import { 
  getAllStructures,
  createStructure,
  updateStructure,
  deleteStructure,
  getStructureById,
  searchStructures,
  exportStructures,
  
  // Nouvelles routes pour la hiérarchie ministère > direction > service
  getAllMinisteres,
  createMinistere,
  getAllDirections,
  getDirectionsByMinistere,
  createDirection,
  getAllServices,
  getServicesByDirection,
  getServicesByMinistereAndDirection,
  createService
} from '../controllers/structureController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { UserPermissions } from '../models/User.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Structures
 *   description: API pour la gestion des structures administratives (hiérarchie ministère > direction > service)
 */

// ===================== MINISTÈRES =====================

/**
 * @swagger
 * /api/structures/ministeres:
 *   get:
 *     summary: 🏛️ Récupérer tous les ministères
 *     description: Liste complète de tous les ministères avec statistiques et informations hiérarchiques
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: query
 *         name: actif
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif/inactif
 *         example: true
 *       - in: query
 *         name: withStats
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Inclure les statistiques (nombre de directions, services, plaintes)
 *         example: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page pour la pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre d'éléments par page
 *         example: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche (nom, code, description)
 *         example: "Education"
 *     responses:
 *       200:
 *         description: Liste de tous les ministères récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ministere'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalMinisteres:
 *                       type: integer
 *                       example: 25
 *                     totalDirections:
 *                       type: integer
 *                       example: 87
 *                     totalServices:
 *                       type: integer
 *                       example: 156
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Permission insuffisante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/ministeres', authenticateToken, getAllMinisteres);
router.post('/ministeres', authenticateToken, requirePermission(UserPermissions.CREATE_STRUCTURES), createMinistere);

// ===================== DIRECTIONS =====================

/**
 * @swagger
 * /api/structures/directions:
 *   get:
 *     summary: 📋 Récupérer toutes les directions
 *     description: Liste complète de toutes les directions avec statistiques et informations hiérarchiques
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: query
 *         name: actif
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif/inactif
 *         example: true
 *       - in: query
 *         name: ministereId
 *         schema:
 *           type: string
 *         description: Filtrer par ministère spécifique
 *         example: "ministere_123"
 *       - in: query
 *         name: withStats
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Inclure les statistiques (nombre de services, plaintes)
 *         example: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page pour la pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre d'éléments par page
 *         example: 20
 *     responses:
 *       200:
 *         description: Liste de toutes les directions récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Direction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 87
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 20
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante
 *       500:
 *         description: Erreur serveur
 */
router.get('/directions', authenticateToken, getAllDirections);
router.get('/ministeres/:ministereId/directions', authenticateToken, getDirectionsByMinistere);
router.post('/directions', authenticateToken, requirePermission(UserPermissions.CREATE_STRUCTURES), createDirection);

// ===================== SERVICES =====================

/**
 * @swagger
 * /api/structures/services:
 *   get:
 *     summary: 🏢 Récupérer tous les services
 *     description: Liste complète de tous les services avec statistiques et informations hiérarchiques complètes
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: query
 *         name: actif
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif/inactif
 *         example: true
 *       - in: query
 *         name: ministereId
 *         schema:
 *           type: string
 *         description: Filtrer par ministère spécifique
 *         example: "ministere_123"
 *       - in: query
 *         name: directionId
 *         schema:
 *           type: string
 *         description: Filtrer par direction spécifique
 *         example: "direction_456"
 *       - in: query
 *         name: withStats
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Inclure les statistiques (nombre de plaintes)
 *         example: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page pour la pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre d'éléments par page
 *         example: 20
 *     responses:
 *       200:
 *         description: Liste de tous les services récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 8
 *                     totalItems:
 *                       type: integer
 *                       example: 156
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 20
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante
 *       500:
 *         description: Erreur serveur
 */
router.get('/services', authenticateToken, getAllServices);
router.get('/directions/:directionId/services', authenticateToken, getServicesByDirection);
router.get('/ministeres/:ministereId/directions/:directionId/services', authenticateToken, getServicesByMinistereAndDirection);
router.post('/services', authenticateToken, requirePermission(UserPermissions.CREATE_STRUCTURES), createService);

// ===================== ROUTES EXISTANTES =====================

// Routes pour les structures génériques (existantes)
router.get('/', authenticateToken, getAllStructures);
router.post('/', authenticateToken, requirePermission(UserPermissions.CREATE_STRUCTURES), createStructure);
router.get('/search', authenticateToken, searchStructures);
router.get('/export', authenticateToken, requirePermission(UserPermissions.EXPORT_DATA), exportStructures);
router.get('/:id', authenticateToken, getStructureById);
router.put('/:id', authenticateToken, requirePermission(UserPermissions.MANAGE_STRUCTURES), updateStructure);
router.delete('/:id', authenticateToken, requirePermission(UserPermissions.DELETE_STRUCTURES), deleteStructure);

export default router; 