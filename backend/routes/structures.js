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
  getDirectionsByMinistere,
  createDirection,
  getServicesByDirection,
  getServicesByMinistereAndDirection,
  createService
} from '../controllers/structureController.js';
import { verifyFirebaseToken } from '../middleware/auth.js';
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
 * Routes pour les ministères
 */
router.get('/ministeres', verifyFirebaseToken, getAllMinisteres);
router.post('/ministeres', verifyFirebaseToken, requirePermission(UserPermissions.CREATE_STRUCTURES), createMinistere);

// ===================== DIRECTIONS =====================

/**
 * Routes pour les directions
 */
router.get('/ministeres/:ministereId/directions', verifyFirebaseToken, getDirectionsByMinistere);
router.post('/directions', verifyFirebaseToken, requirePermission(UserPermissions.CREATE_STRUCTURES), createDirection);

// ===================== SERVICES =====================

/**
 * Routes pour les services
 */
router.get('/directions/:directionId/services', verifyFirebaseToken, getServicesByDirection);
router.get('/ministeres/:ministereId/directions/:directionId/services', verifyFirebaseToken, getServicesByMinistereAndDirection);
router.post('/services', verifyFirebaseToken, requirePermission(UserPermissions.CREATE_STRUCTURES), createService);

// ===================== ROUTES EXISTANTES =====================

// Routes pour les structures génériques (existantes)
router.get('/', verifyFirebaseToken, getAllStructures);
router.post('/', verifyFirebaseToken, requirePermission(UserPermissions.CREATE_STRUCTURES), createStructure);
router.get('/search', verifyFirebaseToken, searchStructures);
router.get('/export', verifyFirebaseToken, requirePermission(UserPermissions.EXPORT_DATA), exportStructures);
router.get('/:id', verifyFirebaseToken, getStructureById);
router.put('/:id', verifyFirebaseToken, requirePermission(UserPermissions.MANAGE_STRUCTURES), updateStructure);
router.delete('/:id', verifyFirebaseToken, requirePermission(UserPermissions.DELETE_STRUCTURES), deleteStructure);

export default router; 