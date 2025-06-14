import { hasPermission, isAdmin, isSuperAdmin, UserRoles, UserPermissions } from '../models/User.js';

// Messages d'erreur personnalisés selon le type d'accès refusé
const getPermissionErrorMessage = (permission, userRole) => {
  const messages = {
    [UserPermissions.VIEW_USERS]: "Vous n'avez pas accès à la liste des utilisateurs",
    [UserPermissions.MANAGE_USERS]: "Vous n'avez pas les droits pour gérer les utilisateurs",
    [UserPermissions.CREATE_USERS]: "Vous n'avez pas les droits pour créer des utilisateurs",
    [UserPermissions.EDIT_USERS]: "Vous n'avez pas les droits pour modifier les utilisateurs",
    [UserPermissions.DELETE_USERS]: "Vous n'avez pas les droits pour supprimer les utilisateurs",
    [UserPermissions.VIEW_COMPLAINTS]: "Vous n'avez pas accès aux plaintes",
    [UserPermissions.MANAGE_COMPLAINTS]: "Vous n'avez pas les droits pour gérer les plaintes",
    [UserPermissions.VIEW_REPORTS]: "Vous n'avez pas accès aux rapports",
    [UserPermissions.SYSTEM_ADMIN]: "Vous n'avez pas les droits d'administration système"
  };
  
  return messages[permission] || `Vous n'avez pas accès à cette ressource (permission: ${permission})`;
};

// Middleware pour vérifier les permissions avec messages clairs
export const requirePermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;
    
    console.log(`[PERMISSIONS] Vérification permission "${permission}" pour utilisateur:`, {
      email: user?.email,
      role: user?.role,
      isSuperAdmin: user?.role === UserRoles.SUPER_ADMIN
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentification requise',
        message: 'Veuillez vous connecter pour accéder à cette ressource',
        code: 'NO_AUTH'
      });
    }
    
    // SUPER ADMIN a TOUJOURS accès à TOUT
    if (user.role === UserRoles.SUPER_ADMIN || user.isSuperAdmin) {
      console.log('[PERMISSIONS] Super admin détecté - accès accordé automatiquement');
      return next();
    }
    
    // Vérifier la permission spécifique
    const hasRequiredPermission = hasPermission(user, permission);
    console.log(`[PERMISSIONS] Résultat vérification permission "${permission}":`, hasRequiredPermission);
    
    if (!hasRequiredPermission) {
      const errorMessage = getPermissionErrorMessage(permission, user.role);
      console.log(`[PERMISSIONS] Accès refusé pour "${permission}" - rôle: ${user.role}`);
      
      return res.status(403).json({ 
        success: false,
        error: 'Accès refusé',
        message: errorMessage,
        code: 'INSUFFICIENT_PERMISSIONS',
        details: {
          required: permission,
          userRole: user.role,
          userPermissions: user.permissions || []
        }
      });
    }
    
    console.log(`[PERMISSIONS] Accès accordé pour "${permission}"`);
    next();
  };
};

// Middleware pour vérifier le rôle admin avec message clair
export const requireAdmin = (req, res) => {
  const user = req.user;
  
  console.log('[PERMISSIONS] Vérification rôle admin pour:', user?.email);
  
  if (!user) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentification requise',
      message: 'Veuillez vous connecter pour accéder à cette ressource',
      code: 'NO_AUTH'
    });
  }
  
  // SUPER ADMIN a TOUJOURS accès
  if (user.role === UserRoles.SUPER_ADMIN || user.isSuperAdmin) {
    console.log('[PERMISSIONS] Super admin détecté - accès admin accordé');
    return next();
  }
  
  if (!isAdmin(user)) {
    console.log(`[PERMISSIONS] Accès admin refusé pour rôle: ${user.role}`);
    return res.status(403).json({ 
      success: false,
      error: 'Accès réservé aux administrateurs',
      message: 'Vous n\'avez pas les droits d\'administration nécessaires pour accéder à cette ressource',
      code: 'ADMIN_REQUIRED',
      details: {
        userRole: user.role,
        requiredRole: 'admin ou supérieur'
      }
    });
  }
  
  console.log('[PERMISSIONS] Accès admin accordé');
  next();
};

// Middleware pour vérifier le rôle super admin
export const requireSuperAdmin = (req, res, next) => {
  const user = req.user;
  
  console.log('[PERMISSIONS] Vérification rôle super admin pour:', user?.email);
  
  if (!user) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentification requise',
      message: 'Veuillez vous connecter pour accéder à cette ressource',
      code: 'NO_AUTH'
    });
  }
  
  if (!isSuperAdmin(user) && user.role !== UserRoles.SUPER_ADMIN && !user.isSuperAdmin) {
    console.log(`[PERMISSIONS] Accès super admin refusé pour rôle: ${user.role}`);
    return res.status(403).json({ 
      success: false,
      error: 'Accès réservé aux super administrateurs',
      message: 'Vous n\'avez pas les droits de super administration nécessaires pour accéder à cette ressource',
      code: 'SUPER_ADMIN_REQUIRED',
      details: {
        userRole: user.role,
        requiredRole: 'super_admin'
      }
    });
  }
  
  console.log('[PERMISSIONS] Accès super admin accordé');
  next();
};

