// Système de rôles et permissions avancé pour Niaxtu
import bcrypt from 'bcryptjs';
import validator from 'validator';

export const UserRoles = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SECTOR_MANAGER: 'sector_manager',
  STRUCTURE_MANAGER: 'structure_manager', 
  MODERATOR: 'moderator',
  ANALYST: 'analyst',
  USER: 'user'
};

export const UserPermissions = {
  // === GESTION DES UTILISATEURS ===
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  ACTIVATE_USERS: 'activate_users',
  MANAGE_USER_ROLES: 'manage_user_roles',
  ASSIGN_PERMISSIONS: 'assign_permissions',
  VIEW_USER_ACTIVITY: 'view_user_activity',
  
  // === GESTION DES PLAINTES ===
  MANAGE_COMPLAINTS: 'manage_complaints',
  VIEW_COMPLAINTS: 'view_complaints',
  CREATE_COMPLAINTS: 'create_complaints',
  EDIT_COMPLAINTS: 'edit_complaints',
  DELETE_COMPLAINTS: 'delete_complaints',
  RESOLVE_COMPLAINTS: 'resolve_complaints',
  REJECT_COMPLAINTS: 'reject_complaints',
  ASSIGN_COMPLAINTS: 'assign_complaints',
  PRIORITIZE_COMPLAINTS: 'prioritize_complaints',
  COMMENT_COMPLAINTS: 'comment_complaints',
  VIEW_COMPLAINT_HISTORY: 'view_complaint_history',
  BULK_UPDATE_COMPLAINTS: 'bulk_update_complaints',
  
  // === GESTION DES SECTEURS ===
  MANAGE_SECTORS: 'manage_sectors',
  VIEW_SECTORS: 'view_sectors',
  CREATE_SECTORS: 'create_sectors',
  EDIT_SECTORS: 'edit_sectors',
  DELETE_SECTORS: 'delete_sectors',
  ACTIVATE_SECTORS: 'activate_sectors',
  REORDER_SECTORS: 'reorder_sectors',
  
  // === GESTION DES SOUS-SECTEURS ===
  MANAGE_SUBSECTORS: 'manage_subsectors',
  VIEW_SUBSECTORS: 'view_subsectors',
  CREATE_SUBSECTORS: 'create_subsectors',
  EDIT_SUBSECTORS: 'edit_subsectors',
  DELETE_SUBSECTORS: 'delete_subsectors',
  ACTIVATE_SUBSECTORS: 'activate_subsectors',
  ASSIGN_SUBSECTORS: 'assign_subsectors',
  
  // === GESTION DES STRUCTURES ===
  MANAGE_STRUCTURES: 'manage_structures',
  VIEW_STRUCTURES: 'view_structures',
  CREATE_STRUCTURES: 'create_structures',
  EDIT_STRUCTURES: 'edit_structures',
  DELETE_STRUCTURES: 'delete_structures',
  ACTIVATE_STRUCTURES: 'activate_structures',
  MANAGE_STRUCTURE_CAPACITY: 'manage_structure_capacity',
  MANAGE_STRUCTURE_HOURS: 'manage_structure_hours',
  
  // === GESTION DES TYPES ===
  MANAGE_COMPLAINT_TYPES: 'manage_complaint_types',
  VIEW_COMPLAINT_TYPES: 'view_complaint_types',
  CREATE_COMPLAINT_TYPES: 'create_complaint_types',
  EDIT_COMPLAINT_TYPES: 'edit_complaint_types',
  DELETE_COMPLAINT_TYPES: 'delete_complaint_types',
  
  MANAGE_TARGET_TYPES: 'manage_target_types',
  VIEW_TARGET_TYPES: 'view_target_types',
  CREATE_TARGET_TYPES: 'create_target_types',
  EDIT_TARGET_TYPES: 'edit_target_types',
  DELETE_TARGET_TYPES: 'delete_target_types',
  
  // === RAPPORTS ET STATISTIQUES ===
  VIEW_REPORTS: 'view_reports',
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
  CREATE_REPORTS: 'create_reports',
  EXPORT_DATA: 'export_data',
  EXPORT_COMPLAINTS: 'export_complaints',
  EXPORT_USERS: 'export_users',
  EXPORT_SECTORS: 'export_sectors',
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',
  
  // === ADMINISTRATION SYSTÈME ===
  SYSTEM_ADMIN: 'system_admin',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_LOGS: 'view_logs',
  MANAGE_BACKUPS: 'manage_backups',
  MANAGE_NOTIFICATIONS: 'manage_notifications',
  CONFIGURE_WORKFLOWS: 'configure_workflows',
  
  // === PERMISSIONS SPÉCIALES ===
  BULK_OPERATIONS: 'bulk_operations',
  ADVANCED_SEARCH: 'advanced_search',
  DATA_MIGRATION: 'data_migration',
  API_ACCESS: 'api_access',
  WEBHOOK_MANAGEMENT: 'webhook_management',
  
  // === PERMISSIONS CONTEXTUELLES ===
  OWN_COMPLAINTS_ONLY: 'own_complaints_only',
  SECTOR_COMPLAINTS_ONLY: 'sector_complaints_only',
  STRUCTURE_COMPLAINTS_ONLY: 'structure_complaints_only',
  LIMITED_USER_VIEW: 'limited_user_view'
};

