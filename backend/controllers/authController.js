import { db, FieldValue } from '../config/firebase.js';
import { 
  validatePassword, 
  validateEmail, 
  hashPassword, 
  verifyPassword,
  isAccountLocked,
  incrementLoginAttempts,
  resetLoginAttempts,
  UserRoles,
  hasPermission,
  getUserPermissions,
  RolePermissions,
  getRoleHierarchy
} from '../models/User.js';
import jwt from 'jsonwebtoken';
import process from 'process';
import { auth } from '../config/firebase.js';

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'niaxtu-super-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'administrateur
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Mot de passe
 *     
 *     CreateAdminRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - displayName
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *         displayName:
 *           type: string
 *         role:
 *           type: string
 *           enum: [super_admin, admin, sector_manager, structure_manager, moderator, analyst]
 *         profile:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             title:
 *               type: string
 *             department:
 *               type: string
 *             organization:
 *               type: string
 *     
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
 *             id:
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
 *         token:
 *           type: string
 *           description: JWT token pour l'authentification
 */

// Génération de token JWT
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: getUserPermissions(user)
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Obtenir l'adresse IP du client
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

// Enregistrer l'historique de connexion
const logLoginAttempt = async (userId, success, req) => {
  try {
    const userRef = db.collection('admin').doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const loginEntry = {
        timestamp: new Date(),
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'] || 'Unknown',
        success,
        location: 'Unknown' // Peut être étendu avec un service de géolocalisation
      };
      
      await userRef.update({
        loginHistory: FieldValue.arrayUnion(loginEntry),
        lastLogin: success ? new Date() : FieldValue.serverTimestamp(),
        lastLoginIP: success ? getClientIP(req) : FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'historique de connexion:', error);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion administrateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Identifiants incorrects
 *       423:
 *         description: Compte verrouillé
 *       500:
 *         description: Erreur serveur
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation des données
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }
    
    // Validation de l'email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.error
      });
    }
    
    // Recherche de l'utilisateur
    const usersRef = db.collection('admin');
    const userQuery = await usersRef.where('email', '==', email.toLowerCase()).get();
    
    if (userQuery.empty) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }
    
    const userDoc = userQuery.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };
    
    // Vérification si le compte est verrouillé
    if (isAccountLocked(user)) {
      const lockTime = new Date(user.lockUntil).toLocaleString('fr-FR');
      return res.status(423).json({
        success: false,
        message: `Compte verrouillé jusqu'à ${lockTime} suite à trop de tentatives de connexion`
      });
    }
    
    // Vérification si le compte est actif
    if (!user.isActive || user.isBlocked) {
      await logLoginAttempt(user.id, false, req);
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé ou bloqué'
      });
    }
    
    // Vérification du mot de passe
    let passwordValid = false;
    
    if (user.authProvider === 'local' && user.password) {
      passwordValid = await verifyPassword(password, user.password);
    } else if (user.authProvider === 'firebase' && user.uid) {
      // Pour les utilisateurs Firebase, on peut implémenter une vérification spéciale
      // ou rediriger vers Firebase Auth
      return res.status(400).json({
        success: false,
        message: 'Utilisez la connexion Firebase pour ce compte'
      });
    }
    
    if (!passwordValid) {
      // Incrémenter les tentatives de connexion échouées
      const updatedUser = await incrementLoginAttempts(user);
      await db.collection('admin').doc(user.id).update({
        loginAttempts: updatedUser.loginAttempts,
        lockUntil: updatedUser.lockUntil || null
      });
      
      await logLoginAttempt(user.id, false, req);
      
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }
    
    // Connexion réussie - réinitialiser les tentatives
    resetLoginAttempts(user);
    await db.collection('admin').doc(user.id).update({
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
      lastLoginIP: getClientIP(req)
    });
    
    await logLoginAttempt(user.id, true, req);
    
    // Générer le token JWT
    const token = generateToken(user);
    
    // Réponse sans le mot de passe
    const { password: _, ...userResponse } = user;
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        ...userResponse,
        permissions: getUserPermissions(user)
      },
      token
    });
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * @swagger
 * /api/auth/create-admin:
 *   post:
 *     summary: Créer un nouvel administrateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminRequest'
 *     responses:
 *       201:
 *         description: Administrateur créé avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Permissions insuffisantes
 *       409:
 *         description: Email déjà utilisé
 *       500:
 *         description: Erreur serveur
 */
