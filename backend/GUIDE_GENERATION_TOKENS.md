# 🔐 GUIDE DE GÉNÉRATION DES TOKENS - NIAXTU

## 🎯 **VUE D'ENSEMBLE**

Le système Niaxtu utilise **3 types de tokens** différents selon le contexte d'utilisation. Voici comment ils sont générés et structurés.

## 🏗️ **TYPES DE TOKENS**

### **1. TOKENS JWT (Production/Authentification)**

#### **📋 Base de génération**
Les tokens JWT sont générés lors de la connexion réussie via `/api/auth/login` basés sur :

```javascript
// Données de base pour générer le token
const payload = {
  id: user.id,              // ID Firestore de l'utilisateur
  email: user.email,        // Email de connexion
  role: user.role,          // Rôle (super_admin, admin, user, etc.)
  permissions: getUserPermissions(user) // Permissions calculées selon le rôle
};

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'niaxtu-super-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Génération du token
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
```

#### **🔍 Structure du token JWT**
```javascript
// Header (base64)
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload (base64) - Données utilisateur
{
  "id": "admin_123456789",
  "email": "admin@niaxtu.com", 
  "role": "super_admin",
  "permissions": [
    "manage_users",
    "view_users", 
    "create_users",
    // ... toutes les permissions
  ],
  "iat": 1734567890,  // Date de création
  "exp": 1734654290   // Date d'expiration
}

// Signature (HMAC SHA256)
// Calculée avec JWT_SECRET
```

#### **📱 Exemple de token JWT généré**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InN1cGVyX2FkbWluXzE3NDk2ODY1NTY5MzZfdGY1b3lia3EwIiwiZW1haWwiOiJhZG1pbkBuaWF4dHUuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwicGVybWlzc2lvbnMiOlsibWFuYWdlX3VzZXJzIiwidmlld191c2VycyJdLCJpYXQiOjE3NDk5MTg3NTMsImV4cCI6MTc1MDAwNTE1M30.signature_hash
```

### **2. TOKENS DE TEST (Développement)**

#### **📋 Base de génération**
Les tokens de test sont générés via `/api/test-token` pour les tests :

```javascript
// Données de base pour le token de test
const testTokenData = {
  uid: uid || 'test-user-' + Date.now(),
  role: role || 'plaignant',           // plaignant ou admin
  email: `${uid}@test.com`,
  exp: Date.now() + (24 * 60 * 60 * 1000), // Expire dans 24h
  iat: Date.now(),                     // Date de création
  test: true                           // Flag pour identifier un token de test
};

// Génération (encodage base64, PAS de sécurité)
const testToken = Buffer.from(JSON.stringify(testTokenData)).toString('base64');
```

#### **📱 Exemple de token de test**
```javascript
// Données encodées
{
  "uid": "test-user-1734567890",
  "role": "admin", 
  "email": "test-user-1734567890@test.com",
  "exp": 1734654290,
  "iat": 1734567890,
  "test": true
}

// Token généré (base64)
eyJ1aWQiOiJ0ZXN0LXVzZXItMTczNDU2Nzg5MCIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoidGVzdC11c2VyLTE3MzQ1Njc4OTBAdGVzdC5jb20iLCJleHAiOjE3MzQ2NTQyOTAsImlhdCI6MTczNDU2Nzg5MCwidGVzdCI6dHJ1ZX0=
```

### **3. TOKENS FIREBASE (Authentification Google/Firebase)**

#### **📋 Base de génération**
Les tokens Firebase sont générés par Firebase Auth et vérifiés côté serveur :

```javascript
// Vérification token Firebase
const decodedToken = await auth.verifyIdToken(firebaseToken);

// Structure typique du token Firebase décodé
{
  uid: "firebase_user_uid",
  email: "user@gmail.com",
  email_verified: true,
  name: "Nom Utilisateur",
  picture: "https://...",
  // ... autres claims Firebase
}
```

## 🔧 **PROCESSUS DE GÉNÉRATION DÉTAILLÉ**

### **1. Connexion Standard (JWT)**

```mermaid
sequenceDiagram
    participant Frontend
    participant API
    participant Firestore
    participant JWT

    Frontend->>API: POST /api/auth/login {email, password}
    API->>Firestore: Recherche utilisateur par email
    Firestore-->>API: Données utilisateur
    API->>API: Vérification mot de passe
    API->>API: Calcul permissions selon rôle
    API->>JWT: Génération token avec payload
    JWT-->>API: Token JWT signé
    API-->>Frontend: {success: true, token, user}
```

### **2. Génération Token de Test**

```mermaid
sequenceDiagram
    participant Developer
    participant API
    participant Base64

    Developer->>API: POST /api/test-token {role: "admin"}
    API->>API: Création données test
    API->>Base64: Encodage des données
    Base64-->>API: Token base64
    API-->>Developer: {token, user, usage}
```

### **3. Vérification Token**

```mermaid
sequenceDiagram
    participant Frontend
    participant Middleware
    participant JWT
    participant Firestore

    Frontend->>Middleware: Request with Bearer token
    Middleware->>JWT: Tentative vérification JWT
    alt Token JWT valide
        JWT-->>Middleware: Payload décodé
        Middleware->>Firestore: Vérification utilisateur actif
        Firestore-->>Middleware: Statut utilisateur
        Middleware-->>Frontend: Accès accordé
    else Token Test
        Middleware->>Middleware: Décodage base64
        Middleware-->>Frontend: Accès accordé (si valide)
    else Token Firebase
        Middleware->>Firebase: Vérification token
        Firebase-->>Middleware: User data
        Middleware-->>Frontend: Accès accordé
    end
