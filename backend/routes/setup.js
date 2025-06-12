import express from 'express';
import dotenv from 'dotenv';
import process from 'process';
import { db } from '../config/firebase.js';
import { UserRoles, hashPassword } from '../models/User.js';

// Charger les variables d'environnement
dotenv.config();

const router = express.Router();

// Fonction pour compter le nombre de super admins
const getNextSuperAdminCount = async () => {
  try {
    const snapshot = await db.collection('admin')
      .where('role', '==', UserRoles.SUPER_ADMIN)
      .get();
    return snapshot.size + 1;
  } catch {
    return 1;
  }
};

/**
 * @swagger
 * /api/setup/create-super-admin:
 *   post:
 *     summary: 🔐 ROUTE ADMIN - Créer un Super Administrateur
 *     description: Cette route permet de créer des super administrateurs. Accessible en permanence pour la gestion administrative.
 *     tags: [Setup - Administration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - displayName
 *               - setupKey
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email du super administrateur
 *                 example: admin@niaxtu.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Mot de passe (minimum 8 caractères)
 *                 example: SuperAdmin2024!
 *               displayName:
 *                 type: string
 *                 description: Nom d'affichage
 *                 example: Super Administrateur
 *               setupKey:
 *                 type: string
 *                 description: Clé de sécurité pour l'initialisation
 *                 example: NIAXTU_SUPER_ADMIN_SETUP_2024
 *               profile:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     example: Super
 *                   lastName:
 *                     type: string
 *                     example: Administrateur
 *                   phone:
 *                     type: string
 *                     example: +221 77 123 45 67
 *                   organization:
 *                     type: string
 *                     example: Niaxtu Administration
 *                   position:
 *                     type: string
 *                     example: Super Administrateur Système
 *     responses:
 *       201:
 *         description: Super administrateur créé avec succès
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
 *                   example: Super administrateur créé avec succès. Cette route est maintenant désactivée.
 *                 data:
 *                   type: object
 *                   properties:
 *                     uid:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: super_admin
 *       400:
 *         description: Données invalides ou setup déjà effectué
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     already_setup:
 *                       value: Le système a déjà été initialisé. Cette route n'est plus disponible.
 *                     invalid_key:
 *                       value: Clé de setup invalide
 *                     invalid_data:
 *                       value: Données manquantes ou invalides
 *       500:
 *         description: Erreur serveur
 */
export const createSuperAdmin = async (req, res) => {
  try {
    // Cette route est maintenant toujours active pour créer des super admins
    
    const {
      email,
      password,
      displayName,
      setupKey,
      profile = {}
    } = req.body;
    
    // Validation des données
    if (!email || !password || !displayName || !setupKey) {
      return res.status(400).json({ 
        error: 'Tous les champs obligatoires doivent être renseignés (email, password, displayName, setupKey)' 
      });
    }
    
    // Validation de la clé de setup (configurable via variable d'environnement)
    const validSetupKey = process.env.NIAXTU_SETUP_KEY || 'NIAXTU_SUPER_ADMIN_SETUP_2024';
    if (setupKey !== validSetupKey) {
      return res.status(400).json({ 
        error: 'Clé de setup invalide',
        hint: 'Vérifiez la variable d\'environnement NIAXTU_SETUP_KEY'
      });
    }
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }
    
    // Validation du mot de passe
    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }
    
    // Générer un UID unique pour le super admin
    const uid = `super_admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password);
    
    // Créer les données du super administrateur
    const superAdminData = {
      email: email.trim().toLowerCase(),
      displayName: displayName.trim(),
      role: UserRoles.SUPER_ADMIN,
      permissions: [], // Les super admins ont toutes les permissions par défaut
      accessScope: {}, // Accès global - pas de restrictions
      profile: {
        firstName: profile.firstName || 'Super',
        lastName: profile.lastName || 'Administrateur',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        region: profile.region || '',
        department: profile.department || '',
        organization: profile.organization || 'Niaxtu Administration',
        position: profile.position || 'Super Administrateur Système',
        bio: 'Compte super administrateur du système Niaxtu'
      },
      isActive: true,
      isEmailVerified: true, // Auto-vérifié pour le super admin
      isTwoFactorEnabled: false,
      loginCount: 0,
      failedLoginAttempts: 0,
      preferences: {
        language: 'fr',
        timezone: 'Africa/Dakar',
        theme: 'light',
        notifications: {
          email: true,
          sms: false,
          push: true,
          frequency: 'immediate'
        }
      },
      password: hashedPassword, // Mot de passe hashé de manière sécurisée
      authProvider: 'local',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'SYSTEM_SETUP',
      version: 1,
      setupInfo: {
        isInitialSuperAdmin: true,
        setupDate: new Date().toISOString(),
        setupMethod: 'INITIAL_SETUP_ROUTE'
      }
    };
    
    // Créer l'administrateur dans Firestore
    await db.collection('admin').doc(uid).set(superAdminData);
    
    // Log de la création du super admin
    await db.collection('audit_logs').add({
      action: 'CREATE_SUPER_ADMIN',
      userId: uid,
      details: {
        email: superAdminData.email,
        setupMethod: 'INITIAL_SETUP_ROUTE',
        timestamp: new Date().toISOString(),
        isSystemInitialization: true
      },
      timestamp: new Date().toISOString(),
      ip: req.ip || null,
      userAgent: req.get('User-Agent') || null
    });
    
    // Enregistrer l'activité de création
    await db.collection('system_config').doc('last_super_admin_creation').set({
      lastCreatedAt: new Date().toISOString(),
      createdBy: 'SETUP_ROUTE',
      adminUid: uid,
      count: await getNextSuperAdminCount()
    });
    
    // Réponse (sans le mot de passe)
    const responseData = {
      uid,
      email: superAdminData.email,
      displayName: superAdminData.displayName,
      role: superAdminData.role,
      profile: superAdminData.profile,
      createdAt: superAdminData.createdAt
    };
    
    res.status(201).json({
      success: true,
      message: '🎉 Super administrateur créé avec succès !',
      data: responseData,
      nextSteps: [
        '1. Connectez-vous avec ces identifiants',
        '2. Créez d\'autres administrateurs selon vos besoins', 
        '3. Configurez les secteurs et structures',
        '4. Gérez votre plateforme d\'administration'
      ],
      security: {
        note: 'Conservez précieusement ces identifiants',
        info: 'Cette route reste active pour créer d\'autres super administrateurs'
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la création du super administrateur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création du super administrateur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Route POST pour créer le super admin
router.post('/create-super-admin', createSuperAdmin);

// Route pour vérifier le statut du setup
router.get('/status', async (req, res) => {
  try {
    const setupDoc = await db.collection('system_config').doc('setup_status').get();
    
    if (setupDoc.exists) {
      const setupData = setupDoc.data();
      res.json({
        success: true,
        isSetupComplete: setupData.isSetupComplete || false,
        superAdminCreated: setupData.superAdminCreated || false,
        setupDate: setupData.setupDate || null
      });
    } else {
      res.json({
        success: true,
        isSetupComplete: false,
        superAdminCreated: false,
        setupDate: null
      });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router; 