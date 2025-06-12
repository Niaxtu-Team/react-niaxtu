import { auth, db } from '../config/firebase.js';
import jwt from 'jsonwebtoken';

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'niaxtu-super-secret-key-2024';

// Fonction pour vérifier un token JWT local
const verifyJWTToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await db.collection('users').doc(decoded.id).get();
    
    if (!userDoc.exists) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const userData = userDoc.data();
    
    // Vérifier si le compte est actif
    if (!userData.isActive || userData.isBlocked) {
      throw new Error('Compte désactivé');
    }
    
    return {
      id: decoded.id,
      uid: decoded.id, // Compatibilité avec l'ancien système
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
      ...userData,
      isJWTUser: true
    };
  } catch (error) {
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
      throw new Error('Token expired');
    }
    
    return {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
      emailVerified: true,
      name: `Test User (${decoded.role})`,
      picture: null,
      isTestUser: true
    };
  } catch (error) {
    throw new Error('Invalid test token');
  }
};

// Middleware principal pour vérifier l'authentification (JWT, Firebase, ou Test)
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Token d\'authentification manquant ou invalide' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // 1. Essayer d'abord de vérifier comme token JWT local
    try {
      const jwtUser = await verifyJWTToken(token);
      req.user = jwtUser;
      return next();
    } catch (jwtError) {
      // Si ce n'est pas un token JWT valide, continuer avec les autres méthodes
    }
    
    // 2. Essayer ensuite de vérifier comme token de test
    try {
      const testUser = verifyTestToken(token);
      req.user = testUser;
      return next();
    } catch (testError) {
      // Si ce n'est pas un token de test, continuer avec Firebase
    }
    
    // 3. Vérifier le token avec Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);
    
    // Récupérer les données administrateur depuis Firestore
    const adminDoc = await db.collection('admin').doc(decodedToken.uid).get();
    
    if (adminDoc.exists) {
      // Administrateur existant avec profil complet
      req.user = {
        uid: decodedToken.uid,
        id: decodedToken.uid, // Compatibilité avec le nouveau système
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        ...adminDoc.data(),
        isFirebaseUser: true
      };
    } else {
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
    
    next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Token d\'authentification invalide' 
    });
  }
};

// Middleware pour vérifier l'authentification Firebase uniquement (rétrocompatibilité)
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token d\'authentification manquant ou invalide' 
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
      // Administrateur existant avec profil complet
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        ...adminDoc.data()
      };
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
      error: 'Token d\'authentification invalide' 
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