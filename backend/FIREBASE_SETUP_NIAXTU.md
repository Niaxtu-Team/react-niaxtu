# 🔥 Configuration Firebase pour Niaxtu

## ✅ **Ce que vous avez fourni (Configuration Frontend):**
```js
const firebaseConfig = {
  apiKey: "AIzaSyA68yKSkqNaSAIKO4_Vneq0htMUHVMqVDs",
  authDomain: "niaxtu-8e0dd.firebaseapp.com",
  projectId: "niaxtu-8e0dd",
  storageBucket: "niaxtu-8e0dd.firebasestorage.app",
  messagingSenderId: "765265055722",
  appId: "1:765265055722:web:f62b874ae37056529cac93"
};
```
✅ **Projet ID:** `niaxtu-8e0dd` - Configuré !

## ❌ **Ce qui manque pour le Backend:**

Pour que les admins soient créés dans votre **vraie base Firebase**, il manque le **Service Account Key**.

### 📋 **Étapes pour obtenir votre Service Account:**

1. **Allez sur Firebase Console:** https://console.firebase.google.com
2. **Sélectionnez votre projet:** `niaxtu-8e0dd`
3. **Paramètres du projet** (roue dentée en haut à gauche)
4. **Onglet "Comptes de service"**
5. **Cliquez sur "Générer une nouvelle clé privée"**
6. **Téléchargez le fichier JSON**

### 🔑 **Le fichier JSON ressemblera à ça:**
```json
{
  "type": "service_account",
  "project_id": "niaxtu-8e0dd",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xyz123@niaxtu-8e0dd.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xyz123%40niaxtu-8e0dd.iam.gserviceaccount.com"
}
```

### ⚙️ **Une fois que vous avez ce fichier JSON:**

1. **Copiez son contenu**
2. **Remplacez les valeurs dans `backend/config/firebase-real.js`**
3. **Changez dans `backend/config/firebase.js`:**
   ```js
   export { db, auth, firebaseConfig } from './firebase-dev.js';
   ```
   En :
   ```js
   export { db, auth, firebaseConfig } from './firebase-real.js';
   ```

## 🎯 **Résultat:**
- ✅ Frontend: Authentification avec `niaxtu-8e0dd`
- ✅ Backend: Admins créés dans votre vraie base Firestore
- ✅ Route `/api/setup/create-super-admin` fonctionnelle avec persistance

## 🔧 **État actuel:**
- Mode MOCK activé (données temporaires)
- Serveur fonctionne sur port 3001
- API documentation sur http://localhost:3001/api-docs
- Route toujours active pour créer des super admins

## 💡 **Test rapide:**
Une fois configuré, testez en créant un super admin:
```bash
curl -X POST http://localhost:3001/api/setup/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@niaxtu.com",
    "password": "SuperAdmin2024!",
    "displayName": "Super Administrateur",
    "setupKey": "NIAXTU_SUPER_ADMIN_SETUP_2024"
  }'
```

**Besoin d'aide ?** Envoyez-moi le contenu du fichier JSON de service account ! 🚀 