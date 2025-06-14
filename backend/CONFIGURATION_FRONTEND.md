# 🔧 CONFIGURATION FRONTEND - CONNEXION API

## 🚨 **PROBLÈME IDENTIFIÉ**

Le frontend React (port 5173) essaie d'appeler l'API sur le mauvais port :
- ❌ **Actuel** : `http://localhost:5173/api/auth/login`
- ✅ **Correct** : `http://localhost:3001/api/auth/login`

## 🛠️ **SOLUTIONS**

### **Option 1 : Configuration d'environnement (Recommandée)**

Créez un fichier `.env` dans le dossier frontend :

```env
# .env (dans le dossier frontend)
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_URL=http://localhost:3001
```

Puis modifiez votre service d'authentification :

```javascript
// authService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class AuthService {
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
}
```

### **Option 2 : Proxy Vite (Alternative)**

Ajoutez cette configuration dans `vite.config.js` :

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

### **Option 3 : Correction directe (Rapide)**

Si vous avez un fichier de configuration API, changez directement l'URL :

```javascript
// config/api.js ou authService.js
const API_BASE_URL = 'http://localhost:3001/api';
// au lieu de 'http://localhost:5173/api'
```

## 🧪 **TEST DE CONNEXION**

### **1. Vérifier que le backend fonctionne**
```bash
curl http://localhost:3001/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "message": "Serveur Niaxtu Backend opérationnel",
  "timestamp": "2024-12-15T12:00:00.000Z"
}
```

### **2. Tester l'authentification**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@niaxtu.com",
    "password": "SuperAdmin2024!"
  }'
```

### **3. Tester l'analyse de token**
```bash
curl -X GET http://localhost:3001/api/auth/token-info \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔍 **DEBUGGING**

### **Vérifier les URLs dans le navigateur**

1. **Ouvrez les DevTools** (F12)
2. **Onglet Network**
3. **Tentez une connexion**
4. **Vérifiez l'URL appelée** dans les requêtes

### **Erreurs communes**

| Erreur | Cause | Solution |
|--------|-------|----------|
| `404 Not Found` | Mauvaise URL d'API | Corriger l'URL vers port 3001 |
| `CORS Error` | Problème de domaine croisé | Configurer CORS dans le backend |
| `Connection refused` | Backend non démarré | Démarrer `npm run dev` |
| `Unexpected end of JSON` | Réponse vide/HTML | Vérifier l'URL et le format |

## 📱 **URLS CORRECTES**

### **Backend (Port 3001)**
- 🏠 **Santé** : http://localhost:3001/health
- 📚 **Swagger** : http://localhost:3001/api-docs
- 🔐 **Login** : http://localhost:3001/api/auth/login
- 🔍 **Token Info** : http://localhost:3001/api/auth/token-info
- 👥 **Users** : http://localhost:3001/api/users/all

### **Frontend (Port 5173)**
- 🌐 **App** : http://localhost:5173

## 🚀 **DÉMARRAGE COMPLET**

### **Terminal 1 - Backend**
```bash
cd backend
npm run dev
# Serveur sur http://localhost:3001
```

### **Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
# App sur http://localhost:5173
```

## 🔐 **IDENTIFIANTS DE TEST**

```
Email: admin@niaxtu.com
Mot de passe: SuperAdmin2024!
```

Une fois la configuration corrigée, vous devriez pouvoir vous connecter sans problème ! 🎉 