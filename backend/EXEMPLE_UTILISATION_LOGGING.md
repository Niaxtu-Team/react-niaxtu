# 📊 Guide d'Utilisation du Logging Firebase

## 🎯 Objectif

Ce système permet de tracker précisément **qui** fait **quoi** et **quand** dans votre application Firebase.

## 🔧 Configuration dans server.js

```javascript
import express from 'express';
import { firebaseLogger, logCriticalOperation } from './middleware/firebaseLogger.js';

const app = express();

// Appliquer le logging à toutes les routes
app.use(firebaseLogger);

// Logging spécifique pour les opérations critiques
app.use('/api/admin', logCriticalOperation('ADMIN_ACCESS'));
app.use('/api/complaints', logCriticalOperation('COMPLAINT_OPERATION'));
```

## 📝 Utilisation dans les Contrôleurs

### Exemple 1 : Controller avec Logging Automatique
```javascript
import { logFirestoreOperation } from '../middleware/firebaseLogger.js';

export const createComplaint = async (req, res) => {
  try {
    // Le firebaseLogger capture automatiquement la requête
    
    const complaintData = {
      title: req.body.title,
      description: req.body.description,
      userId: req.user.uid,
      createdAt: new Date()
    };
    
    // Créer dans Firestore
    const docRef = await db.collection('complaints').add(complaintData);
    
    // Logger l'opération Firestore spécifiquement
    await logFirestoreOperation(
      'create', 
      'complaints', 
      docRef.id, 
      req.user.uid, 
      complaintData
    );
    
    res.json({ success: true, id: docRef.id });
    
  } catch (error) {
    // Les erreurs sont automatiquement loggées
    res.status(500).json({ error: error.message });
  }
};
```

### Exemple 2 : Opération Super Admin Trackée
```javascript
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Cette opération sera automatiquement loggée car c'est un super_admin
    await db.collection('users').doc(userId).delete();
    
    // Log critique supplémentaire
    await logFirestoreOperation(
      'delete', 
      'users', 
      userId, 
      req.user.uid,
      { reason: 'Admin deletion', targetUser: userId }
    );
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## 📊 Ce qui est Automatiquement Tracké

### Informations Capturées
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "method": "POST",
  "url": "/api/complaints",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "userId": "user123",
  "userRole": "user",
  "controller": "/api/complaints",
  "statusCode": 200,
  "duration": "1250ms",
  "success": true,
  "source": "backend-api"
}
```

### Opérations Firestore Trackées
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "operation": "create",
  "collection": "complaints",
  "documentId": "complaint123",
  "userId": "user123",
  "data": "{\"title\":\"Ma plainte\",\"description\":\"...\"}",
  "source": "firestore-direct"
}
```

## 🔍 Consultation des Logs

### Via l'API
```javascript
// Route pour consulter les logs (admin seulement)
app.get('/api/admin/logs/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100 } = req.query;
    
    const logs = await getUserLogs(userId, parseInt(limit));
    
    res.json({
      success: true,
      logs,
      count: logs.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Via Firebase Console
1. Allez dans **Firestore Database**
2. Consultez les collections :
   - `logs` : Logs généraux
   - `firestore_operations` : Opérations Firestore spécifiques
   - `critical_operations` : Opérations critiques

## 🚨 Logs Critiques Automatiques

Les situations suivantes sont **automatiquement loggées** dans Firebase :

### ✅ Conditions de Logging Automatique
- ❌ **Erreurs** (statusCode >= 400)
- 🐌 **Requêtes lentes** (> 5 secondes)
- 👑 **Actions super admin** (tous les appels)
- 🔒 **Routes admin** (url contient '/admin/')

### ✅ Types d'Opérations Trackées
- **CREATE** : Création de documents
- **READ** : Lecture de documents
- **UPDATE** : Modification de documents  
- **DELETE** : Suppression de documents

## 📈 Analyse des Logs

### Requêtes Utiles dans Firestore
```javascript
// Logs d'un utilisateur spécifique
db.collection('logs').where('userId', '==', 'user123')

// Erreurs des dernières 24h
db.collection('logs')
  .where('success', '==', false)
  .where('timestamp', '>=', yesterday)

// Actions super admin
db.collection('logs').where('userRole', '==', 'super_admin')

// Opérations sur les plaintes
db.collection('firestore_operations')
  .where('collection', '==', 'complaints')
```

### Dashboard de Monitoring
```javascript
// Exemple de tableau de bord simple
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const yesterday = new Date(now - 24 * 60 * 60 * 1000);
    
    const [errorsSnapshot, operationsSnapshot, usersSnapshot] = await Promise.all([
      // Erreurs dernières 24h
      db.collection('logs')
        .where('success', '==', false)
        .where('timestamp', '>=', yesterday)
        .get(),
      
      // Opérations Firestore dernières 24h
      db.collection('firestore_operations')
        .where('timestamp', '>=', yesterday.toISOString())
        .get(),
      
      // Utilisateurs actifs dernières 24h
      db.collection('logs')
        .where('timestamp', '>=', yesterday)
        .get()
    ]);
    
    const stats = {
      errors: errorsSnapshot.size,
      operations: operationsSnapshot.size,
      activeUsers: new Set(
        errorsSnapshot.docs.map(doc => doc.data().userId)
      ).size,
      period: '24h'
    };
    
    res.json({ success: true, stats });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## 🛡️ Sécurité et Confidentialité

### Données Sensibles
```javascript
// Ne pas logger les mots de passe
const sanitizeData = (data) => {
  const sanitized = { ...data };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.privateKey;
  return sanitized;
};

// Utilisation
await logFirestoreOperation(
  'create', 
  'users', 
  docRef.id, 
  req.user.uid, 
  sanitizeData(userData) // ✅ Données nettoyées
);
```

### Règles Firestore pour les Logs
```javascript
// Dans firestore.rules
match /logs/{logId} {
  // Seuls les admins peuvent lire les logs
  allow read: if isAdmin();
  // Écriture seulement par le système
  allow write: if false;
}

match /critical_operations/{opId} {
  // Seuls les super admins peuvent lire
  allow read: if isSuperAdmin();
  allow write: if false;
}
```

---

**Résultat** : Avec ce système, Firebase **sait exactement** qui fait quoi, quand et comment dans votre application ! 🎯 