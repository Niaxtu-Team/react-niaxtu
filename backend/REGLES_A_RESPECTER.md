# 📋 RÈGLES À RESPECTER - RÉFÉRENCE PROJET

## 🔒 RÈGLES DE SÉCURITÉ FIREBASE

### **Hiérarchie des Rôles (À TOUJOURS respecter)**
1. **`super_admin`** : Accès complet à tout
2. **`admin`** : Gestion complète sauf super_admin
3. **`sector_manager`** : Gestion de son secteur uniquement
4. **`structure_manager`** : Gestion de ses structures uniquement
5. **`moderator`** : Traitement des plaintes
6. **`analyst`** : Lecture des statistiques
7. **`user`** : Ses propres plaintes + lecture des références

### **Permissions par Collection**

#### Collection `users`
- ✅ **Users** : Lecture/écriture de leur propre profil SEULEMENT
- ✅ **Admins/Mods** : Lecture de tous les profils
- ✅ **Admins** : Écriture sur tous les profils
- ❌ **Users** : INTERDICTION de voir les autres profils

#### Collection `admin`
- ✅ **Admin** : Son propre profil seulement
- ✅ **Super admin** : Tous les profils admin
- ❌ **Autres rôles** : AUCUN accès

#### Collection `complaints`
- ✅ **Users** : ACCÈS COMPLET à leurs propres plaintes
- ✅ **Admins/Mods/Analysts** : Toutes les plaintes
- ❌ **Users** : INTERDICTION de voir les plaintes des autres

#### Collections de Référence (ministères, directions, secteurs, sous_secteurs, services)
- ✅ **TOUS les utilisateurs authentifiés** : Lecture SEULEMENT
- ✅ **Gestionnaires concernés** : Écriture dans leur domaine
- ✅ **Admins** : Création/suppression

## 🛡️ RÈGLES DE SÉCURITÉ OBLIGATOIRES

### **Vérifications Systématiques**
```javascript
// ✅ TOUJOURS vérifier ces points dans CHAQUE fonction :
1. isAuthenticated() // Utilisateur connecté ?
2. isActiveUser() // Utilisateur actif ?
3. hasPermission() // Permission appropriée ?
4. isOwner() // Propriétaire de la ressource ? (si applicable)
```

### **Interdictions Absolues**
- ❌ **JAMAIS** d'accès anonyme à aucune collection
- ❌ **JAMAIS** permettre à un user de voir les données d'un autre user
- ❌ **JAMAIS** permettre la modification des logs par les utilisateurs
- ❌ **JAMAIS** permettre l'escalade de privilèges

### **Restrictions Critiques**
- ⚠️ Users ne peuvent modifier que leurs plaintes NON résolues
- ⚠️ Gestionnaires limités à leurs secteurs/structures assignés
- ⚠️ Statistiques en écriture INTERDITE (système uniquement)

## 📊 RÈGLES DE LOGGING OBLIGATOIRES

### **Logging Automatique Requis**
```javascript
// ✅ Ces situations DOIVENT être loggées automatiquement :
- Toutes les erreurs (statusCode >= 400)
- Requêtes lentes (> 5 secondes)
- Actions super_admin (TOUTES)
- Routes admin (toutes)
- Opérations critiques (create, update, delete)
```

### **Informations à Logger**
```javascript
// ✅ TOUJOURS inclure ces infos dans les logs :
{
  timestamp: Date.now(),
  userId: req.user?.uid,
  userRole: req.user?.role,
  operation: 'create|read|update|delete',
  collection: 'nom_collection',
  documentId: 'id_document',
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  success: true/false,
  duration: 'XXXms'
}
```

### **Données Sensibles**
```javascript
// ❌ JAMAIS logger ces données :
- password
- token
- privateKey
- creditCard
- ssn

// ✅ TOUJOURS nettoyer avant de logger :
const sanitizeData = (data) => {
  const clean = { ...data };
  delete clean.password;
  delete clean.token;
  return clean;
};
```

## 🔧 RÈGLES DE DÉVELOPPEMENT

### **Structure de Code Obligatoire**
```javascript
// ✅ TOUJOURS suivre ce pattern dans les contrôleurs :
export const maFonction = async (req, res) => {
  try {
    // 1. Vérifications de sécurité
    if (!isAuthenticated()) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    
    if (!hasPermission(req.user, PERMISSION_REQUISE)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    // 2. Logique métier
    const result = await operationFirestore();
    
    // 3. Logging si nécessaire
    await logFirestoreOperation('create', 'collection', docId, req.user.uid);
    
    // 4. Réponse
    res.json({ success: true, data: result });
    
  } catch (error) {
    // 5. Gestion d'erreur (loggée automatiquement)
    console.error('Erreur dans maFonction:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
```

