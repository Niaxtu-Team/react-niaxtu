import express from 'express';
import { 
  getComplaints,
  createComplaint,
  updateComplaintStatus,
  addComplaintComment,
  finalizeDraft,
  getComplaintTypes
} from '../controllers/complaintController.js';
import { verifyFirebaseToken } from '../middleware/auth.js';
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
router.get('/', verifyFirebaseToken, getComplaints);
router.post('/', verifyFirebaseToken, createComplaint);

// Routes pour les brouillons
router.put('/:id/finalize', verifyFirebaseToken, finalizeDraft);

// Routes administratives
router.put('/:id/status', verifyFirebaseToken, requirePermission(UserPermissions.MANAGE_COMPLAINTS), updateComplaintStatus);
router.post('/:id/comments', verifyFirebaseToken, addComplaintComment);

export default router; 