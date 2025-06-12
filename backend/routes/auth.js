import express from 'express';
import { 
  login, 
  createAdmin, 
  logout, 
  verifyToken, 
  getProfile, 
  changePassword 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - idToken
 *       properties:
 *         idToken:
 *           type: string
 *           description: Token Firebase ID obtenu côté client
 *         deviceInfo:
 *           type: object
 *           properties:
 *             userAgent:
 *               type: string
 *             platform:
 *               type: string
 *             ip:
 *               type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             uid:
 *               type: string
 *             email:
 *               type: string
 *             displayName:
 *               type: string
 *             role:
 *               type: string
 *             permissions:
 *               type: array
 *               items:
 *                 type: string
 *             isActive:
 *               type: boolean
 *         token:
 *           type: string
 *           description: Token JWT pour les requêtes suivantes
 */

/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: Gestion de l'authentification des administrateurs
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion administrateur avec Firebase
 *     description: Authentifie un administrateur avec un token Firebase et retourne les informations de session
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             idToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             deviceInfo:
 *               userAgent: "Mozilla/5.0..."
 *               platform: "web"
 *               ip: "192.168.1.1"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Token invalide ou utilisateur non autorisé
 *       403:
 *         description: Compte désactivé ou permissions insuffisantes
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion administrateur
 *     description: Déconnecte l'administrateur et log l'action
 *     tags: [Authentification]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       401:
 *         description: Non authentifié
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Récupérer le profil de l'administrateur connecté
 *     description: Retourne les informations complètes du profil de l'administrateur connecté
 *     tags: [Authentification]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse/properties/user'
 *       401:
 *         description: Non authentifié
 */

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Vérifier la validité du token
 *     description: Vérifie si le token d'authentification est toujours valide
 *     tags: [Authentification]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token valide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 valid:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       401:
 *         description: Token invalide
 */

// Routes publiques (sans authentification)
router.post('/login', login);

// Routes protégées (avec authentification)
router.use(authenticateToken); // Middleware d'authentification pour toutes les routes suivantes

router.post('/create-admin', createAdmin);
router.post('/logout', logout);
router.get('/verify-token', verifyToken);
router.get('/profile', getProfile);
router.put('/change-password', changePassword);

export default router; 