# 📚 Documentation Base de Données Niaxtu

## 🎯 Vue d'Ensemble

Cette documentation décrit l'architecture complète de la base de données **Firestore NoSQL** pour la plateforme Niaxtu, adaptée du schéma relationnel vers une structure optimisée pour Firebase.

---

## 📋 Documents Disponibles

### 📊 [DATABASE_SCHEMA_FIRESTORE.md](./DATABASE_SCHEMA_FIRESTORE.md)
**Documentation complète du schéma Firestore**
- 🏛️ Structure organisationnelle hiérarchique (Ministère → Direction → Service → Bureau)
- 👥 Gestion des utilisateurs (Plaignants et Administrateurs)
- 📝 Système de plaintes avec géolocalisation
- 🏷️ Classification par secteurs et types
- 💬 Système de communication et fichiers joints
- 🔒 Données sensibles et sécurité
- 📈 Optimisations NoSQL et index recommandés

### 🔄 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
**Guide de migration SQL vers Firestore**
- 📊 Correspondance tables SQL → Collections Firestore
- 🏗️ Restructuration Structure → Hiérarchie ministérielle
- 📋 Scripts de migration automatisés
- 🔧 Outils et validation post-migration
- ✅ Checklist complète de migration

---

## 🏗️ Architecture Principale

### Structure Hiérarchique Gouvernementale
```
🏛️ Ministère
├── 📋 Direction
    ├── ⚙️ Service
        └── 🏪 Bureau (niveau final)
```

### Collections Principales
- **`plaignant`** - Utilisateurs de base (citoyens)
- **`admin`** - Administrateurs système
- **`plainte`** - Plaintes avec géolocalisation
- **`ministere`** - Niveau 1 hiérarchie
- **`direction`** - Niveau 2 hiérarchie  
- **`service`** - Niveau 3 hiérarchie
- **`bureau`** - Niveau 4 hiérarchie (feuille)
- **`secteur`** - Secteurs d'activité
- **`type_plainte`** - Types de plaintes
- **`commentaire`** - Communication
- **`fichier`** - Fichiers joints

---

## 🔑 Points Clés de l'Architecture

### ✅ Changements Majeurs
1. **Plaignants = Utilisateurs de base** (plus d'utilisateurs normaux)
2. **Structure → Hiérarchie ministérielle** (4 niveaux)
3. **Collection "admin"** pour tous les administrateurs
4. **Dénormalisation** pour optimiser les performances
5. **Géolocalisation** intégrée aux plaintes
6. **Système de fichiers** avec Firebase Storage

### 🚀 Optimisations NoSQL
- **Dénormalisation stratégique** des données fréquemment consultées
- **Index composites** pour les requêtes complexes
- **Références croisées** pour la navigation hiérarchique
- **Batch operations** pour les modifications multiples
- **Listeners temps réel** pour les mises à jour

---

## 🛡️ Sécurité et Permissions

### Règles Firestore
- **Plaignants** : Accès à leurs propres données uniquement
- **Admins** : Accès selon rôle (analyst → super_admin)
- **Plaintes** : Lecture publique, écriture contrôlée
- **Structure** : Lecture publique, écriture admin uniquement
- **Données sensibles** : Accès super_admin uniquement

### Rôles Administrateurs
- `analyst` - Consultation des données
- `moderator` - Modération des contenus
- `structure_manager` - Gestion des structures
- `sector_manager` - Gestion des secteurs
- `admin` - Administration générale
- `super_admin` - Accès complet

---

## 📊 Statistiques du Schéma

| **Élément** | **Quantité** | **Description** |
|-------------|--------------|-----------------|
| Collections | 13 | Collections principales Firestore |
| Niveaux hiérarchiques | 4 | Ministère → Direction → Service → Bureau |
| Types d'utilisateurs | 2 | Plaignants (base) + Admins (système) |
| Rôles admin | 6 | De analyst à super_admin |
| Index recommandés | 8+ | Pour optimiser les requêtes |
| Règles sécurité | 5 | Contrôle d'accès granulaire |

---

## 🔄 Migration depuis SQL

### Étapes Principales
1. **Export** des données SQL existantes
2. **Transformation** Structure → Hiérarchie ministérielle
3. **Migration** des plaignants avec métadonnées enrichies
4. **Import** des plaintes avec dénormalisation
5. **Validation** et création des index
6. **Configuration** des règles de sécurité

### Scripts Disponibles
- `migrate-plaignants.js` - Migration des utilisateurs
- `migrate-structure.js` - Création hiérarchie ministérielle
- `migrate-plaintes.js` - Migration des plaintes
- `validate-migration.js` - Validation post-migration

---

## 🚀 Démarrage Rapide

### 1. Configuration Firebase
```javascript
// Utiliser les vraies credentials dans firebase-real.js
const firebaseConfig = {
  projectId: "niaxtu-8e0dd",
  // ... autres paramètres
};
```

### 2. Collections de Base
```bash
# Créer la structure minimale
POST /api/organization/ministere
POST /api/organization/direction  
POST /api/organization/service
POST /api/organization/bureau
```

### 3. Premier Super Admin
```bash
# Route toujours active
POST /api/setup/create-super-admin
```

### 4. Migration (si données existantes)
```bash
node scripts/migrate-all.js data/sql-export.json
```

---

## 📈 Performance et Monitoring

### Métriques Clés
- **Temps de réponse** des requêtes principales
- **Utilisation des index** composites
- **Coût des opérations** Firestore
- **Taille des documents** (limite 1MB)
- **Bande passante** Firebase Storage

### Optimisations Recommandées
- **Cache côté client** avec persistance offline
- **Pagination** avec `startAfter()` pour grandes listes
- **Batch operations** pour modifications multiples
- **Listeners sélectifs** pour éviter les sur-écoutes

---

## 🔧 Maintenance

### Tâches Régulières
- **Nettoyage** des fichiers orphelins
- **Archivage** des anciennes plaintes
- **Mise à jour** des statistiques dénormalisées
- **Monitoring** des règles de sécurité
- **Backup** des données critiques

### Évolutions Prévues
- **Recherche textuelle** avancée avec Algolia
- **Analytics** avec BigQuery
- **Notifications push** avec FCM
- **API GraphQL** pour le frontend
- **Machine Learning** pour classification automatique

---

## 📞 Support

### Contacts Techniques
- **Architecture** : Équipe Backend Niaxtu
- **Firebase** : Documentation officielle Google
- **Migration** : Scripts dans `/backend/scripts/`
- **Sécurité** : Règles Firestore dans `/firestore.rules`

### Ressources Utiles
- [Documentation Firestore](https://firebase.google.com/docs/firestore)
- [Règles de sécurité](https://firebase.google.com/docs/firestore/security/get-started)
- [Optimisation des requêtes](https://firebase.google.com/docs/firestore/query-data/queries)
- [Bonnes pratiques NoSQL](https://firebase.google.com/docs/firestore/data-model)

---

*Documentation générée le 11 juin 2025 - Version 1.0*
*Système Niaxtu - Base de données Firestore NoSQL* 