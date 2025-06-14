import { useAuth } from './useAuth';
import { PERMISSIONS, ROLES } from '../constants/roles';

/**
 * Hook utilitaire pour simplifier la gestion des permissions
 * Fournit des fonctions helper pour les vérifications courantes
 */
export const usePermissions = () => {
  const { hasPermission, hasRole, isSuperAdmin, user } = useAuth();

  // Permissions utilisateurs
  const canViewUsers = () => hasPermission(PERMISSIONS.VIEW_USERS);
  const canCreateUsers = () => hasPermission(PERMISSIONS.CREATE_USERS);
  const canEditUsers = () => hasPermission(PERMISSIONS.EDIT_USERS);
  const canDeleteUsers = () => hasPermission(PERMISSIONS.DELETE_USERS);
  const canManageUserRoles = () => hasPermission(PERMISSIONS.MANAGE_USER_ROLES);

  // Permissions plaintes
  const canViewComplaints = () => hasPermission(PERMISSIONS.VIEW_COMPLAINTS);
  const canCreateComplaints = () => hasPermission(PERMISSIONS.CREATE_COMPLAINTS);
  const canEditComplaints = () => hasPermission(PERMISSIONS.EDIT_COMPLAINTS);
  const canDeleteComplaints = () => hasPermission(PERMISSIONS.DELETE_COMPLAINTS);
  const canManageComplaintStatus = () => hasPermission(PERMISSIONS.MANAGE_COMPLAINT_STATUS);
  const canExportComplaints = () => hasPermission(PERMISSIONS.EXPORT_COMPLAINTS);

  // Permissions structures
  const canViewStructures = () => hasPermission(PERMISSIONS.VIEW_STRUCTURES);
  const canCreateStructures = () => hasPermission(PERMISSIONS.CREATE_STRUCTURES);
  const canEditStructures = () => hasPermission(PERMISSIONS.EDIT_STRUCTURES);
  const canDeleteStructures = () => hasPermission(PERMISSIONS.DELETE_STRUCTURES);
  const canManageStructures = () => hasPermission(PERMISSIONS.MANAGE_STRUCTURES);

  // Permissions secteurs
  const canViewSectors = () => hasPermission(PERMISSIONS.VIEW_SECTORS);
  const canCreateSectors = () => hasPermission(PERMISSIONS.CREATE_SECTORS);
  const canEditSectors = () => hasPermission(PERMISSIONS.EDIT_SECTORS);
  const canDeleteSectors = () => hasPermission(PERMISSIONS.DELETE_SECTORS);
  const canManageSectors = () => hasPermission(PERMISSIONS.MANAGE_SECTORS);

  // Permissions administration
  const canViewAdminPanel = () => hasPermission(PERMISSIONS.VIEW_ADMIN_PANEL);
  const canManageSystemSettings = () => hasPermission(PERMISSIONS.MANAGE_SYSTEM_SETTINGS);
  const canViewSystemLogs = () => hasPermission(PERMISSIONS.VIEW_SYSTEM_LOGS);
  const canManagePermissions = () => hasPermission(PERMISSIONS.MANAGE_PERMISSIONS);

  // Permissions rapports
  const canViewReports = () => hasPermission(PERMISSIONS.VIEW_REPORTS);
  const canCreateReports = () => hasPermission(PERMISSIONS.CREATE_REPORTS);
  const canExportData = () => hasPermission(PERMISSIONS.EXPORT_DATA);
  const canViewAnalytics = () => hasPermission(PERMISSIONS.VIEW_ANALYTICS);

  // Permissions modération
  const canModerateContent = () => hasPermission(PERMISSIONS.MODERATE_CONTENT);
  const canManageComments = () => hasPermission(PERMISSIONS.MANAGE_COMMENTS);
  const canBanUsers = () => hasPermission(PERMISSIONS.BAN_USERS);

  // Vérifications de rôles
  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isSectorManager = () => hasRole(ROLES.SECTOR_MANAGER);
  const isStructureManager = () => hasRole(ROLES.STRUCTURE_MANAGER);
  const isModerator = () => hasRole(ROLES.MODERATOR);
  const isAnalyst = () => hasRole(ROLES.ANALYST);

  // Vérifications combinées
  const canManageUsers = () => {
    return isSuperAdmin() || isAdmin() || canEditUsers();
  };

  const canAccessAdminFeatures = () => {
    return isSuperAdmin() || isAdmin() || canViewAdminPanel();
  };

  const canManageContent = () => {
    return isSuperAdmin() || isAdmin() || isModerator() || canModerateContent();
  };

  const canViewAllData = () => {
    return isSuperAdmin() || isAdmin() || isAnalyst();
  };

  // Vérification si l'utilisateur peut modifier un autre utilisateur
  const canEditUser = (targetUser) => {
    if (!targetUser) return false;
    
    // Super admin peut tout faire
    if (isSuperAdmin()) return true;
    
    // Ne peut pas modifier un super admin
    if (targetUser.role === ROLES.SUPER_ADMIN) return false;
    
    // Admin peut modifier les rôles inférieurs
    if (isAdmin()) {
      return targetUser.role !== ROLES.ADMIN || targetUser.id === user?.id;
    }
    
    // Peut seulement modifier son propre profil
    return targetUser.id === user?.id && canEditUsers();
  };

  // Vérification si l'utilisateur peut supprimer un autre utilisateur
  const canDeleteUser = (targetUser) => {
    if (!targetUser) return false;
    
    // Super admin peut tout faire sauf se supprimer lui-même
    if (isSuperAdmin()) {
      return targetUser.id !== user?.id;
    }
    
    // Ne peut pas supprimer un super admin ou admin
    if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(targetUser.role)) {
      return false;
    }
    
    // Admin peut supprimer les rôles inférieurs
    if (isAdmin()) {
      return canDeleteUsers();
    }
    
    return false;
  };

  // Fonction utilitaire pour obtenir les actions disponibles pour un utilisateur
  const getAvailableActionsForUser = (targetUser) => {
    const actions = [];
    
    if (canEditUser(targetUser)) {
      actions.push('edit');
    }
    
    if (canDeleteUser(targetUser)) {
      actions.push('delete');
    }
    
    if (canManageUserRoles() && targetUser.role !== ROLES.SUPER_ADMIN) {
      actions.push('changeRole');
    }
    
    if (canBanUsers() && targetUser.id !== user?.id) {
      actions.push('ban');
    }
    
    return actions;
  };

  // Fonction pour vérifier les permissions multiples
  const hasAnyPermission = (permissions) => {
    if (isSuperAdmin()) return true;
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions) => {
    if (isSuperAdmin()) return true;
    return permissions.every(permission => hasPermission(permission));
  };

  // Fonction pour obtenir le niveau d'accès
  const getAccessLevel = () => {
    if (isSuperAdmin()) return 'FULL';
    if (isAdmin()) return 'ADMIN';
    if (isSectorManager() || isStructureManager()) return 'MANAGER';
    if (isModerator() || isAnalyst()) return 'SPECIALIST';
    return 'LIMITED';
  };

  return {
    // Permissions utilisateurs
    canViewUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canManageUserRoles,
    
    // Permissions plaintes
    canViewComplaints,
    canCreateComplaints,
    canEditComplaints,
    canDeleteComplaints,
    canManageComplaintStatus,
    canExportComplaints,
    
    // Permissions structures
    canViewStructures,
    canCreateStructures,
    canEditStructures,
    canDeleteStructures,
    canManageStructures,
    
    // Permissions secteurs
    canViewSectors,
    canCreateSectors,
    canEditSectors,
    canDeleteSectors,
    canManageSectors,
    
    // Permissions administration
    canViewAdminPanel,
    canManageSystemSettings,
    canViewSystemLogs,
    canManagePermissions,
    
    // Permissions rapports
    canViewReports,
    canCreateReports,
    canExportData,
    canViewAnalytics,
    
    // Permissions modération
    canModerateContent,
    canManageComments,
    canBanUsers,
    
    // Vérifications de rôles
    isAdmin,
    isSectorManager,
    isStructureManager,
    isModerator,
    isAnalyst,
    isSuperAdmin,
    
    // Vérifications combinées
    canManageUsers,
    canAccessAdminFeatures,
    canManageContent,
    canViewAllData,
    
    // Fonctions avancées
    canEditUser,
    canDeleteUser,
    getAvailableActionsForUser,
    hasAnyPermission,
    hasAllPermissions,
    getAccessLevel,
    
    // Accès aux fonctions de base
    hasPermission,
    hasRole,
    user
  };
}; 