### **Nommage des Collections**
```javascript
// ✅ Noms de collections STANDARDISÉS :
- 'users' (utilisateurs finaux)
- 'admin' (administrateurs)
- 'complaints' (plaintes)
- 'ministères' (avec accent)
- 'directions'
- 'secteurs'
- 'sous_secteurs' (avec underscore)
- 'services'
- 'logs' (logs généraux)
- 'firestore_operations' (logs Firestore)
- 'critical_operations' (logs critiques)
```

## 🚨 RÈGLES DE VALIDATION

### **Validation des Données Entrantes**
```javascript
// ✅ TOUJOURS valider avant d'insérer en base :
if (!title?.trim()) {
  return res.status(400).json({ error: 'Titre requis' });
}

if (!isValidEmail(email)) {
  return res.status(400).json({ error: 'Email invalide' });
}

if (!isValidSenegalPhone(phone)) {
  return res.status(400).json({ error: 'Téléphone sénégalais requis' });
}
```

### **Format des Réponses API**
```javascript
// ✅ TOUJOURS utiliser ce format de réponse :
// Succès :
res.json({
  success: true,
  data: result,
  count: items.length, // si applicable
  message: 'Opération réussie' // si applicable
});

// Erreur :
res.status(400).json({
  success: false,
  error: 'Message d\'erreur',
  details: errorDetails // si applicable
});
```

## 🔄 RÈGLES DE COMPATIBILITÉ

### **Compatibilité Mobile**
```javascript
// ✅ TOUJOURS adapter les données pour mobile :
const adaptMobileData = (data) => ({
  // Structure unifiée
  id: data.id,
  title: data.title,
  description: data.description,
  status: data.status,
  // Géolocalisation obligatoire
  latitude: data.latitude,
  longitude: data.longitude,
  address: data.address,
  // Dates formatées
  createdAt: data.createdAt?.toDate?.() || data.createdAt,
  lastUpdated: data.lastUpdated?.toDate?.() || data.lastUpdated
});
```

### **Rétrocompatibilité**
```javascript
// ✅ TOUJOURS maintenir la compatibilité avec l'existant :
const complaint = {
  // Nouveaux champs
  type: data.type,
  secteur: data.secteur,
  
  // Anciens champs (compatibilité)
  complaintType: data.type, // Alias
  targetType: data.targetType || 'public'
};
```

## 🎯 RÈGLES DE PERFORMANCE

### **Optimisation des Requêtes**
```javascript
// ✅ TOUJOURS limiter les requêtes :
query = query.limit(parseInt(limit) || 50);

// ✅ TOUJOURS paginer :
if (page > 1) {
  query = query.offset((page - 1) * limit);
}

// ✅ TOUJOURS ordonner :
query = query.orderBy('createdAt', 'desc');
```

### **Gestion Mémoire**
```javascript
// ✅ TOUJOURS nettoyer les grandes collections :
const processLargeCollection = async (collectionRef) => {
  const batchSize = 100;
  let processed = 0;
  
  while (true) {
    const snapshot = await collectionRef.limit(batchSize).get();
    if (snapshot.empty) break;
    
    // Traitement par batch
    processed += snapshot.size;
    console.log(`Traité: ${processed} documents`);
  }
};
```

## 📝 RÈGLES DE DOCUMENTATION

### **Commentaires Obligatoires**
```javascript
/**
 * @description Créer une nouvelle plainte
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @requires Authentication
 * @requires Permission: CREATE_COMPLAINTS
 * @logs CREATE operation
 */
export const createComplaint = async (req, res) => {
  // Code...
};
```

### **Swagger Documentation**
```javascript
/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Créer une plainte
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Plainte créée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission insuffisante
 */
```

---

## ⚠️ **RAPPEL CRITIQUE**

**CES RÈGLES SONT OBLIGATOIRES ET DOIVENT ÊTRE RESPECTÉES DANS TOUT LE CODE !**

- 🔒 **Sécurité** : JAMAIS de compromis sur les permissions
- 📊 **Logging** : TOUJOURS tracer les opérations critiques  
- 🛡️ **Validation** : TOUJOURS valider les données entrantes
- 🔄 **Compatibilité** : TOUJOURS maintenir la rétrocompatibilité
- 📈 **Performance** : TOUJOURS optimiser les requêtes
- 📝 **Documentation** : TOUJOURS documenter les fonctions

**Violation de ces règles = Faille de sécurité potentielle !** 