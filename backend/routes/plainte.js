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
 * @swagger
 * tags:
 *   name: Plaintes
 *   description: 📝 Système de plaintes avec géolocalisation basé sur DATABASE_SCHEMA_FIRESTORE.md
 */

/**
 * @swagger
 * /api/plainte:
 *   post:
 *     summary: 📝 Créer une nouvelle plainte
 *     description: Crée une nouvelle plainte avec géolocalisation (route publique)
 *     tags: [Plaintes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - description
 *               - type
 *               - secteur
 *               - localisation
 *             properties:
 *               titre:
 *                 type: string
 *                 description: Titre de la plainte
 *                 example: "Route dégradée avenue Victor Hugo"
 *               description:
 *                 type: string
 *                 description: Description détaillée de la plainte
 *                 example: "Nids de poule importants rendant la circulation dangereuse"
 *               type:
 *                 type: string
 *                 description: Type de plainte
 *                 example: "Infrastructure"
 *               secteur:
 *                 type: string
 *                 description: Secteur concerné
 *                 example: "Transport"
 *               sousSecteur:
 *                 type: string
 *                 description: Sous-secteur (optionnel)
 *                 example: "Voirie"
 *               localisation:
 *                 type: object
 *                 required:
 *                   - adresse
 *                   - coordonnees
 *                 properties:
 *                   adresse:
 *                     type: string
 *                     example: "123 Avenue Victor Hugo, Dakar"
 *                   ville:
 *                     type: string
 *                     example: "Dakar"
 *                   quartier:
 *                     type: string
 *                     example: "Plateau"
 *                   coordonnees:
 *                     type: object
 *                     required:
 *                       - latitude
 *                       - longitude
 *                     properties:
 *                       latitude:
 *                         type: number
 *                         example: 14.6928
 *                       longitude:
 *                         type: number
 *                         example: -17.4467
 *               priorite:
 *                 type: string
 *                 enum: [faible, moyenne, elevee, urgente]
 *                 default: moyenne
 *                 example: "elevee"
 *               pieceJointe:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                     nom:
 *                       type: string
 *                     type:
 *                       type: string
 *                     taille:
 *                       type: number
 *               plaignantInfo:
 *                 type: object
 *                 properties:
 *                   nom:
 *                     type: string
 *                     example: "Jean Dupont"
 *                   telephone:
 *                     type: string
 *                     example: "+221 77 123 45 67"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "jean.dupont@email.com"
 *     responses:
 *       201:
 *         description: Plainte créée avec succès
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
 *                   example: "Plainte créée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "plainte_123abc"
 *                     numero:
 *                       type: string
 *                       example: "P2024-001234"
 *                     statut:
 *                       type: string
 *                       example: "en-attente"
 *       400:
 *         description: Données invalides ou manquantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', creerPlainte);

/**
 * @swagger
 * /api/plainte/search:
 *   get:
 *     summary: 🔍 Rechercher des plaintes
 *     description: Effectue une recherche publique dans les plaintes avec filtres et géolocalisation
 *     tags: [Plaintes]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Terme de recherche (titre, description)
 *         example: "route dégradée"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrer par type de plainte
 *         example: "Infrastructure"
 *       - in: query
 *         name: secteur
 *         schema:
 *           type: string
 *         description: Filtrer par secteur
 *         example: "Transport"
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [en-attente, en-traitement, resolue, rejetee]
 *         description: Filtrer par statut
 *         example: "en-attente"
 *       - in: query
 *         name: ville
 *         schema:
 *           type: string
 *         description: Filtrer par ville
 *         example: "Dakar"
 *       - in: query
 *         name: quartier
 *         schema:
 *           type: string
 *         description: Filtrer par quartier
 *         example: "Plateau"
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Latitude pour recherche géographique
 *         example: 14.6928
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Longitude pour recherche géographique
 *         example: -17.4467
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: Rayon de recherche en kilomètres
 *         example: 10
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
 *           maximum: 50
 *           default: 20
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Résultats de recherche récupérés avec succès
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
 *                     $ref: '#/components/schemas/Complaint'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 filters:
 *                   type: object
 *                   description: Filtres appliqués
 *       400:
 *         description: Paramètres de recherche invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', rechercherPlaintes);

/**
 * @swagger
 * /api/plainte:
 *   get:
 *     summary: 📋 Lister toutes les plaintes (Admin)
 *     description: Récupère la liste de toutes les plaintes avec filtres avancés (accès admin requis)
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [en-attente, en-traitement, resolue, rejetee]
 *         description: Filtrer par statut
 *       - in: query
 *         name: priorite
 *         schema:
 *           type: string
 *           enum: [faible, moyenne, elevee, urgente]
 *         description: Filtrer par priorité
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrer par type
 *       - in: query
 *         name: secteur
 *         schema:
 *           type: string
 *         description: Filtrer par secteur
 *       - in: query
 *         name: assigneA
 *         schema:
 *           type: string
 *         description: Filtrer par assignation
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début pour la période
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin pour la période
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
 *           default: 20
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des plaintes récupérée avec succès
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
 *                     $ref: '#/components/schemas/Complaint'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     enAttente:
 *                       type: integer
 *                     enTraitement:
 *                       type: integer
 *                     resolues:
 *                       type: integer
 *                     rejetees:
 *                       type: integer
 *       401:
 *         description: Authentification requise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès refusé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authMiddleware, listerPlaintes);

/**
 * @swagger
 * /api/plainte/statistiques:
 *   get:
 *     summary: 📊 Obtenir les statistiques des plaintes
 *     description: Récupère les statistiques détaillées des plaintes (accès admin requis)
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: query
 *         name: periode
 *         schema:
 *           type: string
 *           enum: [7j, 1m, 3m, 6m, 1a]
 *           default: 1m
 *         description: Période pour les statistiques
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [jour, semaine, mois]
 *           default: jour
 *         description: Groupement temporel
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     resume:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 1250
 *                         nouvellesAujourdhui:
 *                           type: integer
 *                           example: 15
 *                         enAttente:
 *                           type: integer
 *                           example: 320
 *                         enTraitement:
 *                           type: integer
 *                           example: 580
 *                         resolues:
 *                           type: integer
 *                           example: 300
 *                         rejetees:
 *                           type: integer
 *                           example: 50
 *                     parType:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     parSecteur:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           secteur:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     evolution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           count:
 *                             type: integer
 *       401:
 *         description: Authentification requise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/statistiques', authMiddleware, obtenirStatistiquesPlaintes);

/**
 * @swagger
 * /api/plainte/{id}:
 *   get:
 *     summary: 📄 Obtenir une plainte spécifique
 *     description: Récupère les détails d'une plainte par son ID (accès admin requis)
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la plainte
 *         example: "plainte_123abc"
 *     responses:
 *       200:
 *         description: Plainte récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Complaint'
 *       401:
 *         description: Authentification requise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Plainte non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authMiddleware, obtenirPlainte);

/**
 * @swagger
 * /api/plainte/{id}/assigner:
 *   patch:
 *     summary: 👤 Assigner une plainte
 *     description: Assigne une plainte à un agent ou une structure (accès admin requis)
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la plainte
 *         example: "plainte_123abc"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assigneA
 *             properties:
 *               assigneA:
 *                 type: string
 *                 description: ID de l'agent ou structure assigné
 *                 example: "agent_456def"
 *               typeAssignation:
 *                 type: string
 *                 enum: [agent, structure]
 *                 default: agent
 *                 description: Type d'assignation
 *               commentaire:
 *                 type: string
 *                 description: Commentaire d'assignation
 *                 example: "Assigné pour traitement urgent"
 *     responses:
 *       200:
 *         description: Plainte assignée avec succès
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
 *                   example: "Plainte assignée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     assigneA:
 *                       type: string
 *                     dateAssignation:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Données d'assignation invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentification requise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Plainte non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/assigner', authMiddleware, assignerPlainte);

/**
 * @swagger
 * /api/plainte/{id}/statut:
 *   patch:
 *     summary: 🔄 Changer le statut d'une plainte
 *     description: Met à jour le statut d'une plainte avec commentaire (accès admin requis)
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la plainte
 *         example: "plainte_123abc"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statut
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [en-attente, en-traitement, resolue, rejetee]
 *                 description: Nouveau statut de la plainte
 *                 example: "en-traitement"
 *               commentaire:
 *                 type: string
 *                 description: Commentaire expliquant le changement
 *                 example: "Prise en charge par l'équipe technique"
 *               resolutionDetails:
 *                 type: object
 *                 description: Détails de résolution (pour statut résolu)
 *                 properties:
 *                   methode:
 *                     type: string
 *                     example: "Réparation"
 *                   cout:
 *                     type: number
 *                     example: 50000
 *                   dateResolution:
 *                     type: string
 *                     format: date
 *                   description:
 *                     type: string
 *                     example: "Route réparée avec nouveau revêtement"
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
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
 *                   example: "Statut mis à jour avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     ancienStatut:
 *                       type: string
 *                     nouveauStatut:
 *                       type: string
 *                     dateChangement:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Statut invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentification requise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Plainte non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/statut', authMiddleware, changerStatutPlainte);

export default router; 