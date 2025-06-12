import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersStats,
  updateUserRole
} from '../controllers/userController.js';
import {
  updateUserRole as adminUpdateRole,
  toggleUserStatus,
  getDashboardStats,
  exportData
} from '../controllers/adminController.js';
import { requireAdmin, requirePermission } from '../middleware/permissions.js';
import { UserPermissions } from '../models/User.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Administration
 *   description: API pour l'administration des utilisateurs et du système
 */

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * Routes pour la gestion des administrateurs
 */

// Récupérer tous les administrateurs
router.get('/', getAllUsers);

// Statistiques des administrateurs
router.get('/stats', getUsersStats);

// Statistiques du dashboard
router.get('/dashboard/stats', getDashboardStats);

// Créer un nouvel administrateur
router.post('/', createUser);

// Récupérer un administrateur par ID
router.get('/:uid', getUserById);

// Mettre à jour un administrateur
router.put('/:uid', updateUser);

// Mettre à jour le rôle d'un administrateur
router.put('/:uid/role', adminUpdateRole);

// Activer/désactiver un administrateur
router.put('/:uid/activate', toggleUserStatus);

// Supprimer un administrateur
router.delete('/:uid', deleteUser);

// Export de données
router.post('/reports/export', exportData);

export default router; 