// Permissions par rôle avec hiérarchie avancée
export const RolePermissions = {
  [UserRoles.SUPER_ADMIN]: Object.values(UserPermissions),
  
  [UserRoles.ADMIN]: [
    // Gestion des utilisateurs (sauf super admin)
    UserPermissions.MANAGE_USERS,
    UserPermissions.VIEW_USERS,
    UserPermissions.CREATE_USERS,
    UserPermissions.EDIT_USERS,
    UserPermissions.ACTIVATE_USERS,
    UserPermissions.MANAGE_USER_ROLES,
    UserPermissions.VIEW_USER_ACTIVITY,
    
    // Gestion complète des plaintes
    UserPermissions.MANAGE_COMPLAINTS,
    UserPermissions.VIEW_COMPLAINTS,
    UserPermissions.CREATE_COMPLAINTS,
    UserPermissions.EDIT_COMPLAINTS,
    UserPermissions.DELETE_COMPLAINTS,
    UserPermissions.RESOLVE_COMPLAINTS,
    UserPermissions.REJECT_COMPLAINTS,
    UserPermissions.ASSIGN_COMPLAINTS,
    UserPermissions.PRIORITIZE_COMPLAINTS,
    UserPermissions.COMMENT_COMPLAINTS,
    UserPermissions.VIEW_COMPLAINT_HISTORY,
    UserPermissions.BULK_UPDATE_COMPLAINTS,
    
    // Gestion complète des secteurs
    UserPermissions.MANAGE_SECTORS,
    UserPermissions.VIEW_SECTORS,
    UserPermissions.CREATE_SECTORS,
    UserPermissions.EDIT_SECTORS,
    UserPermissions.DELETE_SECTORS,
    UserPermissions.ACTIVATE_SECTORS,
    UserPermissions.REORDER_SECTORS,
    
    // Gestion complète des sous-secteurs
    UserPermissions.MANAGE_SUBSECTORS,
    UserPermissions.VIEW_SUBSECTORS,
    UserPermissions.CREATE_SUBSECTORS,
    UserPermissions.EDIT_SUBSECTORS,
    UserPermissions.DELETE_SUBSECTORS,
    UserPermissions.ACTIVATE_SUBSECTORS,
    UserPermissions.ASSIGN_SUBSECTORS,
    
    // Gestion complète des structures
    UserPermissions.MANAGE_STRUCTURES,
    UserPermissions.VIEW_STRUCTURES,
    UserPermissions.CREATE_STRUCTURES,
    UserPermissions.EDIT_STRUCTURES,
    UserPermissions.DELETE_STRUCTURES,
    UserPermissions.ACTIVATE_STRUCTURES,
    UserPermissions.MANAGE_STRUCTURE_CAPACITY,
    UserPermissions.MANAGE_STRUCTURE_HOURS,
    
    // Gestion des types
    UserPermissions.MANAGE_COMPLAINT_TYPES,
    UserPermissions.VIEW_COMPLAINT_TYPES,
    UserPermissions.CREATE_COMPLAINT_TYPES,
    UserPermissions.EDIT_COMPLAINT_TYPES,
    UserPermissions.DELETE_COMPLAINT_TYPES,
    UserPermissions.MANAGE_TARGET_TYPES,
    UserPermissions.VIEW_TARGET_TYPES,
    UserPermissions.CREATE_TARGET_TYPES,
    UserPermissions.EDIT_TARGET_TYPES,
    UserPermissions.DELETE_TARGET_TYPES,
    
    // Rapports complets
    UserPermissions.VIEW_REPORTS,
    UserPermissions.VIEW_DASHBOARD,
    UserPermissions.VIEW_ANALYTICS,
    UserPermissions.CREATE_REPORTS,
    UserPermissions.EXPORT_DATA,
    UserPermissions.EXPORT_COMPLAINTS,
    UserPermissions.EXPORT_USERS,
    UserPermissions.EXPORT_SECTORS,
    
    // Opérations avancées
    UserPermissions.BULK_OPERATIONS,
    UserPermissions.ADVANCED_SEARCH,
    UserPermissions.API_ACCESS
  ],
  
  [UserRoles.SECTOR_MANAGER]: [
    // Visualisation des utilisateurs limitée
    UserPermissions.VIEW_USERS,
    UserPermissions.LIMITED_USER_VIEW,
    
    // Gestion des plaintes de son secteur
    UserPermissions.VIEW_COMPLAINTS,
    UserPermissions.EDIT_COMPLAINTS,
    UserPermissions.RESOLVE_COMPLAINTS,
    UserPermissions.REJECT_COMPLAINTS,
    UserPermissions.ASSIGN_COMPLAINTS,
    UserPermissions.PRIORITIZE_COMPLAINTS,
    UserPermissions.COMMENT_COMPLAINTS,
    UserPermissions.VIEW_COMPLAINT_HISTORY,
    UserPermissions.SECTOR_COMPLAINTS_ONLY,
    
    // Gestion limitée des secteurs
    UserPermissions.VIEW_SECTORS,
    UserPermissions.EDIT_SECTORS,
    
    // Gestion des sous-secteurs de son secteur
    UserPermissions.MANAGE_SUBSECTORS,
    UserPermissions.VIEW_SUBSECTORS,
    UserPermissions.CREATE_SUBSECTORS,
    UserPermissions.EDIT_SUBSECTORS,
    UserPermissions.ACTIVATE_SUBSECTORS,
    UserPermissions.ASSIGN_SUBSECTORS,
    
    // Gestion des structures de son secteur
    UserPermissions.MANAGE_STRUCTURES,
    UserPermissions.VIEW_STRUCTURES,
    UserPermissions.CREATE_STRUCTURES,
    UserPermissions.EDIT_STRUCTURES,
    UserPermissions.ACTIVATE_STRUCTURES,
    UserPermissions.MANAGE_STRUCTURE_CAPACITY,
    UserPermissions.MANAGE_STRUCTURE_HOURS,
    
    // Types de plaintes de son secteur
    UserPermissions.VIEW_COMPLAINT_TYPES,
    UserPermissions.CREATE_COMPLAINT_TYPES,
    UserPermissions.EDIT_COMPLAINT_TYPES,
    UserPermissions.VIEW_TARGET_TYPES,
    UserPermissions.CREATE_TARGET_TYPES,
    UserPermissions.EDIT_TARGET_TYPES,
    
    // Rapports de son secteur
    UserPermissions.VIEW_REPORTS,
    UserPermissions.VIEW_DASHBOARD,
    UserPermissions.VIEW_ANALYTICS,
    UserPermissions.EXPORT_COMPLAINTS,
    UserPermissions.EXPORT_SECTORS
  ],
  
  [UserRoles.STRUCTURE_MANAGER]: [
    // Gestion des plaintes de sa structure
    UserPermissions.VIEW_COMPLAINTS,
    UserPermissions.EDIT_COMPLAINTS,
    UserPermissions.RESOLVE_COMPLAINTS,
    UserPermissions.COMMENT_COMPLAINTS,
    UserPermissions.VIEW_COMPLAINT_HISTORY,
    UserPermissions.STRUCTURE_COMPLAINTS_ONLY,
    
    // Visualisation limitée
    UserPermissions.VIEW_SECTORS,
    UserPermissions.VIEW_SUBSECTORS,
    UserPermissions.VIEW_STRUCTURES,
    
    // Gestion de sa structure
    UserPermissions.EDIT_STRUCTURES,
    UserPermissions.MANAGE_STRUCTURE_CAPACITY,
    UserPermissions.MANAGE_STRUCTURE_HOURS,
    
    // Rapports limités
    UserPermissions.VIEW_REPORTS,
    UserPermissions.VIEW_DASHBOARD,
    UserPermissions.EXPORT_COMPLAINTS
  ],
  
  [UserRoles.MODERATOR]: [
    UserPermissions.VIEW_USERS,
    UserPermissions.LIMITED_USER_VIEW,
    
    UserPermissions.MANAGE_COMPLAINTS,
    UserPermissions.VIEW_COMPLAINTS,
    UserPermissions.EDIT_COMPLAINTS,
    UserPermissions.RESOLVE_COMPLAINTS,
    UserPermissions.REJECT_COMPLAINTS,
    UserPermissions.ASSIGN_COMPLAINTS,
    UserPermissions.COMMENT_COMPLAINTS,
    UserPermissions.VIEW_COMPLAINT_HISTORY,
    
    UserPermissions.VIEW_SECTORS,
    UserPermissions.VIEW_SUBSECTORS,
    UserPermissions.VIEW_STRUCTURES,
    UserPermissions.VIEW_COMPLAINT_TYPES,
    UserPermissions.VIEW_TARGET_TYPES,
    
    UserPermissions.VIEW_REPORTS,
    UserPermissions.VIEW_DASHBOARD,
    UserPermissions.EXPORT_COMPLAINTS
  ],
  
  [UserRoles.ANALYST]: [
    UserPermissions.VIEW_USERS,
    UserPermissions.LIMITED_USER_VIEW,
    
    UserPermissions.VIEW_COMPLAINTS,
    UserPermissions.VIEW_COMPLAINT_HISTORY,
    UserPermissions.COMMENT_COMPLAINTS,
    
    UserPermissions.VIEW_SECTORS,
    UserPermissions.VIEW_SUBSECTORS,
    UserPermissions.VIEW_STRUCTURES,
    UserPermissions.VIEW_COMPLAINT_TYPES,
    UserPermissions.VIEW_TARGET_TYPES,
    
    UserPermissions.VIEW_REPORTS,
    UserPermissions.VIEW_DASHBOARD,
    UserPermissions.VIEW_ANALYTICS,
    UserPermissions.CREATE_REPORTS,
    UserPermissions.EXPORT_DATA,
    UserPermissions.EXPORT_COMPLAINTS,
    UserPermissions.ADVANCED_SEARCH
  ],
  
  [UserRoles.USER]: [
    UserPermissions.CREATE_COMPLAINTS,
    UserPermissions.VIEW_COMPLAINTS,
    UserPermissions.OWN_COMPLAINTS_ONLY,
    UserPermissions.COMMENT_COMPLAINTS,
    
    UserPermissions.VIEW_SECTORS,
    UserPermissions.VIEW_SUBSECTORS,
    UserPermissions.VIEW_STRUCTURES,
    UserPermissions.VIEW_COMPLAINT_TYPES,
    UserPermissions.VIEW_TARGET_TYPES
  ]
};