// Middleware pour vérifier l'ownership ou les permissions admin
export const requireOwnershipOrAdmin = (userIdField = 'createdBy') => {
  return async (req, res, next) => {
    const user = req.user;
    const resourceId = req.params.id;
    
    console.log(`[PERMISSIONS] Vérification ownership ou admin pour ressource: ${resourceId}`);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentification requise',
        message: 'Veuillez vous connecter pour accéder à cette ressource',
        code: 'NO_AUTH'
      });
    }
    
    // SUPER ADMIN a TOUJOURS accès
    if (user.role === UserRoles.SUPER_ADMIN || user.isSuperAdmin) {
      console.log('[PERMISSIONS] Super admin détecté - accès ownership accordé');
      return next();
    }
    
    // Les admins peuvent tout faire
    if (isAdmin(user)) {
      console.log('[PERMISSIONS] Admin détecté - accès ownership accordé');
      return next();
    }
    
    // Vérifier l'ownership (logique à adapter selon le cas)
    try {
      // Cette partie devra être implémentée selon vos besoins spécifiques
      console.log(`[PERMISSIONS] Vérification ownership pour ${userIdField}`);
      
      // Pour l'instant, on refuse l'accès si pas admin
      return res.status(403).json({ 
        success: false,
        error: 'Accès refusé',
        message: 'Vous n\'avez pas accès à cette ressource. Seuls les propriétaires ou les administrateurs peuvent y accéder.',
        code: 'OWNERSHIP_REQUIRED',
        details: {
          userRole: user.role,
          resourceId: resourceId
        }
      });
    } catch (error) {
      console.error('[PERMISSIONS] Erreur vérification ownership:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Erreur lors de la vérification des permissions',
        message: 'Une erreur est survenue lors de la vérification de vos droits d\'accès',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// Fonction utilitaire pour vérifier les permissions dans les contrôleurs
export const checkPermission = (user, permission) => {
  console.log(`[PERMISSIONS] Vérification permission "${permission}" pour:`, {
    email: user?.email,
    role: user?.role,
    isSuperAdmin: user?.role === UserRoles.SUPER_ADMIN
  });
  
  if (!user) {
    return {
      allowed: false,
      error: 'Authentification requise',
      message: 'Veuillez vous connecter pour accéder à cette ressource',
      code: 'NO_AUTH'
    };
  }
  
  // SUPER ADMIN a TOUJOURS accès à TOUT
  if (user.role === UserRoles.SUPER_ADMIN || user.isSuperAdmin) {
    console.log('[PERMISSIONS] Super admin détecté - accès accordé automatiquement');
    return { allowed: true };
  }
  
  // Vérifier la permission spécifique
  const hasRequiredPermission = hasPermission(user, permission);
  console.log(`[PERMISSIONS] Résultat vérification permission "${permission}":`, hasRequiredPermission);
  
  if (!hasRequiredPermission) {
    const errorMessage = getPermissionErrorMessage(permission, user.role);
    console.log(`[PERMISSIONS] Accès refusé pour "${permission}" - rôle: ${user.role}`);
    
    return {
      allowed: false,
      error: 'Accès refusé',
      message: errorMessage,
      code: 'INSUFFICIENT_PERMISSIONS',
      details: {
        required: permission,
        userRole: user.role,
        userPermissions: user.permissions || []
      }
    };
  }
  
  console.log(`[PERMISSIONS] Accès accordé pour "${permission}"`);
  return { allowed: true };
};

// Fonction pour obtenir les permissions manquantes
export const getMissingPermissions = (user, requiredPermissions) => {
  if (!user) return requiredPermissions;
  
  // SUPER ADMIN a toutes les permissions
  if (user.role === UserRoles.SUPER_ADMIN || user.isSuperAdmin) {
    return [];
  }
  
  const missing = [];
  for (const permission of requiredPermissions) {
    if (!hasPermission(user, permission)) {
      missing.push(permission);
    }
  }
  
  return missing;
};

// Fonction pour créer une réponse d'erreur de permission standardisée
export const createPermissionError = (permission, user, customMessage = null) => {
  const message = customMessage || getPermissionErrorMessage(permission, user?.role);
  
  return {
    success: false,
    error: 'Accès refusé',
    message: message,
    code: 'INSUFFICIENT_PERMISSIONS',
    details: {
      required: permission,
      userRole: user?.role,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    }
  };
}; 