import express from 'express';
import {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  searchDocuments
} from '../controllers/dataController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Données Génériques
 *   description: API générique pour la gestion de documents dans les collections Firestore
 */

/**
 * @swagger
 * /api/data/{collection}:
 *   get:
 *     summary: Obtenir les documents d'une collection
 *     description: Récupère tous les documents d'une collection spécifiée avec pagination et filtres
 *     tags: [Données Génériques]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de la collection Firestore
 *         example: "complaints"
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
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Champ pour trier les résultats
 *         example: "createdAt"
 *       - in: query
 *         name: orderDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Direction du tri
 *     responses:
 *       200:
 *         description: Documents récupérés avec succès
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
 *                     type: object
 *                     additionalProperties: true
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Paramètres invalides
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
router.get('/:collection', optionalAuth, getDocuments);

/**
 * @swagger
 * /api/data/{collection}/search:
 *   get:
 *     summary: Rechercher dans une collection
 *     description: Effectue une recherche avancée dans les documents d'une collection
 *     tags: [Données Génériques]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de la collection Firestore
 *         example: "complaints"
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *         example: "route dégradée"
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Champs à rechercher (séparés par des virgules)
 *         example: "title,description"
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
 *                     type: object
 *                     additionalProperties: true
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 query:
 *                   type: object
 *                   properties:
 *                     term:
 *                       type: string
 *                       example: "route dégradée"
 *                     fields:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["title", "description"]
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
router.get('/:collection/search', optionalAuth, searchDocuments);

/**
 * @swagger
 * /api/data/{collection}/{id}:
 *   get:
 *     summary: Obtenir un document spécifique
 *     description: Récupère un document par son ID dans une collection spécifiée
 *     tags: [Données Génériques]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de la collection Firestore
 *         example: "complaints"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du document
 *         example: "complaint_123abc"
 *     responses:
 *       200:
 *         description: Document récupéré avec succès
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
 *                   additionalProperties: true
 *       404:
 *         description: Document non trouvé
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
router.get('/:collection/:id', optionalAuth, getDocument);

/**
 * @swagger
 * /api/data/{collection}:
 *   post:
 *     summary: Créer un nouveau document
 *     description: Crée un nouveau document dans une collection spécifiée (authentification requise)
 *     tags: [Données Génériques]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de la collection Firestore
 *         example: "complaints"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             example:
 *               title: "Nouveau document"
 *               description: "Description du document"
 *               status: "active"
 *     responses:
 *       201:
 *         description: Document créé avec succès
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
 *                   example: "Document créé avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "doc_123abc"
 *                   additionalProperties: true
 *       400:
 *         description: Données invalides
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
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:collection', authenticateToken, createDocument);

/**
 * @swagger
 * /api/data/{collection}/{id}:
 *   put:
 *     summary: Mettre à jour un document
 *     description: Met à jour un document existant dans une collection (authentification requise)
 *     tags: [Données Génériques]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de la collection Firestore
 *         example: "complaints"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du document à mettre à jour
 *         example: "complaint_123abc"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             example:
 *               title: "Titre mis à jour"
 *               description: "Description mise à jour"
 *               status: "updated"
 *     responses:
 *       200:
 *         description: Document mis à jour avec succès
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
 *                   example: "Document mis à jour avec succès"
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *       400:
 *         description: Données invalides
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
 *         description: Document non trouvé
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
router.put('/:collection/:id', authenticateToken, updateDocument);

/**
 * @swagger
 * /api/data/{collection}/{id}:
 *   delete:
 *     summary: Supprimer un document
 *     description: Supprime un document d'une collection (authentification requise)
 *     tags: [Données Génériques]
 *     security:
 *       - BearerAuth: []
 *       - TestTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: collection
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de la collection Firestore
 *         example: "complaints"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du document à supprimer
 *         example: "complaint_123abc"
 *     responses:
 *       200:
 *         description: Document supprimé avec succès
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
 *                   example: "Document supprimé avec succès"
 *       401:
 *         description: Authentification requise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document non trouvé
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
router.delete('/:collection/:id', authenticateToken, deleteDocument);

export default router; 