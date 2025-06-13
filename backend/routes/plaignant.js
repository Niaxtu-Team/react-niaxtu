import express from 'express';
import {
  obtenirPlaignant,
  listerPlaignants,
  mettreAJourPlaignant,
  desactiverPlaignant,
  obtenirStatistiquesPlaignant,
  marquerConnexion,
  rechercherPlaignants,
  verifierPlaignant,
  activerPlaignant,
  suspendrePlaignant,
  obtenirHistoriqueStatuts,
  getAllPlaignants,
} from '../controllers/plaignantController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Plaignants
 *     description: Gestion des utilisateurs plaignants
 */

/**
 * 👤 Routes Plaignant - Utilisateurs de base du système
 * Les plaignants sont récupérés depuis la collection Firebase "users"
 */

/**
 * @swagger
 * /api/plaignant:
 *   get:
 *     summary: Lister les plaignants avec pagination
 *     tags: [Plaignants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche dans pseudo, nom, prénom
 *     responses:
 *       200:
 *         description: Liste des plaignants
 *       401:
 *         description: Non autorisé
 */

// Liste des plaignants
router.get('/', authMiddleware, listerPlaignants);

/**
 * @swagger
 * /api/plaignant/search:
 *   get:
 *     summary: Rechercher des plaignants
 *     tags: [Plaignants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *       401:
 *         description: Non autorisé
 */

// Recherche de plaignants
router.get('/search', authMiddleware, rechercherPlaignants);

/**
 * @swagger
 * /api/plaignant/connexion:
 *   post:
 *     summary: Marquer la connexion d'un plaignant
 *     tags: [Plaignants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *             properties:
 *               uid:
 *                 type: string
 *                 description: UID Firebase du plaignant
 *     responses:
 *       200:
 *         description: Connexion enregistrée
 *       400:
 *         description: UID Firebase requis
 *       404:
 *         description: Plaignant non trouvé
 */

// Marquer la connexion d'un plaignant
router.post('/connexion', marquerConnexion);

/**
 * @swagger
 * /api/plaignant/{phone}:
 *   get:
 *     summary: Récupérer un plaignant par son numéro de téléphone
 *     tags: [Plaignants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro de téléphone du plaignant
 *     responses:
 *       200:
 *         description: Détails du plaignant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     pseudo:
 *                       type: string
 *                     prenom:
 *                       type: string
 *                     nom:
 *                       type: string
 *       404:
 *         description: Plaignant non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:phone', authMiddleware, getAllPlaignants);

/**
 * @swagger
 * /api/plaignant/{phone}/statistiques:
 *   get:
 *     summary: Obtenir les statistiques d'un plaignant
 *     tags: [Plaignants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro de téléphone du plaignant
 *     responses:
 *       200:
 *         description: Statistiques du plaignant
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Plaignant non trouvé
 */
router.get('/:phone/statistiques', authMiddleware, obtenirStatistiquesPlaignant);

/**
 * @swagger
 * /api/plaignant/{phone}/verifier:
 *   patch:
 *     summary: Vérifier/Dévérifier un plaignant
 *     tags: [Plaignants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro de téléphone du plaignant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isVerifie
 *             properties:
 *               isVerifie:
 *                 type: boolean
 *                 description: Statut de vérification
 *     responses:
 *       200:
 *         description: Statut de vérification mis à jour
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Plaignant non trouvé
 */
router.patch('/:phone/verifier', authMiddleware, verifierPlaignant);

/**
 * @swagger
 * /api/plaignant/{phone}/desactiver:
 *   patch:
 *     summary: Désactiver un plaignant
 *     tags: [Plaignants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro de téléphone du plaignant
 *     responses:
 *       200:
 *         description: Plaignant désactivé
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Plaignant non trouvé
 */
router.patch('/:phone/desactiver', authMiddleware, desactiverPlaignant);

/**
 * @swagger
 * /api/plaignant/{phone}/activer:
 *   patch:
 *     summary: Activer/Réactiver un plaignant
 *     tags: [Plaignants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro de téléphone du plaignant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               raison:
 *                 type: string
 *                 description: Raison de l'activation
 *     responses:
 *       200:
 *         description: Plaignant activé
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Plaignant non trouvé
 */
router.patch('/:phone/activer', authMiddleware, activerPlaignant);

/**
 * @swagger
 * /api/plaignant/{phone}/suspendre:
 *   patch:
 *     summary: Suspendre temporairement un plaignant
 *     tags: [Plaignants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro de téléphone du plaignant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - raison
 *               - duree
 *             properties:
 *               raison:
 *                 type: string
 *                 description: Raison de la suspension
 *               duree:
 *                 type: integer
 *                 description: Durée en jours (0 = illimitée)
 *     responses:
 *       200:
 *         description: Plaignant suspendu
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Plaignant non trouvé
 */
router.patch('/:phone/suspendre', authMiddleware, suspendrePlaignant);

/**
 * @swagger
 * /api/plaignant/{phone}/historique-statuts:
 *   get:
 *     summary: Obtenir l'historique des changements de statut
 *     tags: [Plaignants]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro de téléphone du plaignant
 *     responses:
 *       200:
 *         description: Historique des statuts
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Plaignant non trouvé
 */
router.get('/:phone/historique-statuts', authMiddleware, obtenirHistoriqueStatuts);

/**
 * @swagger
 * /api/plaignant/all:
 *   get:
 *     summary: Récupérer tous les plaignants
 *     tags: [Plaignants]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de tous les plaignants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       pseudo:
 *                         type: string
 *                       prenom:
 *                         type: string
 *                       nom:
 *                         type: string
 *                       email:
 *                         type: string
 *                       statut:
 *                         type: string
 *                       isActif:
 *                         type: boolean
 *                 total:
 *                   type: number
 *       500:
 *         description: Erreur serveur
 */
router.get('/all', authMiddleware, getAllPlaignants);

export default router;