```

## 📊 **COMPARAISON DES TOKENS**

| Caractéristique | JWT (Production) | Test Token | Firebase Token |
|------------------|------------------|------------|----------------|
| **Sécurité** | ✅ Très élevée (signé) | ⚠️ Aucune (dev only) | ✅ Très élevée |
| **Durée de vie** | 24h (configurable) | 24h | Variable Firebase |
| **Données incluses** | ID, email, rôle, permissions | UID, rôle, email, flag test | UID, email, profil Firebase |
| **Génération** | Serveur après login | Serveur sur demande | Firebase SDK |
| **Vérification** | JWT library + secret | Décodage base64 | Firebase Admin SDK |
| **Usage** | Production | Tests/Développement | Authentification Google |

## 🔐 **SÉCURITÉ ET CONFIGURATION**

### **Variables d'environnement critiques**

```bash
# JWT Configuration
JWT_SECRET=niaxtu-super-secret-key-2024-CHANGE-ME
JWT_EXPIRES_IN=24h

# Firebase Configuration  
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### **Calcul des permissions**

```javascript
// Fonction getUserPermissions(user)
export const getUserPermissions = (user) => {
  if (!user || !user.role) return [];
  
  // Permissions du rôle
  const rolePermissions = RolePermissions[user.role] || [];
  
  // Permissions supplémentaires individuelles
  const userPermissions = user.permissions || [];
  
  // Fusion et déduplication
  return [...new Set([...rolePermissions, ...userPermissions])];
};

// Exemple pour super_admin
const superAdminPermissions = [
  "manage_users", "view_users", "create_users", "edit_users",
  "delete_users", "activate_users", "manage_user_roles",
  "assign_permissions", "view_user_activity", "manage_complaints",
  "view_complaints", "create_complaints", "edit_complaints",
  // ... TOUTES les permissions (90+ permissions)
];
```

## 🎯 **UTILISATION PRATIQUE**

### **1. Générer un token de production**

```bash
# Connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@niaxtu.com",
    "password": "VotreMotDePasse123!"
  }'

# Réponse
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "id": "admin_123",
    "email": "admin@niaxtu.com", 
    "role": "super_admin",
    "permissions": [...]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **2. Générer un token de test**

```bash
# Génération token test
curl -X POST http://localhost:3000/api/test-token \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'

# Réponse
{
  "success": true,
  "token": "eyJ1aWQiOiJ0ZXN0LXVzZXItMTczNDU2Nzg5MCIsInJvbGUiOiJhZG1pbiJ9...",
  "user": {
    "uid": "test-user-1734567890",
    "role": "admin"
  },
  "usage": {
    "header": "Authorization",
    "value": "Bearer eyJ1aWQiOiJ0ZXN0LXVzZXItMTczNDU2Nzg5MCIsInJvbGUiOiJhZG1pbiJ9..."
  }
}
```

### **3. Utiliser un token**

```bash
# Utilisation du token
curl -X GET http://localhost:3000/api/users/all \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## ⚡ **DÉCODAGE MANUEL DES TOKENS**

### **Décoder un JWT**

```javascript
// Séparer les parties du JWT
const [header, payload, signature] = token.split('.');

// Décoder le header
const decodedHeader = JSON.parse(atob(header));
console.log('Header:', decodedHeader);

// Décoder le payload  
const decodedPayload = JSON.parse(atob(payload));
console.log('Payload:', decodedPayload);

// Note: Ne pas utiliser atob en Node.js, utiliser Buffer.from(x, 'base64')
```

### **Décoder un token de test**

```javascript
// Décoder directement depuis base64
const decoded = JSON.parse(Buffer.from(testToken, 'base64').toString());
console.log('Token data:', decoded);
```

## 🚨 **POINTS IMPORTANTS**

### **1. Super Admin**
- **TOUJOURS** accès total, peu importe le token
- **Aucune restriction** de permissions appliquée
- **Priorité absolue** sur tous les contrôles

### **2. Expiration**
- JWT : 24h par défaut (configurable)
- Test : 24h fixe
- Firebase : Géré par Firebase

### **3. Sécurité**
- **JWT** : Signature cryptographique avec secret
- **Test** : Aucune sécurité (dev uniquement)
- **Firebase** : Vérification par Firebase Admin SDK

### **4. Stockage Frontend**
```javascript
// Stocker le token
localStorage.setItem('authToken', token);

// Utiliser le token
const token = localStorage.getItem('authToken');
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🎯 **RÉSUMÉ**

1. **JWT (Production)** : Sécurisé, signé, contient rôle + permissions
2. **Test Token** : Simple base64, pour développement uniquement  
3. **Firebase** : Géré par Google, pour auth sociale
4. **Super Admin** : Accès total garanti quelque soit le token
5. **Durée** : 24h par défaut, configurable
6. **Usage** : Header `Authorization: Bearer TOKEN`

Ce système garantit une authentification robuste et flexible ! 🔐 