import { db } from '../config/firebase.js';

/**
 * Middleware pour logger tous les appels Firebase
 */
export const firebaseLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Informations sur la requête
  const requestInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.uid || 'anonymous',
    userRole: req.user?.role || 'unknown',
    sessionId: req.sessionID || req.get('X-Session-ID'),
    // Identifier la fonction/contrôleur appelé
    controller: req.route?.path || 'unknown',
    action: req.route?.methods || {}
  };
  
  // Logger le début de la requête
  console.log(`[FIREBASE-CALL] 🚀 Début:`, requestInfo);
  
  // Intercepter la réponse
  const originalSend = res.send;
  res.send = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Informations sur la réponse
    const responseInfo = {
      ...requestInfo,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      success: res.statusCode < 400,
      responseSize: data ? data.length : 0
    };
    
    // Logger la fin de la requête
    console.log(`[FIREBASE-CALL] ✅ Fin:`, responseInfo);
    
    // Sauvegarder dans Firebase si critique
    if (shouldLogToFirebase(responseInfo)) {
      logToFirestore(responseInfo);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Décider si on doit logger dans Firestore
 */
function shouldLogToFirebase(info) {
  return (
    info.statusCode >= 400 || // Erreurs
    info.duration > 5000 || // Requêtes lentes
    info.userRole === 'super_admin' || // Actions super admin
    info.url.includes('/admin/') // Routes admin
  );
}

/**
 * Logger dans Firestore
 */
async function logToFirestore(info) {
  try {
    await db.collection('logs').add({
      ...info,
      timestamp: new Date(),
      source: 'backend-api',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Erreur lors du logging Firebase:', error);
  }
}

/**
 * Logger spécifiquement les appels Firestore
 */
export const logFirestoreOperation = async (operation, collection, docId, userId, data = null) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation, // 'read', 'write', 'create', 'update', 'delete'
    collection,
    documentId: docId,
    userId,
    data: data ? JSON.stringify(data) : null,
    source: 'firestore-direct'
  };
  
  console.log(`[FIRESTORE-OP] ${operation.toUpperCase()} sur ${collection}/${docId}:`, logEntry);
  
  // Sauvegarder dans les logs
  try {
    await db.collection('firestore_operations').add(logEntry);
  } catch (error) {
    console.error('Erreur logging Firestore operation:', error);
  }
};

/**
 * Middleware spécifique pour les opérations critiques
 */
export const logCriticalOperation = (operationType) => {
  return async (req, res, next) => {
    const logData = {
      timestamp: new Date().toISOString(),
      operationType,
      userId: req.user?.uid,
      userRole: req.user?.role,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      route: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query
    };
    
    console.log(`[CRITICAL-OP] ${operationType}:`, logData);
    
    // Logger immédiatement dans Firebase
    try {
      await db.collection('critical_operations').add(logData);
    } catch (error) {
      console.error('Erreur logging opération critique:', error);
    }
    
    next();
  };
};

/**
 * Récupérer les logs d'un utilisateur
 */
export const getUserLogs = async (userId, limit = 100) => {
  try {
    const snapshot = await db.collection('logs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    
    return logs;
  } catch (error) {
    console.error('Erreur récupération logs utilisateur:', error);
    return [];
  }
}; 