export const createAdmin = async (req, res) => {
  try {
    const { email, password, displayName, role, profile = {} } = req.body;
    const currentUser = req.user;
    
    // Vérification des permissions
    if (!hasPermission(currentUser, 'CREATE_USERS')) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes pour créer des utilisateurs'
      });
    }
    
    // Validation des données requises
    if (!email || !password || !displayName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, mot de passe, nom d\'affichage et rôle requis'
      });
    }
    
    // Validation de l'email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.error
      });
    }
    
    // Validation du mot de passe
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe invalide',
        errors: passwordValidation.errors
      });
    }
    
    // Validation du rôle
    if (!Object.values(UserRoles).includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }
    
    // Vérification si l'email existe déjà
    const existingUserQuery = await db.collection('admin')
      .where('email', '==', email.toLowerCase())
      .get();
    
    if (!existingUserQuery.empty) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }
    
    // Hashage du mot de passe
    const hashedPassword = await hashPassword(password);
    
    // Création de l'utilisateur
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      displayName,
      role,
      authProvider: 'local',
      isActive: true,
      isBlocked: false,
      isEmailVerified: false,
      loginAttempts: 0,
      profile: {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        title: profile.title || '',
        department: profile.department || '',
        organization: profile.organization || '',
        preferences: {
          language: 'fr',
          timezone: 'Africa/Abidjan',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: currentUser.id,
      lastPasswordChange: new Date(),
      loginHistory: []
    };
    
    // Sauvegarde en base
    const userRef = await db.collection('admin').add(newUser);
    
    // Réponse sans le mot de passe
    const { password: _, ...userResponse } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'Administrateur créé avec succès',
      user: {
        id: userRef.id,
        ...userResponse,
        permissions: getUserPermissions(newUser)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       500:
 *         description: Erreur serveur
 */
export const logout = async (req, res) => {
  try {
    const user = req.user;
    
    if (user) {
      // Enregistrer la déconnexion dans l'historique
      await logLoginAttempt(user.id, true, req);
    }
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
    
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * @swagger
 * /api/auth/verify-token:
 *   get:
 *     summary: Vérifier la validité du token
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
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
 *                 user:
 *                   type: object
 *       401:
 *         description: Token invalide
 */
export const verifyToken = async (req, res) => {
  try {
    const user = req.user;
    
    // Récupérer les données utilisateur à jour depuis la base
    const userDoc = await db.collection('admin').doc(user.id).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const userData = userDoc.data();
    
    // Vérifier si le compte est toujours actif
    if (!userData.isActive || userData.isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      });
    }
    
    const { password: _, ...userResponse } = userData;
    
    res.json({
      success: true,
      user: {
        id: user.id,
        ...userResponse,
        permissions: getUserPermissions(userData)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Récupérer le profil utilisateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       401:
 *         description: Non authentifié
 */
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    // Récupérer les données complètes depuis la base
    const userDoc = await db.collection('admin').doc(user.id).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const userData = userDoc.data();
    const { password: _, ...userResponse } = userData;
    
    res.json({
      success: true,
      user: {
        id: user.id,
        ...userResponse,
        permissions: getUserPermissions(userData)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Changer le mot de passe
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Mot de passe actuel incorrect
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis'
      });
    }
    
    // Récupérer les données utilisateur
    const userDoc = await db.collection('admin').doc(user.id).get();
    const userData = userDoc.data();
    
    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await verifyPassword(currentPassword, userData.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }
    
    // Valider le nouveau mot de passe
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Nouveau mot de passe invalide',
        errors: passwordValidation.errors
      });
    }
    
    // Hasher le nouveau mot de passe
    const hashedNewPassword = await hashPassword(newPassword);
    
    // Mettre à jour en base
    await db.collection('admin').doc(user.id).update({
      password: hashedNewPassword,
      lastPasswordChange: new Date(),
      updatedAt: new Date(),
      lastModifiedBy: user.id
    });
    
    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * @swagger
 * /api/auth/token-info:
 *   get:
 *     summary: 🔍 Analyser un token et obtenir toutes ses informations
 *     description: |
 *       **🎯 ROUTE DE DEBUGGING ET D'ANALYSE DE TOKENS**
 *       
 *       Cette route publique permet d'analyser n'importe quel token (valide ou invalide) et d'obtenir toutes ses informations détaillées.
 *       
 *       **📋 TYPES DE TOKENS SUPPORTÉS :**
 *       - **JWT** : Tokens de production sécurisés (HS256)
 *       - **Test** : Tokens de développement (base64)
 *       - **Firebase** : Tokens d'authentification Google (RS256)
 *       
 *       **📊 INFORMATIONS RETOURNÉES :**
 *       - ✅ Type et validité du token
 *       - 👤 Données utilisateur complètes
 *       - 🔐 Toutes les permissions calculées
 *       - 👑 Rôle et hiérarchie des permissions
 *       - ⏰ Dates de création et expiration
 *       - 🔍 Métadonnées de la requête
 *       
 *       **🛠️ UTILISATION :**
 *       1. Ajoutez votre token dans le header `Authorization: Bearer [TOKEN]`
 *       2. La route analyse automatiquement le type de token
 *       3. Retourne toutes les informations disponibles
 *       
 *       **💡 CAS D'USAGE :**
 *       - 🐛 Déboguer les problèmes d'authentification
 *       - ✅ Vérifier les permissions d'un utilisateur
 *       - 🕐 Contrôler l'expiration des tokens
 *       - 📈 Analyser la hiérarchie des rôles
 *       - 🔧 Administration et monitoring
 *       
 *       **⚠️ IMPORTANT :** Route publique - pas d'authentification requise
 *     tags: [Authentification]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Token à analyser au format Bearer
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: ✅ Analyse du token réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: Indique si l'analyse s'est bien déroulée
 *                 tokenType:
 *                   type: string
 *                   enum: [JWT, Test, Firebase, Unknown]
 *                   example: "JWT"
 *                   description: Type de token détecté
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                   description: Indique si le token est valide et non expiré
 *                 user:
 *                   type: object
 *                   description: Informations de l'utilisateur associé au token
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "admin_123456789"
 *                       description: Identifiant unique de l'utilisateur
 *                     email:
 *                       type: string
 *                       example: "admin@niaxtu.com"
 *                       description: Adresse email de l'utilisateur
 *                     role:
 *                       type: string
 *                       example: "super_admin"
 *                       description: Rôle de l'utilisateur dans le système
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                       description: Indique si le compte est actif
 *                     isSuperAdmin:
 *                       type: boolean
 *                       example: true
 *                       description: Indique si l'utilisateur est super administrateur
 *                     fromDatabase:
 *                       type: boolean
 *                       example: true
 *                       description: Indique si les données viennent de la base ou du token
 *                 permissions:
 *                   type: object
 *                   description: Détail des permissions de l'utilisateur
 *                   properties:
 *                     all:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["manage_users", "view_users", "create_users", "manage_complaints"]
 *                       description: Liste complète des permissions
 *                     count:
 *                       type: integer
 *                       example: 75
 *                       description: Nombre total de permissions
 *                     hasAll:
 *                       type: boolean
 *                       example: true
 *                       description: Indique si l'utilisateur a toutes les permissions (super admin)
 *                     fromToken:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Permissions stockées dans le token
 *                     fromRole:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Permissions accordées par le rôle
 *                 tokenDetails:
 *                   type: object
 *                   description: Détails techniques du token
 *                   properties:
 *                     issuedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-15T10:30:00.000Z"
 *                       description: Date de création du token
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-16T10:30:00.000Z"
 *                       description: Date d'expiration du token
 *                     remainingTime:
 *                       type: string
 *                       example: "23h 45m"
 *                       description: Temps restant avant expiration
 *                     expired:
 *                       type: boolean
 *                       example: false
 *                       description: Indique si le token a expiré
 *                     algorithm:
 *                       type: string
 *                       example: "HS256"
 *                       description: Algorithme de signature utilisé
 *                     issuer:
 *                       type: string
 *                       example: "Niaxtu Backend"
 *                       description: Émetteur du token
 *                 roleHierarchy:
 *                   type: object
 *                   description: Hiérarchie et capacités du rôle
 *                   properties:
 *                     current:
 *                       type: string
 *                       example: "super_admin"
 *                       description: Rôle actuel de l'utilisateur
 *                     level:
 *                       type: integer
 *                       example: 7
 *                       description: Niveau hiérarchique du rôle (1-7)
 *                     canManage:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["admin", "moderator", "user"]
 *                       description: Rôles que cet utilisateur peut gérer
 *                     description:
 *                       type: string
 *                       example: "Super Administrateur - Accès total sans restriction"
 *                       description: Description du rôle
 *                 rawToken:
 *                   type: object
 *                   description: Informations sur le token brut
 *                   properties:
 *                     length:
 *                       type: integer
 *                       example: 245
 *                       description: Longueur du token en caractères
 *                     preview:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InN1cGVyX2F..."
 *                       description: Aperçu des 50 premiers caractères
 *                 analysis:
 *                   type: object
 *                   description: Métadonnées de l'analyse
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-15T11:00:00.000Z"
 *                       description: Horodatage de l'analyse
 *                     server:
 *                       type: string
 *                       example: "Niaxtu Backend"
 *                       description: Serveur ayant effectué l'analyse
 *                     requestIP:
 *                       type: string
 *                       example: "192.168.1.100"
 *                       description: Adresse IP de la requête
 *             examples:
 *               jwt_token:
 *                 summary: Token JWT valide
 *                 description: Exemple de réponse pour un token JWT de super admin
 *                 value:
 *                   success: true
 *                   tokenType: "JWT"
 *                   valid: true
 *                   user:
 *                     id: "admin_123456789"
 *                     email: "admin@niaxtu.com"
 *                     role: "super_admin"
 *                     isActive: true
 *                     isSuperAdmin: true
 *                   permissions:
 *                     count: 75
 *                     hasAll: true
 *                   tokenDetails:
 *                     remainingTime: "23h 45m"
 *                     expired: false
 *                     algorithm: "HS256"
 *               test_token:
 *                 summary: Token de test
 *                 description: Exemple de réponse pour un token de développement
 *                 value:
 *                   success: true
 *                   tokenType: "Test"
 *                   valid: true
 *                   user:
 *                     email: "test@example.com"
 *                     role: "admin"
 *                     isTestUser: true
 *                   permissions:
 *                     count: 2
 *                     note: "Permissions simplifiées pour token de test"
 *               invalid_token:
 *                 summary: Token invalide
 *                 description: Exemple de réponse pour un token non reconnu
 *                 value:
 *                   success: true
 *                   tokenType: "Unknown"
 *                   valid: false
 *                   error: "Token invalide ou non reconnu"
 *                   details:
 *                     jwtError: "invalid token"
 *                     testError: "Unexpected token"
 *                     firebaseError: "Invalid issuer"
 *       401:
 *         description: ❌ Token manquant dans le header Authorization
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Token manquant"
 *                   description: Type d'erreur rencontrée
 *                 message:
 *                   type: string
 *                   example: "Veuillez fournir un token dans le header Authorization: Bearer [TOKEN]"
 *                   description: Message d'erreur détaillé
 *                 example:
 *                   type: string
 *                   example: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   description: Exemple de header correct
 *             examples:
 *               no_header:
 *                 summary: Header Authorization manquant
 *                 value:
 *                   success: false
 *                   error: "Token manquant"
 *                   message: "Veuillez fournir un token dans le header Authorization: Bearer [TOKEN]"
 *                   example: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       500:
 *         description: ❌ Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Erreur lors de l'analyse du token"
 *                 message:
 *                   type: string
 *                   example: "Une erreur inattendue s'est produite"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-15T11:00:00.000Z"
 */
export const getTokenInfo = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token manquant',
        message: 'Veuillez fournir un token dans le header Authorization: Bearer [TOKEN]',
        example: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    let tokenInfo = {
      success: true,
      tokenType: 'Unknown',
      valid: false,
      user: null,
      permissions: null,
      tokenDetails: null,
      roleHierarchy: null,
      rawToken: {
        length: token.length,
        preview: token.substring(0, 50) + '...'
      }
    };

    // 1. Essayer d'analyser comme token JWT
    try {
      console.log('[TOKEN-INFO] Tentative d\'analyse JWT...');
      const decoded = jwt.verify(token, JWT_SECRET);
      
      tokenInfo.tokenType = 'JWT';
      tokenInfo.valid = true;
      
      // Récupérer les données utilisateur depuis Firestore
      let userData = null;
      try {
        const adminDoc = await db.collection('admin').doc(decoded.id).get();
        if (adminDoc.exists) {
          userData = { id: decoded.id, ...adminDoc.data() };
        }
      } catch (firestoreError) {
        console.log('[TOKEN-INFO] Erreur Firestore, utilisation données du token');
      }
      
      // Utiliser les données du token si pas en base
      const user = userData || {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || [],
        isActive: true,
        isTokenOnly: true
      };
      
      // Calculer les permissions
      const allPermissions = getUserPermissions(user);
      const isSuperAdmin = user.role === UserRoles.SUPER_ADMIN;
      
      tokenInfo.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isSuperAdmin: isSuperAdmin,
        isBlocked: user.isBlocked || false,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        authProvider: user.authProvider || 'local',
        fromDatabase: !!userData
      };
      
      tokenInfo.permissions = {
        all: allPermissions,
        count: allPermissions.length,
        hasAll: isSuperAdmin,
        fromToken: decoded.permissions || [],
        fromRole: RolePermissions[user.role] || []
      };
      
      tokenInfo.tokenDetails = {
        issuedAt: new Date(decoded.iat * 1000).toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        remainingTime: getRemainingTime(decoded.exp * 1000),
        expired: Date.now() > (decoded.exp * 1000),
        algorithm: 'HS256',
        issuer: 'Niaxtu Backend'
      };
      
      tokenInfo.roleHierarchy = {
        current: user.role,
        level: getRoleHierarchy(user.role),
        canManage: getManageableRoles(user.role),
        description: getRoleDescription(user.role)
      };
      
    } catch (jwtError) {
      console.log('[TOKEN-INFO] Pas un JWT valide, essai token de test...');
      
      // 2. Essayer d'analyser comme token de test
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        
        if (decoded.test) {
          tokenInfo.tokenType = 'Test';
          tokenInfo.valid = Date.now() < decoded.exp;
          
          tokenInfo.user = {
            uid: decoded.uid,
            email: decoded.email,
            role: decoded.role,
            isActive: true,
            isSuperAdmin: decoded.role === 'super_admin',
            isTestUser: true
          };
          
          tokenInfo.permissions = {
            all: decoded.role === 'admin' ? ['manage_users', 'view_users'] : ['view_complaints'],
            count: decoded.role === 'admin' ? 2 : 1,
            hasAll: decoded.role === 'super_admin',
            note: 'Permissions simplifiées pour token de test'
          };
          
          tokenInfo.tokenDetails = {
            issuedAt: new Date(decoded.iat).toISOString(),
            expiresAt: new Date(decoded.exp).toISOString(),
            remainingTime: getRemainingTime(decoded.exp),
            expired: Date.now() > decoded.exp,
            algorithm: 'base64',
            issuer: 'Test Token Generator'
          };
          
          tokenInfo.roleHierarchy = {
            current: decoded.role,
            level: decoded.role === 'admin' ? 5 : 1,
            canManage: decoded.role === 'admin' ? ['user'] : [],
            description: `Token de test - ${decoded.role}`
          };
          
        } else {
          throw new Error('Not a test token');
        }
        
      } catch (testError) {
        console.log('[TOKEN-INFO] Pas un token de test, essai Firebase...');
        
        // 3. Essayer d'analyser comme token Firebase
        try {
          const decodedToken = await auth.verifyIdToken(token);
          
          tokenInfo.tokenType = 'Firebase';
          tokenInfo.valid = true;
          
          // Vérifier si l'utilisateur existe en base
          let userData = null;
          try {
            const adminDoc = await db.collection('admin').doc(decodedToken.uid).get();
            if (adminDoc.exists) {
              userData = { id: decodedToken.uid, ...adminDoc.data() };
            }
          } catch (firestoreError) {
            console.log('[TOKEN-INFO] Utilisateur Firebase pas en base admin');
          }
          
          const user = userData || {
            id: decodedToken.uid,
            email: decodedToken.email,
            role: 'user',
            isActive: true,
            isFirebaseOnly: true
          };
          
          tokenInfo.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            name: decodedToken.name,
            picture: decodedToken.picture,
            role: user.role,
            isActive: user.isActive,
            isSuperAdmin: user.role === UserRoles.SUPER_ADMIN,
            isFirebaseUser: true,
            fromDatabase: !!userData
          };
          
          const allPermissions = getUserPermissions(user);
          
          tokenInfo.permissions = {
            all: allPermissions,
            count: allPermissions.length,
            hasAll: user.role === UserRoles.SUPER_ADMIN,
            fromRole: RolePermissions[user.role] || []
          };
          
          tokenInfo.tokenDetails = {
            issuedAt: new Date(decodedToken.iat * 1000).toISOString(),
            expiresAt: new Date(decodedToken.exp * 1000).toISOString(),
            remainingTime: getRemainingTime(decodedToken.exp * 1000),
            expired: Date.now() > (decodedToken.exp * 1000),
            algorithm: 'RS256',
            issuer: 'Firebase'
          };
          
          tokenInfo.roleHierarchy = {
            current: user.role,
            level: getRoleHierarchy(user.role),
            canManage: getManageableRoles(user.role),
            description: getRoleDescription(user.role)
          };
          
        } catch (firebaseError) {
          console.log('[TOKEN-INFO] Échec analyse Firebase:', firebaseError.message);
          
          // Aucune méthode n'a fonctionné
          tokenInfo.valid = false;
          tokenInfo.error = 'Token invalide ou non reconnu';
          tokenInfo.details = {
            jwtError: jwtError.message,
            testError: testError.message,
            firebaseError: firebaseError.message
          };
        }
      }
    }
    
    // Ajouter des métadonnées utiles
    tokenInfo.analysis = {
      timestamp: new Date().toISOString(),
      server: 'Niaxtu Backend',
      version: '1.0.0',
      requestIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };
    
    res.json(tokenInfo);
    
  } catch (error) {
    console.error('[TOKEN-INFO] Erreur générale:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'analyse du token',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Fonctions utilitaires pour l'analyse des tokens
const getRemainingTime = (expTimestamp) => {
  const now = Date.now();
  const remaining = expTimestamp - now;
  
  if (remaining <= 0) return 'Expiré';
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

const getManageableRoles = (userRole) => {
  const hierarchy = {
    [UserRoles.SUPER_ADMIN]: [UserRoles.ADMIN, UserRoles.SECTOR_MANAGER, UserRoles.STRUCTURE_MANAGER, UserRoles.MODERATOR, UserRoles.ANALYST, UserRoles.USER],
    [UserRoles.ADMIN]: [UserRoles.SECTOR_MANAGER, UserRoles.STRUCTURE_MANAGER, UserRoles.MODERATOR, UserRoles.ANALYST, UserRoles.USER],
    [UserRoles.SECTOR_MANAGER]: [UserRoles.STRUCTURE_MANAGER, UserRoles.MODERATOR, UserRoles.ANALYST, UserRoles.USER],
    [UserRoles.STRUCTURE_MANAGER]: [UserRoles.MODERATOR, UserRoles.ANALYST, UserRoles.USER],
    [UserRoles.MODERATOR]: [UserRoles.USER],
    [UserRoles.ANALYST]: [UserRoles.USER],
    [UserRoles.USER]: []
  };
  
  return hierarchy[userRole] || [];
};

const getRoleDescription = (role) => {
  const descriptions = {
    [UserRoles.SUPER_ADMIN]: 'Super Administrateur - Accès total sans restriction',
    [UserRoles.ADMIN]: 'Administrateur - Gestion complète du système',
    [UserRoles.SECTOR_MANAGER]: 'Gestionnaire de Secteur - Gestion des secteurs',
    [UserRoles.STRUCTURE_MANAGER]: 'Gestionnaire de Structure - Gestion des structures',
    [UserRoles.MODERATOR]: 'Modérateur - Modération du contenu',
    [UserRoles.ANALYST]: 'Analyste - Analyse des données',
    [UserRoles.USER]: 'Utilisateur - Accès de base'
  };
  
  return descriptions[role] || 'Rôle non défini';
}; 