import { hasPermission, isAdmin, isSuperAdmin } from '../models/User.js';

// Middleware pour vérifier les permissions
export const requirePermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentification requise' 
      });
    }
    
    if (!hasPermission(user, permission)) {
      return res.status(403).json({ 
        error: 'Permission insuffisante',
        required: permission,
        userRole: user.role 
      });
    }
    
    next();
  };
};

// Middleware pour vérifier le rôle admin
export const requireAdmin = (req, res, next) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ 
      error: 'Authentification requise' 
    });
  }
  
  if (!isAdmin(user)) {
    return res.status(403).json({ 
      error: 'Accès réservé aux administrateurs',
      userRole: user.role 
    });
  }
  
  next();
};

// Middleware pour vérifier le rôle super admin
export const requireSuperAdmin = (req, res, next) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ 
      error: 'Authentification requise' 
    });
  }
  
  if (!isSuperAdmin(user)) {
    return res.status(403).json({ 
      error: 'Accès réservé aux super administrateurs',
      userRole: user.role 
    });
  }
  
  next();
};

// Middleware pour vérifier l'ownership ou les permissions admin
export const requireOwnershipOrAdmin = (userIdField = 'createdBy') => {
  return async (req, res, next) => {
    const user = req.user;
    const resourceId = req.params.id;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentification requise' 
      });
    }
    
    // Les admins peuvent tout faire
    if (isAdmin(user)) {
      return next();
    }
    
    // Vérifier l'ownership (logique à adapter selon le cas)
    // Cette partie devra être implémentée selon vos besoins
    try {
      // Exemple : vérifier si l'utilisateur est le propriétaire de la ressource
      // const resource = await getResourceById(resourceId);
      // if (resource && resource[userIdField] === user.uid) {
      //   return next();
      // }
      
      return res.status(403).json({ 
        error: 'Accès refusé - ressource non autorisée' 
      });
    } catch (error) {
      return res.status(500).json({ 
        error: 'Erreur lors de la vérification des permissions' 
      });
    }
  };
}; 