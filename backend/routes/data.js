import express from 'express';
import {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  searchDocuments
} from '../controllers/dataController.js';
import { verifyFirebaseToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Routes avec authentification optionnelle pour la lecture
router.get('/:collection', optionalAuth, getDocuments);
router.get('/:collection/search', optionalAuth, searchDocuments);
router.get('/:collection/:id', optionalAuth, getDocument);

// Routes protégées pour la création, modification et suppression
router.post('/:collection', verifyFirebaseToken, createDocument);
router.put('/:collection/:id', verifyFirebaseToken, updateDocument);
router.delete('/:collection/:id', verifyFirebaseToken, deleteDocument);

export default router; 