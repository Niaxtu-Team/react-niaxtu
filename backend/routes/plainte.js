import express from 'express';
import {
  creerPlainte,
  obtenirPlainte,
  listerPlaintes,
  rechercherPlaintes,
  assignerPlainte,
  changerStatutPlainte,
  obtenirStatistiquesPlaintes
} from '../controllers/plainteController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * 📝 Routes Plainte - Système de plaintes avec géolocalisation
 * Basé sur la documentation DATABASE_SCHEMA_FIRESTORE.md
 */

// Routes publiques
router.post('/', creerPlainte);
router.get('/search', rechercherPlaintes);

// Routes protégées
router.get('/', authMiddleware, listerPlaintes);
router.get('/statistiques', authMiddleware, obtenirStatistiquesPlaintes);
router.get('/:id', authMiddleware, obtenirPlainte);
router.patch('/:id/assigner', authMiddleware, assignerPlainte);
router.patch('/:id/statut', authMiddleware, changerStatutPlainte);

export default router; 