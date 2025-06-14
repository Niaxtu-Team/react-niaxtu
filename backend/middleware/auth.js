import { auth, db } from '../config/firebase.js';
import jwt from 'jsonwebtoken';
import { UserRoles } from '../models/User.js';

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'niaxtu-super-secret-key-2024';

// Fonction pour vérifier un token JWT local
const verifyJWTToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('[AUTH] Vérification token JWT pour:', decoded.email);
    
    // Récupérer les données administrateur depuis Firestore
    const adminDoc = await db.collection('admin').doc(decoded.id).get();
    
    if (!adminDoc.exists) {
      console.log('[AUTH] Admin non trouvé en base, utilisation des données du token');
      // Si l'admin n'existe plus en base, on utilise les données du token
      // mais on marque le compte comme potentiellement obsolète
      return {
        id: decoded.id,
        uid: decoded.id,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || [],
        isActive: true, // On assume actif si pas d'info contraire
        isJWTUser: true,
        isTokenOnly: true // Flag pour indiquer que les données viennent du token uniquement
      };
    }
    
    const adminData = adminDoc.data();
    console.log('[AUTH] Admin trouvé en base:', adminData.email, 'rôle:', adminData.role);
    
    // IMPORTANT : Le super admin ne peut JAMAIS être désactivé
    if (adminData.role === UserRoles.SUPER_ADMIN) {
      console.log('[AUTH] Super admin détecté - accès total garanti');
      return {
        id: decoded.id,
        uid: decoded.id, // Compatibilité avec l'ancien système
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions,
        ...adminData,
        isActive: true, // FORCE l'activation pour le super admin
        isBlocked: false, // FORCE le déblocage pour le super admin
        isJWTUser: true,
        isSuperAdmin: true
      };
    }
    
    // Vérifier si le compte est actif (sauf pour super admin)
    if (adminData.isActive === false || adminData.isBlocked) {
      throw new Error('Compte désactivé ou bloqué');
    }
    
    return {
      id: decoded.id,
      uid: decoded.id, // Compatibilité avec l'ancien système
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
      ...adminData,
      isJWTUser: true
    };
  } catch (error) {
    console.error('[AUTH] Erreur vérification JWT:', error.message);
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token JWT invalide - format incorrect');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token JWT expiré - reconnexion requise');
    }
    throw new Error(`Token JWT invalide: ${error.message}`);
  }
};

// Fonction pour vérifier un token de test
const verifyTestToken = (token) => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Vérifier que c'est un token de test
    if (!decoded.test) {
      throw new Error('Not a test token');
    }
    
    // Vérifier l'expiration
    if (decoded.exp < Date.now()) {
      throw new Error('Token de test expiré');
    }
    
    return {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
      emailVerified: true,
      name: `Test User (${decoded.role})`,
      picture: null,
      isTestUser: true,
      isActive: true
    };
  } catch (error) {
    throw new Error(`Token de test invalide: ${error.message}`);
  }
};

