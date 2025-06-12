# Configuration Firebase pour Niaxtu Backend

## 🔥 Méthode 1: Configuration Simple (Recommandée pour le développement)

### Étape 1: Installer Firebase CLI
```bash
npm install -g firebase-tools
```

### Étape 2: Se connecter à Firebase
```bash
firebase login
```

### Étape 3: Démarrer les emulators (optionnel)
```bash
firebase init emulators
firebase emulators:start
```

## 🔐 Méthode 2: Service Account (Pour la production)

### Étape 1: Aller dans la Console Firebase
1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet `niaxtu-8e0dd`
3. Allez dans "Paramètres du projet" (icône engrenage)
4. Onglet "Comptes de service"
5. Cliquez sur "Générer une nouvelle clé privée"
6. Téléchargez le fichier JSON

### Étape 2: Configurer les variables d'environnement
Créez un fichier `.env` dans le dossier `backend/` :

```env
# Configuration Firebase Admin SDK
GOOGLE_APPLICATION_CREDENTIALS=./config/firebase-service-account.json

# Configuration serveur
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Clé de setup pour créer le super admin
NIAXTU_SETUP_KEY=NIAXTU_SUPER_ADMIN_SETUP_2024
```

### Étape 3: Placer le fichier service account
Placez le fichier JSON téléchargé dans `backend/config/firebase-service-account.json`

## 🚀 Utilisation de la route de setup

Une fois Firebase configuré, vous pouvez créer le premier super administrateur :

```bash
POST http://localhost:3001/api/setup/create-super-admin
Content-Type: application/json

{
  "email": "admin@niaxtu.com",
  "password": "SuperAdmin2024!",
  "displayName": "Super Administrateur",
  "setupKey": "NIAXTU_SUPER_ADMIN_SETUP_2024",
  "profile": {
    "firstName": "Super",
    "lastName": "Administrateur",
    "phone": "+221 77 123 45 67",
    "organization": "Niaxtu Administration",
    "position": "Super Administrateur Système"
  }
}
```

## 📋 Notes importantes

- Cette route ne peut être utilisée qu'une seule fois
- Après la création du premier super admin, la route sera désactivée
- Conservez précieusement les identifiants créés
- Le super admin pourra ensuite créer d'autres administrateurs via l'interface

## 🔗 Documentation

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Variables d'environnement Node.js](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [Swagger API Documentation](http://localhost:3001/api-docs) 