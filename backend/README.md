# Backend Niaxtu - API Express avec Firebase

Ce backend fournit une API REST complète utilisant Express.js et Firebase (Firestore + Auth).

## 🚀 Installation

1. **Naviguer vers le dossier backend :**
```bash
cd backend
```

2. **Installer les dépendances :**
```bash
npm install
```

3. **Configuration Firebase :**
   - Aller sur [Firebase Console](https://console.firebase.google.com/)
   - Sélectionner votre projet `niaxtu-8e0dd`
   - Aller dans **Project Settings** > **Service Accounts**
   - Cliquer sur **Generate new private key**
   - Télécharger le fichier JSON

4. **Configuration des variables d'environnement :**
   - Copier `env.example` vers `.env`
   - Remplir les variables avec vos clés Firebase

## 🔧 Configuration

### Variables d'environnement
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
FIREBASE_PROJECT_ID=niaxtu-8e0dd
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

## 🚀 Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur sera accessible sur : `http://localhost:3001`

## 📡 API Endpoints

### Santé du serveur
- `GET /health` - Vérifier l'état du serveur

### Utilisateurs
- `GET /api/users/profile` - Profil utilisateur (authentifié)
- `PUT /api/users/profile` - Mettre à jour le profil (authentifié)
- `POST /api/users/create` - Créer un utilisateur
- `DELETE /api/users/profile` - Supprimer le compte (authentifié)
- `GET /api/users/all` - Liste des utilisateurs (authentifié)

### Données génériques (Firestore)
- `GET /api/data/:collection` - Obtenir documents d'une collection
- `GET /api/data/:collection/:id` - Obtenir un document spécifique
- `POST /api/data/:collection` - Créer un document (authentifié)
- `PUT /api/data/:collection/:id` - Mettre à jour un document (authentifié)
- `DELETE /api/data/:collection/:id` - Supprimer un document (authentifié)
- `GET /api/data/:collection/search` - Rechercher dans une collection

## 🔐 Authentification

L'API utilise Firebase Auth. Pour les routes protégées, incluez le token dans l'en-tête :
```
Authorization: Bearer YOUR_FIREBASE_TOKEN
```

## 📁 Structure du projet

```
backend/
├── config/
│   └── firebase.js          # Configuration Firebase Admin
├── controllers/
│   ├── userController.js    # Contrôleur utilisateurs
│   └── dataController.js    # Contrôleur données génériques
├── middleware/
│   └── auth.js              # Middleware d'authentification
├── routes/
│   ├── users.js             # Routes utilisateurs
│   └── data.js              # Routes données
├── package.json
├── server.js                # Point d'entrée principal
└── README.md
```

## 🛠️ Développement

### Ajouter de nouvelles routes
1. Créer un contrôleur dans `controllers/`
2. Créer les routes dans `routes/`
3. Importer et utiliser dans `server.js`

### Middleware disponible
- `verifyFirebaseToken` - Authentification obligatoire
- `optionalAuth` - Authentification optionnelle

## 🔒 Sécurité

- **Helmet** : Protection des en-têtes HTTP
- **CORS** : Configuration des origines autorisées  
- **Rate Limiting** : Limitation des requêtes par IP
- **Firebase Auth** : Authentification sécurisée

## 📝 Logs

Les logs sont gérés par Morgan et affichent :
- Requêtes HTTP entrantes
- Erreurs serveur
- Statut des opérations

## 🐛 Débogage

Pour activer les logs de débogage :
```bash
NODE_ENV=development npm run dev
``` 