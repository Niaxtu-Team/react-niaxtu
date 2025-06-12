# 🔒 Configuration Firebase avec Variables d'Environnement

## 📋 Aperçu

Ce projet utilise maintenant des variables d'environnement pour sécuriser les informations sensibles de Firebase. Plus aucune clé sensible n'est stockée directement dans le code source.

## 🚀 Configuration Rapide

### 1. Créer le fichier .env

```bash
# Dans le dossier backend/
cp env.example .env
```

### 2. Remplir les variables d'environnement

Ouvrez le fichier `.env` et remplacez les valeurs par vos vraies informations Firebase :

```bash
# 🔥 CONFIGURATION CLIENT FIREBASE (Frontend)
FIREBASE_API_KEY=AIzaSyA68yKSkqNaSAIKO4_Vneq0htMUHVMqVDs
FIREBASE_AUTH_DOMAIN=niaxtu-8e0dd.firebaseapp.com
FIREBASE_PROJECT_ID=niaxtu-8e0dd
FIREBASE_STORAGE_BUCKET=niaxtu-8e0dd.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=765265055722
FIREBASE_APP_ID=1:765265055722:web:f62b874ae37056529cac93

# 🔒 CONFIGURATION ADMIN SDK FIREBASE (Backend)
FIREBASE_PRIVATE_KEY_ID=e883b2a565a1f602e3f4c8d2960888e99f78c0fb
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC0V6BF3mP9Wgp1...[VOTRE CLEF COMPLÈTE]...==\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@niaxtu-8e0dd.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=113340555856401182104
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40niaxtu-8e0dd.iam.gserviceaccount.com
```

### 3. Vérifier le .gitignore

Assurez-vous que `.env` est dans votre `.gitignore` :

```bash
# .gitignore
.env
.env.local
.env.production
```

## ⚠️ Sécurité Importante

- **JAMAIS** commiter le fichier `.env`
- **JAMAIS** partager vos clés privées
- Utilisez des environnements différents pour dev/staging/production
- La `FIREBASE_PRIVATE_KEY` doit conserver ses retours à la ligne (`\n`)

## 🔧 Fonctionnement

Le fichier `firebase-real.js` charge automatiquement les variables via `dotenv` et vérifie que les variables critiques sont présentes au démarrage.

Si des variables manquent, l'application affichera une erreur claire avec les noms des variables manquantes.

## 🎯 Avantages

✅ **Sécurité** : Plus de clés sensibles dans le code  
✅ **Flexibilité** : Différentes configurations par environnement  
✅ **Collaboration** : Chaque développeur utilise ses propres clés  
✅ **Déploiement** : Configuration facile en production

## 🚨 Dépannage

Si vous obtenez l'erreur "Variables d'environnement manquantes", vérifiez :

1. Le fichier `.env` existe dans le dossier `backend/`
2. Toutes les variables requises sont renseignées
3. La `FIREBASE_PRIVATE_KEY` est entourée de guillemets
4. Pas d'espaces autour du signe `=`

## 📞 Support

En cas de problème, vérifiez d'abord que vos variables d'environnement correspondent exactement aux noms attendus dans `firebase-real.js`. 