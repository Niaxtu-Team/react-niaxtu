import { db } from '../config/firebase.js';
import { 
  UserRoles, 
  UserPermissions, 
  hasPermission, 
  canManageUser,
  getUserPermissions,
  validatePermissionUpdate,
  hashPassword,
  validatePassword
} from '../models/User.js';

// Obtenir le profil utilisateur
export const getUserProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    
    const userDoc = await db.collection('admin').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const userData = userDoc.data();
    res.json({ 
      success: true, 
      user: { id: uid, ...userData } 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour le profil utilisateur
export const updateUserProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const updates = req.body;
    
    // Valider les données (ajoutez vos validations ici)
    const allowedFields = ['displayName', 'bio', 'location', 'website', 'photoURL'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    // Ajouter timestamp de mise à jour
    filteredUpdates.updatedAt = new Date().toISOString();
    
    await db.collection('admin').doc(uid).set(filteredUpdates, { merge: true });
    
    res.json({ 
      success: true, 
      message: 'Profil mis à jour avec succès',
      user: { id: uid, ...filteredUpdates }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrer par rôle
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom ou email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page à récupérer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'utilisateurs par page
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
export const getAllUsers = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_USERS)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }

    const { 
      role, 
      active, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = db.collection('admin');
    
    // Filtres
    if (role) {
      query = query.where('role', '==', role);
    }
    
    if (active !== undefined) {
      query = query.where('isActive', '==', active === 'true');
    }
    
    // Pour la recherche, on récupère tout et on filtre côté serveur
    // (Firestore ne supporte pas la recherche textuelle native)
    let users = [];
    const snapshot = await query.get();
    
    snapshot.forEach(doc => {
      const userData = { id: doc.id, ...doc.data() };
      
      // Vérifier si l'utilisateur actuel peut voir cet utilisateur
      if (hasPermission(req.user, UserPermissions.LIMITED_USER_VIEW)) {
        // Utilisateur avec vue limitée - ne peut voir que les utilisateurs de niveau inférieur
        if (!canManageUser(req.user, userData)) {
          return; // Skip cet utilisateur
        }
      }
      
      // Filtrer par recherche si spécifiée
      if (search) {
        const searchTerm = search.toLowerCase();
        const searchableText = [
          userData.email,
          userData.displayName,
          userData.profile?.firstName,
          userData.profile?.lastName
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return; // Skip cet utilisateur
        }
      }
      
      // Masquer les informations sensibles selon les permissions
      if (!hasPermission(req.user, UserPermissions.VIEW_USER_ACTIVITY)) {
        delete userData.lastLogin;
        delete userData.loginCount;
        delete userData.failedLoginAttempts;
      }
      
      users.push(userData);
    });
    
    // Tri
    users.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'name') {
        aValue = a.displayName || a.profile?.firstName || a.email;
        bValue = b.displayName || b.profile?.firstName || b.email;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
    
    // Pagination
    const total = users.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedUsers = users.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/users/{uid}:
 *   get:
 *     summary: Récupérer un utilisateur par UID
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *       404:
 *         description: Utilisateur non trouvé
 */
export const getUserById = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Vérifier si l'utilisateur peut voir cet utilisateur spécifique
    if (uid !== req.user.uid && !hasPermission(req.user, UserPermissions.VIEW_USERS)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const doc = await db.collection('admin').doc(uid).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const userData = { id: doc.id, ...doc.data() };
    
    // Vérifier les permissions pour voir un utilisateur spécifique
    if (uid !== req.user.uid && !canManageUser(req.user, userData)) {
      return res.status(403).json({ error: 'Permission insuffisante pour voir cet utilisateur' });
    }
    
    // Masquer les informations sensibles
    if (!hasPermission(req.user, UserPermissions.VIEW_USER_ACTIVITY) && uid !== req.user.uid) {
      delete userData.lastLogin;
      delete userData.loginCount;
      delete userData.failedLoginAttempts;
      delete userData.lockedUntil;
    }
    
    // Ajouter des informations dérivées
    userData.permissions = getUserPermissions(userData);
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               displayName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, moderator, admin, super_admin, sector_manager, structure_manager, analyst]
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Mot de passe requis pour tous les comptes administrateurs
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               accessScope:
 *                 type: object
 *               profile:
 *                 type: object
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 */
export const createUser = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.CREATE_USERS)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const {
      email,
      password,
      displayName,
      role = UserRoles.USER,
      permissions = [],
      accessScope = {},
      profile = {}
    } = req.body;
    
    if (!email?.trim()) {
      return res.status(400).json({ error: 'L\'email est requis' });
    }
    
    // OBLIGATOIRE : Mot de passe requis pour TOUS les comptes administrateurs
    if (!password?.trim()) {
      return res.status(400).json({ 
        error: 'Le mot de passe est obligatoire pour tous les comptes administrateurs' 
      });
    }
    
    // Validation du mot de passe
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'Mot de passe invalide',
        errors: passwordValidation.errors
      });
    }
    
    // Vérifier que l'utilisateur peut assigner ce rôle
    if (!canManageUser(req.user, { role })) {
      return res.status(403).json({ error: 'Permission insuffisante pour assigner ce rôle' });
    }
    
    // Valider les permissions
    try {
      validatePermissionUpdate(req.user, { role }, permissions);
    } catch (error) {
      return res.status(403).json({ error: error.message });
    }
    
    // Vérifier que l'utilisateur n'existe pas déjà
    const existingSnapshot = await db.collection('admin')
      .where('email', '==', email.trim().toLowerCase())
      .limit(1)
      .get();
      
    if (!existingSnapshot.empty) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // SÉCURITÉ : Hasher le mot de passe OBLIGATOIREMENT
    const hashedPassword = await hashPassword(password);
    
    const userData = {
      email: email.trim().toLowerCase(),
      password: hashedPassword, // Mot de passe hashé de manière sécurisée
      displayName: displayName?.trim() || '',
      role,
      permissions,
      accessScope,
      profile,
      authProvider: 'local', // Compte local avec mot de passe
      isActive: true,
      isEmailVerified: false,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.uid,
      lastPasswordChange: new Date().toISOString(),
      version: 1
    };
    
    // Générer un UID pour l'utilisateur (ou utiliser celui fourni)
    const uid = req.body.uid || db.collection('admin').doc().id;
    
    await db.collection('admin').doc(uid).set(userData);
    
    // Log de l'action
    await logAction('CREATE_USER', req.user.uid, { 
      targetUserId: uid, 
      email,
      role,
      hasPassword: true // Confirmer que le mot de passe a été hashé
    });
    
    // Réponse sans le mot de passe hashé
    const { password: _, ...userResponse } = userData;
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: { uid, ...userResponse }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/users/{uid}:
 *   put:
 *     summary: Modifier un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur modifié avec succès
 */
