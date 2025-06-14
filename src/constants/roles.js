// constants/roles.js

// Hiérarchie des rôles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',         // Accès total sans exception
  ADMIN: 'admin',                     // Administration générale
  SECTOR_MANAGER: 'sector_manager',   // Gestion de secteur
  STRUCTURE_MANAGER: 'structure_manager', // Gestion de structure
  MODERATOR: 'moderator',             // Modération
  ANALYST: 'analyst',                 // Analyse de données
  USER: 'user'                        // Utilisateur standard
};

// Permissions disponibles
export const PERMISSIONS = {
  // Gestion des utilisateurs
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  MANAGE_USER_ROLES: 'manage_user_roles',

  // Gestion des plaintes
  VIEW_COMPLAINTS: 'view_complaints',
  CREATE_COMPLAINTS: 'create_complaints',
  EDIT_COMPLAINTS: 'edit_complaints',
  DELETE_COMPLAINTS: 'delete_complaints',
  MANAGE_COMPLAINT_STATUS: 'manage_complaint_status',
  EXPORT_COMPLAINTS: 'export_complaints',

  // Gestion des structures
  VIEW_STRUCTURES: 'view_structures',
  CREATE_STRUCTURES: 'create_structures',
  EDIT_STRUCTURES: 'edit_structures',
  DELETE_STRUCTURES: 'delete_structures',
  MANAGE_STRUCTURES: 'manage_structures',

  // Gestion des secteurs
  VIEW_SECTORS: 'view_sectors',
  CREATE_SECTORS: 'create_sectors',
  EDIT_SECTORS: 'edit_sectors',
  DELETE_SECTORS: 'delete_sectors',
  MANAGE_SECTORS: 'manage_sectors',

  // Administration système
  VIEW_ADMIN_PANEL: 'view_admin_panel',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  VIEW_SYSTEM_LOGS: 'view_system_logs',
  MANAGE_PERMISSIONS: 'manage_permissions',

  // Rapports et analyses
  VIEW_REPORTS: 'view_reports',
  CREATE_REPORTS: 'create_reports',
  EXPORT_DATA: 'export_data',
  VIEW_ANALYTICS: 'view_analytics',

  // Modération
  MODERATE_CONTENT: 'moderate_content',
  MANAGE_COMMENTS: 'manage_comments',
  BAN_USERS: 'ban_users'
};

// Messages d'erreur standard
export const ERROR_MESSAGES = {
  NO_TOKEN: 'Veuillez vous connecter pour accéder à cette ressource',
  INVALID_TOKEN: 'Votre session a expiré. Veuillez vous reconnecter.',
  INSUFFICIENT_PERMISSIONS: 'Vous n\'avez pas accès à cette ressource',
  ACCOUNT_DISABLED: 'Votre compte a été désactivé. Contactez l\'administrateur.',
  SERVER_ERROR: 'Une erreur est survenue. Veuillez réessayer.',
  ROLE_REQUIRED: 'Votre rôle ne permet pas d\'accéder à cette section',
  PERMISSION_REQUIRED: 'Permission insuffisante pour cette action'
};

// Mapping des rôles vers leurs permissions par défaut
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [], // Super admin a TOUTES les permissions automatiquement
  
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.VIEW_COMPLAINTS,
    PERMISSIONS.MANAGE_COMPLAINT_STATUS,
    PERMISSIONS.VIEW_STRUCTURES,
    PERMISSIONS.CREATE_STRUCTURES,
    PERMISSIONS.EDIT_STRUCTURES,
    PERMISSIONS.VIEW_SECTORS,
    PERMISSIONS.CREATE_SECTORS,
    PERMISSIONS.EDIT_SECTORS,
    PERMISSIONS.VIEW_ADMIN_PANEL,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MODERATE_CONTENT
  ],
  
  [ROLES.SECTOR_MANAGER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_COMPLAINTS,
    PERMISSIONS.MANAGE_COMPLAINT_STATUS,
    PERMISSIONS.VIEW_SECTORS,
    PERMISSIONS.EDIT_SECTORS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA
  ],
  
  [ROLES.STRUCTURE_MANAGER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_COMPLAINTS,
    PERMISSIONS.VIEW_STRUCTURES,
    PERMISSIONS.EDIT_STRUCTURES,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.MODERATOR]: [
    PERMISSIONS.VIEW_COMPLAINTS,
    PERMISSIONS.MANAGE_COMPLAINT_STATUS,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.MANAGE_COMMENTS
  ],
  
  [ROLES.ANALYST]: [
    PERMISSIONS.VIEW_COMPLAINTS,
    PERMISSIONS.VIEW_STRUCTURES,
    PERMISSIONS.VIEW_SECTORS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA
  ],
  
  [ROLES.USER]: [
    PERMISSIONS.VIEW_COMPLAINTS,
    PERMISSIONS.CREATE_COMPLAINTS
  ]
};