// Middleware principal pour vérifier l'authentification (JWT, Firebase, ou Test)
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Token d\'authentification manquant',
        message: 'Veuillez vous connecter pour accéder à cette ressource',
        code: 'NO_TOKEN',
        action: 'LOGIN_REQUIRED'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('[AUTH] Tentative d\'authentification avec token:', token.substring(0, 20) + '...');
    
    // 1. Essayer d'abord de vérifier comme token JWT local
    try {
      const jwtUser = await verifyJWTToken(token);
      console.log('[AUTH] Authentification JWT réussie pour:', jwtUser.email);
      req.user = jwtUser;
      return next();
    } catch (jwtError) {
      console.log('[AUTH] Échec JWT:', jwtError.message);
      // Si ce n'est pas un token JWT valide, continuer avec les autres méthodes
    }
    
    // 2. Essayer ensuite de vérifier comme token de test
    try {
      const testUser = verifyTestToken(token);
      console.log('[AUTH] Authentification test réussie pour:', testUser.email);
      req.user = testUser;
      return next();
    } catch (testError) {
      console.log('[AUTH] Échec test token:', testError.message);
      // Si ce n'est pas un token de test, continuer avec Firebase
    }
    
    // 3. Vérifier le token avec Firebase Admin
    try {
      console.log('[AUTH] Tentative d\'authentification Firebase...');
      const decodedToken = await auth.verifyIdToken(token);
      
      // Récupérer les données administrateur depuis Firestore
      const adminDoc = await db.collection('admin').doc(decodedToken.uid).get();
      
      if (adminDoc.exists) {
        const adminData = adminDoc.data();
        console.log('[AUTH] Admin Firebase trouvé:', adminData.email, 'rôle:', adminData.role);
        
        // IMPORTANT : Le super admin ne peut JAMAIS être désactivé
        if (adminData.role === UserRoles.SUPER_ADMIN) {
          console.log('[AUTH] Super admin Firebase détecté - accès total garanti');
          req.user = {
            uid: decodedToken.uid,
            id: decodedToken.uid, // Compatibilité avec le nouveau système
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            name: decodedToken.name,
            picture: decodedToken.picture,
            ...adminData,
            isActive: true, // FORCE l'activation pour le super admin
            isBlocked: false, // FORCE le déblocage pour le super admin
            isFirebaseUser: true,
            isSuperAdmin: true
          };
        } else {
          // Vérifier si le compte est actif (sauf pour super admin)
          if (adminData.isActive === false || adminData.isBlocked) {
            return res.status(403).json({ 
              success: false,
              error: 'Compte désactivé',
              message: 'Votre compte a été désactivé. Contactez l\'administrateur.',
              code: 'ACCOUNT_DISABLED',
              action: 'CONTACT_ADMIN'
            });
          }
          
          // Administrateur existant avec profil complet
          req.user = {
            uid: decodedToken.uid,
            id: decodedToken.uid, // Compatibilité avec le nouveau système
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            name: decodedToken.name,
            picture: decodedToken.picture,
            ...adminData,
            isFirebaseUser: true
          };
        }
      } else {
        console.log('[AUTH] Nouvel admin Firebase, création du profil par défaut');
        // Nouvel administrateur ou administrateur sans profil
        req.user = {
          uid: decodedToken.uid,
          id: decodedToken.uid, // Compatibilité avec le nouveau système
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          name: decodedToken.name,
          picture: decodedToken.picture,
          role: 'admin',
          permissions: [],
          isActive: true,
          isFirebaseUser: true
        };
      }
      
      console.log('[AUTH] Authentification Firebase réussie pour:', req.user.email);
      return next();
    } catch (firebaseError) {
      console.error('[AUTH] Échec Firebase:', firebaseError.message);
    }
    
    // Si toutes les méthodes ont échoué
    return res.status(401).json({ 
      success: false,
      error: 'Token d\'authentification invalide',
      message: 'Votre session a expiré ou le token est invalide. Veuillez vous reconnecter.',
      code: 'INVALID_TOKEN',
      action: 'LOGIN_REQUIRED'
    });
    
  } catch (error) {
    console.error('[AUTH] Erreur générale d\'authentification:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Erreur d\'authentification',
      message: 'Une erreur est survenue lors de la vérification de votre authentification. Veuillez vous reconnecter.',
      code: 'AUTH_ERROR',
      action: 'LOGIN_REQUIRED'
    });
  }
};

// Middleware pour vérifier l'authentification Firebase uniquement (rétrocompatibilité)
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Token d\'authentification manquant',
        message: 'Veuillez vous connecter pour accéder à cette ressource',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Essayer d'abord de vérifier comme token de test
    try {
      const testUser = verifyTestToken(token);
      req.user = testUser;
      return next();
    } catch (testError) {
      // Si ce n'est pas un token de test, continuer avec Firebase
    }
    
    // Vérifier le token avec Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);
    
    // Récupérer les données administrateur depuis Firestore
    const adminDoc = await db.collection('admin').doc(decodedToken.uid).get();
    
    if (adminDoc.exists) {
      const adminData = adminDoc.data();
      
      // IMPORTANT : Le super admin ne peut JAMAIS être désactivé
      if (adminData.role === UserRoles.SUPER_ADMIN) {
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          name: decodedToken.name,
          picture: decodedToken.picture,
          ...adminData,
          isActive: true, // FORCE l'activation pour le super admin
          isBlocked: false, // FORCE le déblocage pour le super admin
          isSuperAdmin: true
        };
      } else {
        // Vérifier si le compte est actif (sauf pour super admin)
        if (adminData.isActive === false || adminData.isBlocked) {
          return res.status(403).json({ 
            success: false,
            error: 'Compte désactivé',
            message: 'Votre compte a été désactivé. Contactez l\'administrateur.',
            code: 'ACCOUNT_DISABLED'
          });
        }
        
        // Administrateur existant avec profil complet
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          name: decodedToken.name,
          picture: decodedToken.picture,
          ...adminData
        };
      }
    } else {
      // Nouvel administrateur ou administrateur sans profil
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        role: 'admin',
        permissions: [],
        isActive: true
      };
    }
    
    next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Token d\'authentification invalide',
      message: 'Votre session a expiré. Veuillez vous reconnecter.',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware optionnel pour l'authentification (n'échoue pas si pas de token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      
      // Essayer d'abord le token JWT
      try {
        const jwtUser = await verifyJWTToken(token);
        req.user = jwtUser;
        return next();
      } catch (jwtError) {
        // Continuer avec les autres méthodes
      }
      
      // Essayer ensuite le token de test
      try {
        const testUser = verifyTestToken(token);
        req.user = testUser;
        return next();
      } catch (testError) {
        // Si ce n'est pas un token de test, essayer Firebase
      }
      
      const decodedToken = await auth.verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        id: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture
      };
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, continuer sans utilisateur authentifié
    next();
  }
};

// Alias pour la compatibilité
export const authMiddleware = authenticateToken; 