export const updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Vérifier les permissions - un utilisateur peut se modifier lui-même
    const isSelfUpdate = uid === req.user.uid;
    if (!isSelfUpdate && !hasPermission(req.user, UserPermissions.EDIT_USERS)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const doc = await db.collection('admin').doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const currentUserData = doc.data();
    
    // Vérifier que l'utilisateur peut modifier cet utilisateur spécifique
    if (!isSelfUpdate && !canManageUser(req.user, currentUserData)) {
      return res.status(403).json({ error: 'Permission insuffisante pour modifier cet utilisateur' });
    }
    
    const {
      displayName,
      role,
      permissions,
      accessScope,
      profile,
      preferences,
      isActive
    } = req.body;
    
    const updateData = {};
    
    // Mise à jour du nom d'affichage
    if (displayName !== undefined) {
      updateData.displayName = displayName.trim();
    }
    
    // Mise à jour du rôle (seulement par les admins)
    if (role !== undefined) {
      if (isSelfUpdate) {
        return res.status(403).json({ error: 'Impossible de modifier son propre rôle' });
      }
      
      if (!hasPermission(req.user, UserPermissions.MANAGE_USER_ROLES)) {
        return res.status(403).json({ error: 'Permission insuffisante pour modifier les rôles' });
      }
      
      if (!canManageUser(req.user, { role })) {
        return res.status(403).json({ error: 'Permission insuffisante pour assigner ce rôle' });
      }
      
      updateData.role = role;
    }
    
    // Mise à jour des permissions (seulement par les admins)
    if (permissions !== undefined) {
      if (isSelfUpdate) {
        return res.status(403).json({ error: 'Impossible de modifier ses propres permissions' });
      }
      
      if (!hasPermission(req.user, UserPermissions.ASSIGN_PERMISSIONS)) {
        return res.status(403).json({ error: 'Permission insuffisante pour modifier les permissions' });
      }
      
      try {
        validatePermissionUpdate(req.user, currentUserData, permissions);
        updateData.permissions = permissions;
      } catch (error) {
        return res.status(403).json({ error: error.message });
      }
    }
    
    // Mise à jour du scope d'accès
    if (accessScope !== undefined) {
      if (isSelfUpdate) {
        return res.status(403).json({ error: 'Impossible de modifier son propre scope d\'accès' });
      }
      
      if (!hasPermission(req.user, UserPermissions.MANAGE_USERS)) {
        return res.status(403).json({ error: 'Permission insuffisante pour modifier le scope d\'accès' });
      }
      
      updateData.accessScope = {
        ...currentUserData.accessScope,
        ...accessScope
      };
    }
    
    // Mise à jour du profil
    if (profile !== undefined) {
      updateData.profile = {
        ...currentUserData.profile,
        ...profile
      };
    }
    
    // Mise à jour des préférences (autorisé pour soi-même)
    if (preferences !== undefined) {
      updateData.preferences = {
        ...currentUserData.preferences,
        ...preferences
      };
    }
    
    // Activation/désactivation (seulement par les admins)
    if (isActive !== undefined) {
      if (isSelfUpdate) {
        return res.status(403).json({ error: 'Impossible de modifier son propre statut d\'activation' });
      }
      
      if (!hasPermission(req.user, UserPermissions.ACTIVATE_USERS)) {
        return res.status(403).json({ error: 'Permission insuffisante pour activer/désactiver des utilisateurs' });
      }
      
      updateData.isActive = isActive;
    }
    
    updateData.updatedAt = new Date().toISOString();
    updateData.updatedBy = req.user.uid;
    updateData.version = (currentUserData.version || 1) + 1;
    
    await db.collection('admin').doc(uid).update(updateData);
    
    // Log de l'action
    await logAction('UPDATE_USER', req.user.uid, { 
      targetUserId: uid, 
      changes: Object.keys(updateData),
      isSelfUpdate
    });
    
    res.json({
      success: true,
      message: 'Utilisateur modifié avec succès',
      data: updateData
    });
  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/users/{uid}/role:
 *   put:
 *     summary: Modifier le rôle d'un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
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
 *                 enum: [user, moderator, admin, super_admin, sector_manager, structure_manager, analyst]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               accessScope:
 *                 type: object
 *     responses:
 *       200:
 *         description: Rôle modifié avec succès
 */
export const updateUserRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const { role, permissions = [], accessScope } = req.body;
    
    if (!hasPermission(req.user, UserPermissions.MANAGE_USER_ROLES)) {
      return res.status(403).json({ error: 'Permission insuffisante pour modifier les rôles' });
    }
    
    if (uid === req.user.uid) {
      return res.status(403).json({ error: 'Impossible de modifier son propre rôle' });
    }
    
    const doc = await db.collection('admin').doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const currentUserData = doc.data();
    
    if (!canManageUser(req.user, currentUserData)) {
      return res.status(403).json({ error: 'Permission insuffisante pour modifier cet utilisateur' });
    }
    
    if (!canManageUser(req.user, { role })) {
      return res.status(403).json({ error: 'Permission insuffisante pour assigner ce rôle' });
    }
    
    // Valider les permissions
    try {
      validatePermissionUpdate(req.user, currentUserData, permissions);
    } catch (error) {
      return res.status(403).json({ error: error.message });
    }
    
    const updateData = {
      role,
      permissions,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid,
      version: (currentUserData.version || 1) + 1
    };
    
    if (accessScope) {
      updateData.accessScope = accessScope;
    }
    
    await db.collection('admin').doc(uid).update(updateData);
    
    // Log de l'action
    await logAction('UPDATE_USER_ROLE', req.user.uid, { 
      targetUserId: uid, 
      oldRole: currentUserData.role,
      newRole: role,
      permissions,
      accessScope
    });
    
    res.json({
      success: true,
      message: 'Rôle utilisateur mis à jour avec succès',
      data: updateData
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/users/{uid}/activate:
 *   put:
 *     summary: Activer/désactiver un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
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
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Statut utilisateur modifié
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { uid } = req.params;
    const { isActive, reason } = req.body;
    
    if (!hasPermission(req.user, UserPermissions.ACTIVATE_USERS)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    if (uid === req.user.uid) {
      return res.status(403).json({ error: 'Impossible de modifier son propre statut' });
    }
    
    const doc = await db.collection('admin').doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const currentUserData = doc.data();
    
    if (!canManageUser(req.user, currentUserData)) {
      return res.status(403).json({ error: 'Permission insuffisante pour modifier cet utilisateur' });
    }
    
    const updateData = {
      isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid,
      version: (currentUserData.version || 1) + 1
    };
    
    // Si on désactive l'utilisateur, on peut ajouter une date de verrouillage
    if (!isActive) {
      updateData.lockedUntil = null; // Verrouillage permanent jusqu'à réactivation
      updateData.deactivationReason = reason || 'Désactivation manuelle';
    } else {
      updateData.lockedUntil = null;
      updateData.deactivationReason = null;
      updateData.failedLoginAttempts = 0; // Reset des tentatives échouées
    }
    
    await db.collection('admin').doc(uid).update(updateData);
    
    // Log de l'action
    await logAction('TOGGLE_USER_STATUS', req.user.uid, { 
      targetUserId: uid, 
      isActive,
      reason: reason || null
    });
    
    res.json({
      success: true,
      message: `Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`,
      data: { isActive }
    });
  } catch (error) {
    console.error('Erreur lors de la modification du statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/users/{uid}:
 *   delete:
 *     summary: Supprimer un utilisateur (soft delete)
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 */
export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    
    if (!hasPermission(req.user, UserPermissions.DELETE_USERS)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    if (uid === req.user.uid) {
      return res.status(403).json({ error: 'Impossible de supprimer son propre compte' });
    }
    
    const doc = await db.collection('admin').doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const currentUserData = doc.data();
    
    if (!canManageUser(req.user, currentUserData)) {
      return res.status(403).json({ error: 'Permission insuffisante pour supprimer cet utilisateur' });
    }
    
    // Vérifier s'il y a des données liées (plaintes créées, etc.)
    const complaintsSnapshot = await db.collection('complaints')
      .where('userId', '==', uid)
      .limit(1)
      .get();
    
    if (!complaintsSnapshot.empty) {
      // Soft delete - marquer comme supprimé mais garder les données
      const updateData = {
        isActive: false,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user.uid,
        email: `deleted_${uid}@deleted.local`, // Anonymiser l'email
        displayName: 'Utilisateur supprimé',
        updatedAt: new Date().toISOString(),
        version: (currentUserData.version || 1) + 1
      };
      
      await db.collection('admin').doc(uid).update(updateData);
      
      // Log de l'action
      await logAction('SOFT_DELETE_USER', req.user.uid, { 
        targetUserId: uid, 
        reason: 'Données liées existantes',
        complaintsCount: complaintsSnapshot.size
      });
      
      res.json({
        success: true,
        message: 'Utilisateur supprimé (soft delete) car il a des données liées'
      });
    } else {
      // Hard delete - supprimer complètement
      await db.collection('admin').doc(uid).delete();
      
      // Log de l'action
      await logAction('DELETE_USER', req.user.uid, { 
        targetUserId: uid,
        userEmail: currentUserData.email
      });
      
      res.json({
        success: true,
        message: 'Utilisateur supprimé définitivement'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Récupérer les statistiques des utilisateurs
 *     tags: [Utilisateurs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des utilisateurs
 */
export const getUsersStats = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_REPORTS)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const usersSnapshot = await db.collection('admin').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (!userData.isDeleted) { // Exclure les utilisateurs supprimés
        users.push(userData);
      }
    });
    
    const stats = {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      byRole: {},
      recentRegistrations: 0,
      lockedAccounts: users.filter(u => u.lockedUntil && new Date(u.lockedUntil) > new Date()).length,
      twoFactorEnabled: users.filter(u => u.isTwoFactorEnabled).length
    };
    
    // Statistiques par rôle
    Object.values(UserRoles).forEach(role => {
      stats.byRole[role] = users.filter(u => u.role === role).length;
    });
    
    // Inscriptions récentes (derniers 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    stats.recentRegistrations = users.filter(u => 
      u.createdAt && new Date(u.createdAt) > thirtyDaysAgo
    ).length;
    
    // Statistiques d'activité (derniers 7 jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    stats.activeLastWeek = users.filter(u => 
      u.lastActivity && new Date(u.lastActivity) > sevenDaysAgo
    ).length;
    
    res.json({
      success: true,
      data: stats,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ===================== FONCTIONS UTILITAIRES =====================

// Logger les actions
export const logAction = async (action, userId, details = {}) => {
  try {
    await db.collection('audit_logs').add({
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
      ip: details.ip || null,
      userAgent: details.userAgent || null
    });
  } catch (error) {
    console.error('Erreur lors du logging:', error);
  }
}; 