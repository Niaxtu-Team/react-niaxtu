/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       properties:
 *         uid:
 *           type: string
 *           description: Identifiant unique de l'administrateur
 *           example: "admin_1749675455099_mx7hrs83e"
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'administrateur
 *           example: "admin@niaxtu.com"
 *         displayName:
 *           type: string
 *           description: Nom d'affichage
 *           example: "Super Administrateur"
 *         role:
 *           type: string
 *           enum: [analyst, moderator, structure_manager, sector_manager, admin, super_admin]
 *           description: Rôle de l'administrateur
 *           example: "super_admin"
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: Permissions spécifiques
 *           example: ["MANAGE_USERS", "VIEW_REPORTS"]
 *         profile:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *               example: "Super"
 *             lastName:
 *               type: string
 *               example: "Administrateur"
 *             phone:
 *               type: string
 *               example: "+221 77 123 45 67"
 *             organization:
 *               type: string
 *               example: "Niaxtu Administration"
 *             position:
 *               type: string
 *               example: "Super Administrateur Système"
 *         isActive:
 *           type: boolean
 *           description: Statut actif/inactif
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Dernière mise à jour
 *     CreateAdminRequest:
 *       type: object
 *       required:
 *         - email
 *         - displayName
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'administrateur
 *           example: "nouvel.admin@niaxtu.com"
 *         displayName:
 *           type: string
 *           description: Nom d'affichage
 *           example: "Nouvel Administrateur"
 *         role:
 *           type: string
 *           enum: [analyst, moderator, structure_manager, sector_manager, admin]
 *           description: Rôle (super_admin ne peut être créé que via setup)
 *           example: "admin"
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: Permissions spécifiques (optionnel)
 *           example: ["VIEW_USERS", "EDIT_USERS"]
 *         profile:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *               example: "Nouvel"
 *             lastName:
 *               type: string
 *               example: "Administrateur"
 *             phone:
 *               type: string
 *               example: "+221 77 987 65 43"
 *             organization:
 *               type: string
 *               example: "Niaxtu Administration"
 *             position:
 *               type: string
 *               example: "Administrateur"
 *     UpdateAdminRequest:
 *       type: object
 *       properties:
 *         displayName:
 *           type: string
 *           description: Nom d'affichage
 *           example: "Administrateur Modifié"
 *         role:
 *           type: string
 *           enum: [analyst, moderator, structure_manager, sector_manager, admin, super_admin]
 *           description: Nouveau rôle
 *           example: "sector_manager"
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: Nouvelles permissions
 *           example: ["MANAGE_SECTORS", "VIEW_REPORTS"]
 *         profile:
 *           type: object
 *           description: Informations de profil à mettre à jour
 *     AdminStats:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           description: Nombre total d'administrateurs
 *           example: 15
 *         active:
 *           type: number
 *           description: Nombre d'administrateurs actifs
 *           example: 12
 *         inactive:
 *           type: number
 *           description: Nombre d'administrateurs inactifs
 *           example: 3
 *         byRole:
 *           type: object
 *           properties:
 *             analyst:
 *               type: number
 *               example: 3
 *             moderator:
 *               type: number
 *               example: 4
 *             structure_manager:
 *               type: number
 *               example: 2
 *             sector_manager:
 *               type: number
 *               example: 2
 *             admin:
 *               type: number
 *               example: 3
 *             super_admin:
 *               type: number
 *               example: 1
 *         recentCreations:
 *           type: number
 *           description: Créations dans les 7 derniers jours
 *           example: 2
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Token Firebase JWT obtenu après authentification
 */

