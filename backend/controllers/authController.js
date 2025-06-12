import { db } from '../config/firebase.js';
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
  getUserPermissions
} from '../models/User.js';
import jwt from 'jsonwebtoken';
import process from 'process';

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
        loginHistory: db.FieldValue.arrayUnion(loginEntry),
        lastLogin: success ? new Date() : db.FieldValue.serverTimestamp(),
        lastLoginIP: success ? getClientIP(req) : db.FieldValue.serverTimestamp()
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