// Fonction utilitaire pour vérifier si un rôle a une permission
export const roleHasPermission = (role, permission) => {
  // Super admin a toutes les permissions
  if (role === ROLES.SUPER_ADMIN) return true;
  
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

// Fonction utilitaire pour obtenir toutes les permissions d'un rôle
export const getRolePermissions = (role) => {
  // Super admin a toutes les permissions
  if (role === ROLES.SUPER_ADMIN) {
    return Object.values(PERMISSIONS);
  }
  
  return ROLE_PERMISSIONS[role] || [];
};

// Fonction utilitaire pour vérifier la hiérarchie des rôles
export const isRoleHigherThan = (role1, role2) => {
  const hierarchy = [
    ROLES.USER,
    ROLES.ANALYST,
    ROLES.MODERATOR,
    ROLES.STRUCTURE_MANAGER,
    ROLES.SECTOR_MANAGER,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  ];
  
  const index1 = hierarchy.indexOf(role1);
  const index2 = hierarchy.indexOf(role2);
  
  return index1 > index2;
};

// Labels français pour l'interface
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Administrateur',
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.SECTOR_MANAGER]: 'Gestionnaire de Secteur',
  [ROLES.STRUCTURE_MANAGER]: 'Gestionnaire de Structure',
  [ROLES.MODERATOR]: 'Modérateur',
  [ROLES.ANALYST]: 'Analyste',
  [ROLES.USER]: 'Utilisateur'
};

export const PERMISSION_LABELS = {
  [PERMISSIONS.VIEW_USERS]: 'Voir les utilisateurs',
  [PERMISSIONS.CREATE_USERS]: 'Créer des utilisateurs',
  [PERMISSIONS.EDIT_USERS]: 'Modifier les utilisateurs',
  [PERMISSIONS.DELETE_USERS]: 'Supprimer les utilisateurs',
  [PERMISSIONS.MANAGE_USER_ROLES]: 'Gérer les rôles utilisateurs',
  
  [PERMISSIONS.VIEW_COMPLAINTS]: 'Voir les plaintes',
  [PERMISSIONS.CREATE_COMPLAINTS]: 'Créer des plaintes',
  [PERMISSIONS.EDIT_COMPLAINTS]: 'Modifier les plaintes',
  [PERMISSIONS.DELETE_COMPLAINTS]: 'Supprimer les plaintes',
  [PERMISSIONS.MANAGE_COMPLAINT_STATUS]: 'Gérer le statut des plaintes',
  [PERMISSIONS.EXPORT_COMPLAINTS]: 'Exporter les plaintes',
  
  [PERMISSIONS.VIEW_STRUCTURES]: 'Voir les structures',
  [PERMISSIONS.CREATE_STRUCTURES]: 'Créer des structures',
  [PERMISSIONS.EDIT_STRUCTURES]: 'Modifier les structures',
  [PERMISSIONS.DELETE_STRUCTURES]: 'Supprimer les structures',
  [PERMISSIONS.MANAGE_STRUCTURES]: 'Gérer les structures',
  
  [PERMISSIONS.VIEW_SECTORS]: 'Voir les secteurs',
  [PERMISSIONS.CREATE_SECTORS]: 'Créer des secteurs',
  [PERMISSIONS.EDIT_SECTORS]: 'Modifier les secteurs',
  [PERMISSIONS.DELETE_SECTORS]: 'Supprimer les secteurs',
  [PERMISSIONS.MANAGE_SECTORS]: 'Gérer les secteurs',
  
  [PERMISSIONS.VIEW_ADMIN_PANEL]: 'Accéder au panneau d\'administration',
  [PERMISSIONS.MANAGE_SYSTEM_SETTINGS]: 'Gérer les paramètres système',
  [PERMISSIONS.VIEW_SYSTEM_LOGS]: 'Voir les logs système',
  [PERMISSIONS.MANAGE_PERMISSIONS]: 'Gérer les permissions',
  
  [PERMISSIONS.VIEW_REPORTS]: 'Voir les rapports',
  [PERMISSIONS.CREATE_REPORTS]: 'Créer des rapports',
  [PERMISSIONS.EXPORT_DATA]: 'Exporter les données',
  [PERMISSIONS.VIEW_ANALYTICS]: 'Voir les analyses',
  
  [PERMISSIONS.MODERATE_CONTENT]: 'Modérer le contenu',
  [PERMISSIONS.MANAGE_COMMENTS]: 'Gérer les commentaires',
  [PERMISSIONS.BAN_USERS]: 'Bannir des utilisateurs'
}; 