/**
 * @swagger
 * tags:
 *   - name: Gestion Administrateurs
 *     description: CRUD et gestion complète des administrateurs
 *   - name: Statistiques Admin
 *     description: Statistiques et rapports sur les administrateurs
 */

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: 📋 Récupérer tous les administrateurs
 *     description: Liste paginée de tous les administrateurs avec filtres et recherche
 *     tags: [Gestion Administrateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Nombre d'éléments par page
 *         example: 20
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [analyst, moderator, structure_manager, sector_manager, admin, super_admin]
 *         description: Filtrer par rôle
 *         example: "admin"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom, email, prénom, nom de famille
 *         example: "admin"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, displayName, email, role]
 *           default: createdAt
 *         description: Champ de tri
 *         example: "createdAt"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre de tri
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Liste des administrateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 admins:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Admin'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalItems:
 *                       type: integer
 *                       example: 45
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 20
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante
 *   post:
 *     summary: ➕ Créer un nouvel administrateur
 *     description: Créer un nouveau compte administrateur avec rôle et permissions
 *     tags: [Gestion Administrateurs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminRequest'
 *           examples:
 *             admin_standard:
 *               summary: Administrateur standard
 *               value:
 *                 email: "admin.standard@niaxtu.com"
 *                 displayName: "Administrateur Standard"
 *                 role: "admin"
 *                 profile:
 *                   firstName: "Admin"
 *                   lastName: "Standard"
 *                   phone: "+221 77 123 45 67"
 *                   organization: "Niaxtu"
 *                   position: "Administrateur"
 *             sector_manager:
 *               summary: Gestionnaire de secteur
 *               value:
 *                 email: "manager.secteur@niaxtu.com"
 *                 displayName: "Gestionnaire Secteur"
 *                 role: "sector_manager"
 *                 permissions: ["MANAGE_SECTORS", "VIEW_REPORTS"]
 *                 profile:
 *                   firstName: "Manager"
 *                   lastName: "Secteur"
 *                   organization: "Niaxtu"
 *                   position: "Gestionnaire de Secteur"
 *     responses:
 *       201:
 *         description: Administrateur créé avec succès
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
 *                   example: "Administrateur créé avec succès"
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante
 */

/**
 * @swagger
 * /api/admin/{uid}:
 *   get:
 *     summary: 👤 Récupérer un administrateur par ID
 *     description: Obtenir les détails complets d'un administrateur spécifique
 *     tags: [Gestion Administrateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant unique de l'administrateur
 *         example: "admin_1749675455099_mx7hrs83e"
 *     responses:
 *       200:
 *         description: Administrateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Administrateur non trouvé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante
 *   put:
 *     summary: ✏️ Mettre à jour un administrateur
 *     description: Modifier les informations d'un administrateur existant
 *     tags: [Gestion Administrateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant unique de l'administrateur
 *         example: "admin_1749675455099_mx7hrs83e"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAdminRequest'
 *           examples:
 *             update_role:
 *               summary: Changer le rôle
 *               value:
 *                 role: "sector_manager"
 *                 permissions: ["MANAGE_SECTORS", "VIEW_REPORTS"]
 *             update_profile:
 *               summary: Mettre à jour le profil
 *               value:
 *                 displayName: "Nouveau Nom"
 *                 profile:
 *                   phone: "+221 77 999 88 77"
 *                   position: "Nouveau Poste"
 *     responses:
 *       200:
 *         description: Administrateur mis à jour avec succès
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
 *                   example: "Administrateur mis à jour avec succès"
 *       404:
 *         description: Administrateur non trouvé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante
 *   delete:
 *     summary: 🗑️ Supprimer un administrateur
 *     description: Désactiver un administrateur (suppression logique)
 *     tags: [Gestion Administrateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant unique de l'administrateur
 *         example: "admin_1749675455099_mx7hrs83e"
 *     responses:
 *       200:
 *         description: Administrateur supprimé avec succès
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
 *                   example: "Administrateur supprimé avec succès"
 *       400:
 *         description: Impossible de supprimer (ex: dernier super admin)
 *       404:
 *         description: Administrateur non trouvé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante
 */

/**
 * @swagger
 * /api/admin/{uid}/role:
 *   put:
 *     summary: 🔄 Modifier le rôle d'un administrateur
 *     description: Changer le rôle et les permissions d'un administrateur
 *     tags: [Gestion Administrateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant unique de l'administrateur
 *         example: "admin_1749675455099_mx7hrs83e"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [analyst, moderator, structure_manager, sector_manager, admin, super_admin]
 *                 description: Nouveau rôle
 *                 example: "sector_manager"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Nouvelles permissions spécifiques
 *                 example: ["MANAGE_SECTORS", "VIEW_REPORTS"]
 *           examples:
 *             promote_to_admin:
 *               summary: Promouvoir en administrateur
 *               value:
 *                 role: "admin"
 *                 permissions: ["MANAGE_USERS", "VIEW_REPORTS", "EXPORT_DATA"]
 *             assign_sector_manager:
 *               summary: Assigner gestionnaire de secteur
 *               value:
 *                 role: "sector_manager"
 *                 permissions: ["MANAGE_SECTORS", "VIEW_SECTOR_REPORTS"]
 *     responses:
 *       200:
 *         description: Rôle modifié avec succès
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
 *                   example: "Rôle administrateur mis à jour avec succès"
 *       404:
 *         description: Administrateur non trouvé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante
 */

/**
 * @swagger
 * /api/admin/{uid}/activate:
 *   put:
 *     summary: 🔄 Activer/Désactiver un administrateur
 *     description: Changer le statut actif/inactif d'un administrateur
 *     tags: [Gestion Administrateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant unique de l'administrateur
 *         example: "admin_1749675455099_mx7hrs83e"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Nouveau statut (true = actif, false = inactif)
 *                 example: false
 *           examples:
 *             deactivate:
 *               summary: Désactiver l'administrateur
 *               value:
 *                 isActive: false
 *             activate:
 *               summary: Activer l'administrateur
 *               value:
 *                 isActive: true
 *     responses:
 *       200:
 *         description: Statut modifié avec succès
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
 *                   example: "Administrateur désactivé avec succès"
 *       404:
 *         description: Administrateur non trouvé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: 📊 Statistiques des administrateurs
 *     description: Obtenir des statistiques détaillées sur les administrateurs
 *     tags: [Statistiques Admin]
 *     security:
 *       - BearerAuth: []
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
 *                 stats:
 *                   $ref: '#/components/schemas/AdminStats'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante pour voir les statistiques
 */

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: 📈 Statistiques du tableau de bord
 *     description: Statistiques complètes pour le tableau de bord administrateur
 *     tags: [Statistiques Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques du tableau de bord
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     admins:
 *                       $ref: '#/components/schemas/AdminStats'
 *                     complaints:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 150
 *                         pending:
 *                           type: number
 *                           example: 25
 *                         inProgress:
 *                           type: number
 *                           example: 45
 *                         resolved:
 *                           type: number
 *                           example: 70
 *                         rejected:
 *                           type: number
 *                           example: 10
 *                     sectors:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 12
 *                         active:
 *                           type: number
 *                           example: 10
 *                     structures:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 45
 *                         active:
 *                           type: number
 *                           example: 42
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-11T21:15:00.000Z"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante
 */

/**
 * @swagger
 * /api/admin/reports/export:
 *   post:
 *     summary: 📤 Exporter des données
 *     description: Exporter les données des administrateurs et autres collections
 *     tags: [Statistiques Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collections:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [admin, complaints, sectors, structures]
 *                 description: Collections à exporter
 *                 example: ["admin", "complaints"]
 *               format:
 *                 type: string
 *                 enum: [json, csv]
 *                 default: json
 *                 description: Format d'export
 *                 example: "json"
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date
 *                     description: Date de début
 *                     example: "2025-01-01"
 *                   end:
 *                     type: string
 *                     format: date
 *                     description: Date de fin
 *                     example: "2025-06-11"
 *           examples:
 *             export_admins:
 *               summary: Exporter les administrateurs
 *               value:
 *                 collections: ["admin"]
 *                 format: "json"
 *             export_all_recent:
 *               summary: Exporter toutes les données récentes
 *               value:
 *                 collections: ["admin", "complaints", "sectors"]
 *                 format: "json"
 *                 dateRange:
 *                   start: "2025-06-01"
 *                   end: "2025-06-11"
 *     responses:
 *       200:
 *         description: Données exportées avec succès
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
 *                   example: "Données exportées avec succès"
 *                 data:
 *                   type: object
 *                   description: Données exportées organisées par collection
 *                 exportedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-11T21:15:00.000Z"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante pour exporter
 */

export const adminSwaggerDocs = {
  // Schémas de données
  components: {
    schemas: {
      Admin: {
        type: "object",
        properties: {
          uid: {
            type: "string",
            description: "Identifiant unique de l'administrateur",
            example: "admin_1749675455099_mx7hrs83e"
          },
          email: {
            type: "string",
            format: "email",
            description: "Email de l'administrateur",
            example: "admin@niaxtu.com"
          },
          displayName: {
            type: "string",
            description: "Nom d'affichage",
            example: "Super Administrateur"
          },
          role: {
            type: "string",
            enum: ["analyst", "moderator", "structure_manager", "sector_manager", "admin", "super_admin"],
            description: "Rôle de l'administrateur",
            example: "super_admin"
          },
          permissions: {
            type: "array",
            items: { type: "string" },
            description: "Permissions spécifiques",
            example: ["MANAGE_USERS", "VIEW_REPORTS"]
          },
          profile: {
            type: "object",
            properties: {
              firstName: { type: "string", example: "Super" },
              lastName: { type: "string", example: "Administrateur" },
              phone: { type: "string", example: "+221 77 123 45 67" },
              organization: { type: "string", example: "Niaxtu Administration" },
              position: { type: "string", example: "Super Administrateur Système" }
            }
          },
          isActive: {
            type: "boolean",
            description: "Statut actif/inactif",
            example: true
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Date de création"
          },
          updatedAt: {
            type: "string", 
            format: "date-time",
            description: "Dernière mise à jour"
          }
        }
      }
    }
  },

  // Tags pour organiser la documentation
  tags: [
    {
      name: "Gestion Administrateurs",
      description: "CRUD et gestion complète des administrateurs"
    },
    {
      name: "Statistiques Admin", 
      description: "Statistiques et rapports sur les administrateurs"
    }
  ],

  // Définitions des endpoints
  paths: {
    "/api/admin": {
      get: {
        summary: "📋 Récupérer tous les administrateurs",
        description: "Liste paginée de tous les administrateurs avec filtres et recherche",
        tags: ["Gestion Administrateurs"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", default: 1 },
            description: "Numéro de page",
            example: 1
          },
          {
            in: "query", 
            name: "limit",
            schema: { type: "integer", default: 20, maximum: 100 },
            description: "Nombre d'éléments par page",
            example: 20
          },
          {
            in: "query",
            name: "role", 
            schema: {
              type: "string",
              enum: ["analyst", "moderator", "structure_manager", "sector_manager", "admin", "super_admin"]
            },
            description: "Filtrer par rôle",
            example: "admin"
          },
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            description: "Recherche par nom, email, prénom, nom de famille",
            example: "admin"
          }
        ],
        responses: {
          200: {
            description: "Liste des administrateurs récupérée avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    admins: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Admin" }
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        currentPage: { type: "integer", example: 1 },
                        totalPages: { type: "integer", example: 3 },
                        totalItems: { type: "integer", example: 45 },
                        itemsPerPage: { type: "integer", example: 20 }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: "Non authentifié" },
          403: { description: "Permission insuffisante" }
        }
      },
      post: {
        summary: "➕ Créer un nouvel administrateur",
        description: "Créer un nouveau compte administrateur avec rôle et permissions",
        tags: ["Gestion Administrateurs"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "displayName", "role"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email de l'administrateur",
                    example: "nouvel.admin@niaxtu.com"
                  },
                  displayName: {
                    type: "string",
                    description: "Nom d'affichage", 
                    example: "Nouvel Administrateur"
                  },
                  role: {
                    type: "string",
                    enum: ["analyst", "moderator", "structure_manager", "sector_manager", "admin"],
                    description: "Rôle (super_admin ne peut être créé que via setup)",
                    example: "admin"
                  },
                  permissions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Permissions spécifiques (optionnel)",
                    example: ["VIEW_USERS", "EDIT_USERS"]
                  },
                  profile: {
                    type: "object",
                    properties: {
                      firstName: { type: "string", example: "Nouvel" },
                      lastName: { type: "string", example: "Administrateur" },
                      phone: { type: "string", example: "+221 77 987 65 43" },
                      organization: { type: "string", example: "Niaxtu Administration" },
                      position: { type: "string", example: "Administrateur" }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Administrateur créé avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Administrateur créé avec succès" },
                    admin: { $ref: "#/components/schemas/Admin" }
                  }
                }
              }
            }
          },
          400: { description: "Données invalides ou email déjà utilisé" },
          401: { description: "Non authentifié" },
          403: { description: "Permission insuffisante" }
        }
      }
    }
  }
};

export default adminSwaggerDocs; 