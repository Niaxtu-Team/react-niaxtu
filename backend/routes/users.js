import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  createUser, 
  deleteUser, 
  getAllUsers 
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des profils utilisateurs
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obtenir le profil utilisateur
 *     description: Récupère le profil de l'utilisateur authentifié
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', authenticateToken, getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Mettre à jour le profil utilisateur
 *     description: Met à jour les informations du profil de l'utilisateur authentifié
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 description: Nom d'affichage
 *                 example: "Jean Dupont"
 *               photoURL:
 *                 type: string
 *                 format: uri
 *                 description: URL de l'avatar
 *               profile:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     example: "Jean"
 *                   lastName:
 *                     type: string
 *                     example: "Dupont"
 *                   phone:
 *                     type: string
 *                     example: "+221 77 123 45 67"
 *                   address:
 *                     type: string
 *                     example: "123 Rue de la Paix, Dakar"
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                     example: "1990-01-15"
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
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
 *                   example: "Profil mis à jour avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/profile', authenticateToken, updateUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     summary: Supprimer le compte utilisateur
 *     description: Supprime définitivement le compte de l'utilisateur authentifié
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     responses:
 *       200:
 *         description: Compte supprimé avec succès
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
 *                   example: "Compte utilisateur supprimé avec succès"
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/profile', authenticateToken, deleteUser);

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     description: Crée un nouveau profil utilisateur après inscription Firebase Auth
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *               - email
 *             properties:
 *               uid:
 *                 type: string
 *                 description: Firebase UID de l'utilisateur
 *                 example: "abc123def456"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur
 *                 example: "user@niaxtu.com"
 *               displayName:
 *                 type: string
 *                 description: Nom d'affichage
 *                 example: "Jean Dupont"
 *               photoURL:
 *                 type: string
 *                 format: uri
 *                 description: URL de l'avatar
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
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
 *                   example: "Utilisateur créé avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données manquantes ou invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Utilisateur déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/create', createUser);

/**
 * @swagger
 * /api/users/all:
 *   get:
 *     summary: Obtenir tous les utilisateurs (Admin)
 *     description: Récupère la liste de tous les utilisateurs (accès admin requis)
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche (nom, email)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [all, true, false]
 *           default: all
 *         description: Filtrer par statut actif
 *         example: "true"
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [all, admin, super_admin, moderator, analyst]
 *           default: all
 *         description: Filtrer par rôle utilisateur
 *         example: "admin"
 *       - in: query
 *         name: dateRange
 *         schema:
 *           type: string
 *           enum: [all, 7d, 30d, 90d, 1y]
 *           default: all
 *         description: Filtrer par période de création
 *         example: "30d"
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
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
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès refusé - privilèges admin requis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/all', authenticateToken, getAllUsers);

export default router; 