// Validation de sécurité des mots de passe
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)');
  }
  
  if (password.length > 128) {
    errors.push('Le mot de passe ne peut pas dépasser 128 caractères');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Hashage sécurisé du mot de passe
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Vérification du mot de passe
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Validation de l'email
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'L\'email est requis' };
  }
  
  if (!validator.isEmail(email)) {
    return { isValid: false, error: 'Format d\'email invalide' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'L\'email ne peut pas dépasser 254 caractères' };
  }
  
  return { isValid: true };
};

// Structure étendue du modèle User avec champs de mot de passe
export const UserSchema = {
  // Informations de base
  uid: String, // Firebase UID (optionnel pour les admins locaux)
  email: String, // Email unique
  password: String, // Mot de passe hashé (pour les admins locaux)
  displayName: String,
  photoURL: String,
  phoneNumber: String,
  
  // Système de rôles et permissions
  role: {
    type: String,
    enum: Object.values(UserRoles),
    default: UserRoles.ADMIN
  },
  permissions: [String], // Permissions supplémentaires
  
  // Permissions contextuelles par secteur/structure
  contextualPermissions: {
    sectors: [{
      sectorId: String,
      permissions: [String]
    }],
    structures: [{
      structureId: String,
      permissions: [String]
    }]
  },
  
  // Authentification et sécurité
  authProvider: {
    type: String,
    enum: ['firebase', 'local', 'google'],
    default: 'local'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastPasswordChange: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Métadonnées de connexion
  lastLogin: Date,
  lastLoginIP: String,
  loginHistory: [{
    timestamp: Date,
    ip: String,
    userAgent: String,
    success: Boolean,
    location: String
  }],
  
  // Statut et activation
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: String,
  
  // Profil utilisateur étendu
  profile: {
    firstName: String,
    lastName: String,
    title: String,
    department: String,
    organization: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    preferences: {
      language: {
        type: String,
        default: 'fr'
      },
      timezone: {
        type: String,
        default: 'Africa/Abidjan'
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        push: {
          type: Boolean,
          default: true
        },
        sms: {
          type: Boolean,
          default: false
        }
      },
      dashboard: {
        layout: String,
        widgets: [String]
      }
    }
  },
  
  // Métadonnées système
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: String, // ID de l'utilisateur qui a créé ce compte
  lastModifiedBy: String
};

// Fonction pour vérifier si le compte est verrouillé
export const isAccountLocked = (user) => {
  return user.lockUntil && user.lockUntil > Date.now();
};

// Fonction pour incrémenter les tentatives de connexion
export const incrementLoginAttempts = async (user) => {
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes
  
  user.loginAttempts = (user.loginAttempts || 0) + 1;
  
  if (user.loginAttempts >= maxAttempts) {
    user.lockUntil = new Date(Date.now() + lockTime);
  }
  
  return user;
};

// Fonction pour réinitialiser les tentatives de connexion
export const resetLoginAttempts = (user) => {
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  return user;
};

// Fonctions utilitaires avancées
export const hasPermission = (user, permission, context = {}) => {
  if (!user || !user.role) return false;
  
  // Super Admin a tous les droits
  if (user.role === UserRoles.SUPER_ADMIN) return true;
  
  const rolePermissions = RolePermissions[user.role] || [];
  const userPermissions = user.permissions || [];
  const allPermissions = [...rolePermissions, ...userPermissions];
  
  // Vérification de base
  if (!allPermissions.includes(permission)) return false;
  
  // Vérifications contextuelles
  if (context.sectorId && user.accessScope?.sectorIds) {
    if (!user.accessScope.sectorIds.includes(context.sectorId)) {
      // Sauf si permission limitée au secteur
      if (allPermissions.includes(UserPermissions.SECTOR_COMPLAINTS_ONLY)) {
        return false;
      }
    }
  }
  
  if (context.structureId && user.accessScope?.structureIds) {
    if (!user.accessScope.structureIds.includes(context.structureId)) {
      if (allPermissions.includes(UserPermissions.STRUCTURE_COMPLAINTS_ONLY)) {
        return false;
      }
    }
  }
  
  if (context.ownerId && allPermissions.includes(UserPermissions.OWN_COMPLAINTS_ONLY)) {
    return context.ownerId === user.uid;
  }
  
  return true;
};

export const hasRole = (user, role) => {
  return user && user.role === role;
};

export const getRoleHierarchy = (role) => {
  const hierarchy = {
    [UserRoles.SUPER_ADMIN]: 7,
    [UserRoles.ADMIN]: 6,
    [UserRoles.SECTOR_MANAGER]: 5,
    [UserRoles.STRUCTURE_MANAGER]: 4,
    [UserRoles.MODERATOR]: 3,
    [UserRoles.ANALYST]: 2,
    [UserRoles.USER]: 1
  };
  return hierarchy[role] || 0;
};

export const canManageUser = (manager, targetUser) => {
  if (!manager || !targetUser) return false;
  if (manager.uid === targetUser.uid) return false; // Ne peut pas se gérer lui-même
  
  const managerLevel = getRoleHierarchy(manager.role);
  const targetLevel = getRoleHierarchy(targetUser.role);
  
  return managerLevel > targetLevel;
};

export const getUserPermissions = (user) => {
  if (!user || !user.role) return [];
  
  const rolePermissions = RolePermissions[user.role] || [];
  const userPermissions = user.permissions || [];
  
  return [...new Set([...rolePermissions, ...userPermissions])];
};

export const isSuperAdmin = (user) => hasRole(user, UserRoles.SUPER_ADMIN);
export const isAdmin = (user) => hasRole(user, UserRoles.ADMIN) || isSuperAdmin(user);
export const isModerator = (user) => hasRole(user, UserRoles.MODERATOR) || isAdmin(user);
export const isSectorManager = (user) => hasRole(user, UserRoles.SECTOR_MANAGER) || isAdmin(user);
export const isStructureManager = (user) => hasRole(user, UserRoles.STRUCTURE_MANAGER) || isSectorManager(user);

// Validation des permissions
export const validatePermissionUpdate = (user, targetUser, newPermissions) => {
  if (!canManageUser(user, targetUser)) {
    throw new Error('Permission insuffisante pour modifier cet utilisateur');
  }
  
  const userPermissions = getUserPermissions(user);
  const unauthorizedPermissions = newPermissions.filter(p => !userPermissions.includes(p));
  
  if (unauthorizedPermissions.length > 0) {
    throw new Error(`Permissions non autorisées: ${unauthorizedPermissions.join(', ')}`);
  }
  
  return true;
}; 