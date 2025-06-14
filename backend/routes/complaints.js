import express from 'express';
import { 
  getComplaints,
  createComplaint,
  updateComplaintStatus,
  addComplaintComment,
  finalizeDraft,
  getComplaintTypes
} from '../controllers/complaintController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { UserPermissions } from '../models/User.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Plaintes
 *   description: API pour la gestion des plaintes (workflow mobile)
 */

// Routes publiques (avec auth)
router.get('/types', getComplaintTypes);

// Routes avec authentification
router.get('/', authenticateToken, getComplaints);
router.post('/', authenticateToken, createComplaint);

// Routes pour les brouillons
router.put('/:id/finalize', authenticateToken, finalizeDraft);

// Routes administratives
router.put('/:id/status', authenticateToken, requirePermission(UserPermissions.MANAGE_COMPLAINTS), updateComplaintStatus);
router.post('/:id/comments', authenticateToken, addComplaintComment);

export default router; 