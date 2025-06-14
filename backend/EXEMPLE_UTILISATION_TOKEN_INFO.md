# 🔍 ROUTE D'ANALYSE DES TOKENS - `/api/auth/token-info`

## 🎯 **DESCRIPTION**

Cette route permet d'analyser n'importe quel token et d'obtenir toutes ses informations détaillées : permissions, rôle, validité, expiration, etc.

**URL :** `GET /api/auth/token-info`
**Type :** Route publique (pas d'authentification requise)
**Swagger :** Disponible dans la documentation API

## 🛠️ **UTILISATION**

### **1. Header requis**
```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

### **2. Exemple avec curl**
```bash
# Analyser un token JWT
curl -X GET "http://localhost:3000/api/auth/token-info" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Analyser un token de test
curl -X GET "http://localhost:3000/api/auth/token-info" \
  -H "Authorization: Bearer eyJ1aWQiOiJ0ZXN0LXVzZXItMTczNDU2Nzg5MCIsInJvbGUiOiJhZG1pbiJ9..."
```

### **3. Exemple avec JavaScript**
```javascript
const analyzeToken = async (token) => {
  try {
    const response = await fetch('/api/auth/token-info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const tokenInfo = await response.json();
    console.log('Informations du token:', tokenInfo);
    return tokenInfo;
  } catch (error) {
    console.error('Erreur analyse token:', error);
  }
};

// Utilisation
const token = localStorage.getItem('authToken');
analyzeToken(token);
```

## 📊 **RÉPONSE COMPLÈTE**

### **Exemple de réponse pour un token JWT valide**
```json
{
  "success": true,
  "tokenType": "JWT",
  "valid": true,
  "user": {
    "id": "admin_123456789",
    "email": "admin@niaxtu.com",
    "role": "super_admin",
    "isActive": true,
    "isSuperAdmin": true,
    "isBlocked": false,
    "lastLogin": "2024-12-15T09:30:00.000Z",
    "createdAt": "2024-12-01T10:00:00.000Z",
    "authProvider": "local",
    "fromDatabase": true
  },
  "permissions": {
    "all": [
      "manage_users",
      "view_users",
      "create_users",
      "edit_users",
      "delete_users",
      "activate_users",
      "manage_user_roles",
      "assign_permissions",
      "view_user_activity",
      "manage_complaints",
      "view_complaints",
      "create_complaints",
      "edit_complaints",
      "delete_complaints",
      "resolve_complaints",
      "reject_complaints",
      "assign_complaints",
      "prioritize_complaints",
      "comment_complaints",
      "view_complaint_history",
      "bulk_update_complaints",
      "manage_sectors",
      "view_sectors",
      "create_sectors",
      "edit_sectors",
      "delete_sectors",
      "activate_sectors",
      "reorder_sectors",
      "manage_subsectors",
      "view_subsectors",
      "create_subsectors",
      "edit_subsectors",
      "delete_subsectors",
      "activate_subsectors",
      "assign_subsectors",
      "manage_structures",
      "view_structures",
      "create_structures",
      "edit_structures",
      "delete_structures",
      "activate_structures",
      "manage_structure_capacity",
      "manage_structure_hours",
      "manage_complaint_types",
      "view_complaint_types",
      "create_complaint_types",
      "edit_complaint_types",
      "delete_complaint_types",
      "manage_target_types",
      "view_target_types",
      "create_target_types",
      "edit_target_types",
      "delete_target_types",
      "view_reports",
      "view_dashboard",
      "view_analytics",
      "create_reports",
      "export_data",
      "export_complaints",
      "export_users",
      "export_sectors",
      "view_financial_reports",
      "system_admin",
      "manage_settings",
      "view_logs",
      "manage_backups",
      "manage_notifications",
      "configure_workflows",
      "bulk_operations",
      "advanced_search",
      "data_migration",
      "api_access",
      "webhook_management",
      "own_complaints_only",
      "sector_complaints_only",
      "structure_complaints_only",
      "limited_user_view"
    ],
    "count": 75,
    "hasAll": true,
    "fromToken": [...],
    "fromRole": [...]
  },
  "tokenDetails": {
    "issuedAt": "2024-12-15T10:30:00.000Z",
    "expiresAt": "2024-12-16T10:30:00.000Z",
    "remainingTime": "23h 45m",
    "expired": false,
    "algorithm": "HS256",
    "issuer": "Niaxtu Backend"
  },
  "roleHierarchy": {
    "current": "super_admin",
    "level": 7,
    "canManage": [
      "admin",
      "sector_manager", 
      "structure_manager",
      "moderator",
      "analyst",
      "user"
    ],
    "description": "Super Administrateur - Accès total sans restriction"
  },
  "rawToken": {
    "length": 245,
    "preview": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InN1cGVyX2F..."
  },
  "analysis": {
    "timestamp": "2024-12-15T11:00:00.000Z",
    "server": "Niaxtu Backend",
    "version": "1.0.0",
    "requestIP": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
  }
}
```

### **Exemple de réponse pour un token de test**
```json
{
  "success": true,
  "tokenType": "Test",
  "valid": true,
  "user": {
    "uid": "test-user-1734567890",
    "email": "test-user-1734567890@test.com",
    "role": "admin",
    "isActive": true,
    "isSuperAdmin": false,
    "isTestUser": true
  },
  "permissions": {
    "all": ["manage_users", "view_users"],
    "count": 2,
    "hasAll": false,
    "note": "Permissions simplifiées pour token de test"
  },
  "tokenDetails": {
    "issuedAt": "2024-12-15T10:30:00.000Z",
    "expiresAt": "2024-12-16T10:30:00.000Z",
    "remainingTime": "23h 45m",
    "expired": false,
    "algorithm": "base64",
    "issuer": "Test Token Generator"
  },
  "roleHierarchy": {
    "current": "admin",
    "level": 5,
    "canManage": ["user"],
    "description": "Token de test - admin"
  }
}
```

### **Exemple de réponse pour un token invalide**
```json
{
  "success": true,
  "tokenType": "Unknown",
  "valid": false,
  "user": null,
  "permissions": null,
  "tokenDetails": null,
  "roleHierarchy": null,
  "error": "Token invalide ou non reconnu",
  "details": {
    "jwtError": "invalid token",
    "testError": "Unexpected token o in JSON at position 1",
    "firebaseError": "Firebase ID token has incorrect \"iss\" (issuer) claim."
  },
  "rawToken": {
    "length": 50,
    "preview": "invalid_token_example..."
  }
}
```

## 🔧 **CAS D'USAGE**

### **1. Debugging d'authentification**
```javascript
// Vérifier pourquoi un utilisateur n'a pas accès
const debugAuth = async (token) => {
  const info = await analyzeToken(token);
  
  if (!info.valid) {
    console.error('❌ Token invalide:', info.error);
    return;
  }
  
  if (!info.user.isActive) {
    console.error('❌ Compte désactivé');
    return;
  }
  
  if (info.tokenDetails.expired) {
    console.error('❌ Token expiré depuis:', info.tokenDetails.remainingTime);
    return;
  }
  
  console.log('✅ Token valide pour:', info.user.email);
  console.log('🔐 Permissions:', info.permissions.count);
  console.log('👑 Rôle:', info.user.role);
  
  if (info.user.isSuperAdmin) {
    console.log('🚀 Super Admin - Accès total');
  }
};
```

### **2. Vérification de permissions**
```javascript
// Vérifier si un utilisateur a une permission spécifique
const checkPermission = async (token, requiredPermission) => {
  const info = await analyzeToken(token);
  
  if (!info.valid) {
    return { allowed: false, reason: 'Token invalide' };
  }
  
  if (info.user.isSuperAdmin) {
    return { allowed: true, reason: 'Super admin - accès total' };
  }
  
  const hasPermission = info.permissions.all.includes(requiredPermission);
  
  return {
    allowed: hasPermission,
    reason: hasPermission ? 'Permission accordée' : 'Permission manquante',
    userRole: info.user.role,
    requiredPermission
  };
};

// Utilisation
const result = await checkPermission(token, 'manage_users');
console.log('Accès autorisé:', result.allowed);
```

### **3. Interface d'administration**
```javascript
// Composant React pour afficher les infos du token
const TokenInfo = ({ token }) => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const analyze = async () => {
      setLoading(true);
      try {
        const tokenInfo = await analyzeToken(token);
        setInfo(tokenInfo);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) analyze();
  }, [token]);
  
  if (loading) return <div>Analyse du token...</div>;
  if (!info) return <div>Aucune information</div>;
  
  return (
    <div className="token-info">
      <h3>Informations du Token</h3>
      
      <div className="status">
        <span className={info.valid ? 'valid' : 'invalid'}>
          {info.valid ? '✅ Valide' : '❌ Invalide'}
        </span>
        <span className="type">{info.tokenType}</span>
      </div>
      
      {info.user && (
        <div className="user-info">
          <h4>Utilisateur</h4>
          <p>Email: {info.user.email}</p>
          <p>Rôle: {info.user.role}</p>
          <p>Statut: {info.user.isActive ? 'Actif' : 'Inactif'}</p>
          {info.user.isSuperAdmin && (
            <p className="super-admin">🚀 Super Administrateur</p>
          )}
        </div>
      )}
      
      {info.permissions && (
        <div className="permissions">
          <h4>Permissions ({info.permissions.count})</h4>
          {info.permissions.hasAll ? (
            <p>🔓 Accès total (Super Admin)</p>
          ) : (
            <ul>
              {info.permissions.all.slice(0, 5).map(perm => (
                <li key={perm}>{perm}</li>
              ))}
              {info.permissions.all.length > 5 && (
                <li>... et {info.permissions.all.length - 5} autres</li>
              )}
            </ul>
          )}
        </div>
      )}
      
      {info.tokenDetails && (
        <div className="token-details">
          <h4>Détails du Token</h4>
          <p>Émis le: {new Date(info.tokenDetails.issuedAt).toLocaleString()}</p>
          <p>Expire le: {new Date(info.tokenDetails.expiresAt).toLocaleString()}</p>
          <p>Temps restant: {info.tokenDetails.remainingTime}</p>
          <p>Algorithme: {info.tokenDetails.algorithm}</p>
        </div>
      )}
    </div>
  );
};
```

## 📱 **SWAGGER UI**

La route est disponible dans Swagger UI à l'adresse :
```
http://localhost:3000/api-docs
```

**Section :** Authentification
**Route :** `GET /api/auth/token-info`

Vous pouvez tester directement dans Swagger en :
1. Cliquant sur "Try it out"
2. Ajoutant votre token dans le header Authorization
3. Cliquant sur "Execute"

## 🚨 **POINTS IMPORTANTS**

### **Sécurité**
- ✅ Route publique (pas d'auth requise)
- ✅ N'expose pas d'informations sensibles
- ✅ Permet l'analyse de tokens expirés/invalides
- ✅ Logs détaillés pour monitoring

### **Types de tokens supportés**
- ✅ **JWT** : Tokens de production sécurisés
- ✅ **Test** : Tokens de développement
- ✅ **Firebase** : Tokens d'authentification Google

### **Informations retournées**
- ✅ **Utilisateur** : ID, email, rôle, statut
- ✅ **Permissions** : Liste complète et comptage
- ✅ **Token** : Validité, expiration, algorithme
- ✅ **Hiérarchie** : Niveau de rôle et capacités de gestion
- ✅ **Métadonnées** : IP, user-agent, timestamp

Cette route est parfaite pour le debugging, la vérification des permissions et l'administration des utilisateurs ! 🔍 