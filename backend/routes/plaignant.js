import express from 'express';
import {
  creerPlaignant,
  obtenirPlaignant,
  listerPlaignants,
  mettreAJourPlaignant,
  desactiverPlaignant,
  obtenirStatistiquesPlaignant,
  marquerConnexion,
  rechercherPlaignants,
  verifierPlaignant
} from '../controllers/plaignantController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * 👤 Routes Plaignant - Utilisateurs de base du système
 * Basé sur la documentation DATABASE_SCHEMA_FIRESTORE.md
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Plaignant:
 *       type: object
 *       required:
 *         - email
 *         - pseudo
 *         - prenom
 *         - nom
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du plaignant
 *         uid:
 *           type: string
 *           description: UID Firebase Auth
 *         email:
 *           type: string
 *           format: email
 *           description: Email du plaignant
 *         pseudo:
 *           type: string
 *           minLength: 3
 *           description: Pseudo unique du plaignant
 *         prenom:
 *           type: string
 *           minLength: 2
 *           description: Prénom du plaignant
 *         nom:
 *           type: string
 *           minLength: 2
 *           description: Nom du plaignant
 *         telephone:
 *           type: string
 *           pattern: '^(\+33|0)[1-9](\d{8})$'
 *           description: Numéro de téléphone français
 *         age:
 *           type: integer
 *           minimum: 13
 *           maximum: 120
 *           description: Âge du plaignant
 *         sexe:
 *           type: string
 *           enum: [M, F, Autre]
 *           description: Sexe du plaignant
 *         avatar:
 *           type: string
 *           format: uri
 *           description: URL de l'avatar
 *         adresse:
 *           type: object
 *           properties:
 *             rue:
 *               type: string
 *             ville:
 *               type: string
 *             codePostal:
 *               type: string
 *             pays:
 *               type: string
 *               default: France
 *         localisation:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               format: float
 *             longitude:
 *               type: number
 *               format: float
 *             precision:
 *               type: integer
 *               default: 100
 *         preferences:
 *           type: object
 *           properties:
 *             notifications:
 *               type: boolean
 *               default: true
 *             newsletter:
 *               type: boolean
 *               default: false
 *             langue:
 *               type: string
 *               default: fr
 *         statistiques:
 *           type: object
 *           properties:
 *             nombrePlaintes:
 *               type: integer
 *               default: 0
 *             dernierePlainte:
 *               type: string
 *               format: date-time
 *             scoreReputation:
 *               type: integer
 *               default: 50
 *         isActif:
 *           type: boolean
 *           default: true
 *         isVerifie:
 *           type: boolean
 *           default: false
 *         dateInscription:
 *           type: string
 *           format: date-time
 *         dernierConnexion:
 *           type: string
 *           format: date-time
 *         dateMiseAJour:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/plaignant:
 *   post:
 *     summary: Créer un nouveau plaignant
 *     tags: [Plaignants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - pseudo
 *               - prenom
 *               - nom
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "citoyen@example.com"
 *               pseudo:
 *                 type: string
 *                 minLength: 3
 *                 example: "CitoyenLyon"
 *               prenom:
 *                 type: string
 *                 example: "Jean"
 *               nom:
 *                 type: string
 *                 example: "Dupont"
 *               telephone:
 *                 type: string
 *                 example: "+33 6 12 34 56 78"
 *               age:
 *                 type: integer
 *                 example: 35
 *               sexe:
 *                 type: string
 *                 enum: [M, F, Autre]
 *                 example: "M"
 *               adresse:
 *                 type: object
 *                 properties:
 *                   rue:
 *                     type: string
 *                     example: "123 Avenue de la République"
 *                   ville:
 *                     type: string
 *                     example: "Lyon"
 *                   codePostal:
 *                     type: string
 *                     example: "69001"
 *               localisation:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 45.7640
 *                   longitude:
 *                     type: number
 *                     example: 4.8357
 *     responses:
 *       201:
 *         description: Plaignant créé avec succès
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
 *                   example: "Plaignant créé avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     pseudo:
 *                       type: string
 *                     prenom:
 *                       type: string
 *                     nom:
 *                       type: string
 *       400:
 *         description: Données invalides ou email déjà existant
 */
router.post('/', creerPlaignant);

/**
 * @swagger
 * /api/plaignant:
 *   get:
 *     summary: Lister les plaignants avec pagination
 *     tags: [Plaignants]
 *     security:
 *       - bearerAuth: []
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
 *           maximum: 100
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [dateInscription, pseudo, nom, nombrePlaintes]
 *           default: dateInscription
 *         description: Champ de tri
 *       - in: query
 *         name: orderDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Direction du tri
 *       - in: query
 *         name: isActif
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: Filtrer par statut actif
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche dans pseudo, nom, prénom
 *     responses:
 *       200:
 *         description: Liste des plaignants
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
 *                     plaignants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Plaignant'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 */
router.get('/', authMiddleware, listerPlaignants);

/**
 * @swagger
 * /api/plaignant/search:
 *   get:
 *     summary: Rechercher des plaignants (Admin seulement)
 *     tags: [Plaignants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Terme de recherche
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Nombre de résultats
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *       403:
 *         description: Permission refusée - Admin requis
 */
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
 *       404:
 *         description: Plaignant non trouvé
 */
router.post('/connexion', marquerConnexion);

/**
 * @swagger
 * /api/plaignant/{id}:
 *   get:
 *     summary: Obtenir un plaignant par ID
 *     tags: [Plaignants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du plaignant
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
 *                   $ref: '#/components/schemas/Plaignant'
 *       404:
 *         description: Plaignant non trouvé
 */
router.get('/:id', authMiddleware, obtenirPlaignant);

/**
 * @swagger
 * /api/plaignant/{id}:
 *   put:
 *     summary: Mettre à jour un plaignant
 *     tags: [Plaignants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du plaignant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pseudo:
 *                 type: string
 *               prenom:
 *                 type: string
 *               nom:
 *                 type: string
 *               telephone:
 *                 type: string
 *               age:
 *                 type: integer
 *               sexe:
 *                 type: string
 *                 enum: [M, F, Autre]
 *               avatar:
 *                 type: string
 *               adresse:
 *                 type: object
 *               localisation:
 *                 type: object
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Plaignant mis à jour
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Plaignant non trouvé
 */
router.put('/:id', authMiddleware, mettreAJourPlaignant);

/**
 * @swagger
 * /api/plaignant/{id}/statistiques:
 *   get:
 *     summary: Obtenir les statistiques d'un plaignant
 *     tags: [Plaignants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du plaignant
 *     responses:
 *       200:
 *         description: Statistiques du plaignant
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
 *                     statistiques:
 *                       type: object
 *                       properties:
 *                         nombrePlaintes:
 *                           type: integer
 *                         dernierePlainte:
 *                           type: string
 *                           format: date-time
 *                         scoreReputation:
 *                           type: integer
 *                     informationsGenerales:
 *                       type: object
 *                       properties:
 *                         dateInscription:
 *                           type: string
 *                           format: date-time
 *                         dernierConnexion:
 *                           type: string
 *                           format: date-time
 *                         isVerifie:
 *                           type: boolean
 *                         isActif:
 *                           type: boolean
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Plaignant non trouvé
 */
router.get('/:id/statistiques', authMiddleware, obtenirStatistiquesPlaignant);

/**
 * @swagger
 * /api/plaignant/{id}/verifier:
 *   patch:
 *     summary: Vérifier/Dévérifier un plaignant (Admin seulement)
 *     tags: [Plaignants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du plaignant
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
 *       403:
 *         description: Permission refusée - Admin requis
 *       404:
 *         description: Plaignant non trouvé
 */
router.patch('/:id/verifier', authMiddleware, verifierPlaignant);

/**
 * @swagger
 * /api/plaignant/{id}/desactiver:
 *   patch:
 *     summary: Désactiver un plaignant (Admin seulement)
 *     tags: [Plaignants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du plaignant
 *     responses:
 *       200:
 *         description: Plaignant désactivé
 *       403:
 *         description: Permission refusée - Admin requis
 *       404:
 *         description: Plaignant non trouvé
 */
router.patch('/:id/desactiver', authMiddleware, desactiverPlaignant);

export default router; 