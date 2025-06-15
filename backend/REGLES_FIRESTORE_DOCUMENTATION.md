# 🔒 Documentation des Règles Firebase Firestore

## 📋 Vue d'ensemble

Ce document décrit les règles de sécurité Firebase Firestore pour l'application Niaxtu. Les règles définissent qui peut accéder à quelles données et dans quelles conditions.

## 🏗️ Architecture des Permissions

### Hiérarchie des Rôles

1. **Super Admin** (`super_admin`) 
   - Accès complet à toutes les collections
   - Peut gérer tous les autres administrateurs
   - Seul à pouvoir modifier les paramètres système

2. **Admin** (`admin`)
   - Accès complet aux plaintes, utilisateurs, et structures
   - Peut gérer tous les rôles sauf super_admin
   - Peut créer/supprimer des collections de référence

3. **Gestionnaire de Secteur** (`sector_manager`)
   - Gère les secteurs et sous-secteurs qui lui sont assignés
   - Peut voir et traiter les plaintes de son secteur
   - Peut créer des structures dans son secteur

4. **Gestionnaire de Structure** (`structure_manager`)
   - Gère les structures qui lui sont assignées
   - Peut voir les plaintes liées à ses structures
   - Peut modifier les informations de ses structures

5. **Modérateur** (`moderator`)
   - Peut voir et traiter toutes les plaintes
   - Peut créer des rapports
   - Accès limité aux données utilisateurs

6. **Analyste** (`analyst`)
   - Peut voir toutes les plaintes et statistiques
   - Peut créer des rapports d'analyse
   - Accès en lecture seule principalement

7. **Utilisateur** (`user`)
   - Peut créer et gérer ses propres plaintes
   - Accès en lecture aux collections de référence
   - Profil personnel modifiable

## 📊 Règles par Collection

### Collection `users`

**Objectif** : Gérer les profils des utilisateurs finaux

**Permissions** :
- **Lecture** : 
  - ✅ Propriétaire de son propre profil
  - ✅ Admins et modérateurs (tous les profils)
- **Écriture** :
  - ✅ Propriétaire (champs limités)
  - ✅ Admins (tous les champs)
- **Création** : Admins et gestionnaires de secteur uniquement
- **Suppression** : Super admins uniquement

### Collection `admin`

**Objectif** : Gérer les profils des administrateurs

**Permissions** :
- **Lecture** : 
  - ✅ Administrateur de son propre profil
  - ✅ Super admin (tous les profils)
- **Écriture** :
  - ✅ Administrateur (son propre profil, champs limités)
  - ✅ Super admin (tous les profils)
- **Création/Suppression** : Super admins uniquement

### Collection `complaints` (Plaintes)

**Objectif** : Accès complet pour les utilisateurs à leurs plaintes

**Permissions** :
- **Lecture** :
  - ✅ Propriétaire de ses propres plaintes
  - ✅ Admins, modérateurs, analystes (toutes les plaintes)
- **Création** : Tous les utilisateurs authentifiés et actifs
- **Modification** :
  - ✅ Propriétaire (champs limités, sauf plaintes résolues)
  - ✅ Admins et modérateurs (tous les champs)
- **Suppression** : Admins uniquement

### Collections de Référence (Lecture seule pour les users)

#### `ministères`
- **Lecture** : Tous les utilisateurs authentifiés ✅
- **Écriture** : Gestionnaires de structure et admins
- **Création/Suppression** : Admins uniquement

#### `directions`
- **Lecture** : Tous les utilisateurs authentifiés ✅
- **Écriture** : Gestionnaires de structure et admins
- **Création/Suppression** : Admins uniquement

#### `secteurs`
- **Lecture** : Tous les utilisateurs authentifiés ✅
- **Écriture** : Gestionnaires de secteur et admins
- **Création/Suppression** : Admins uniquement

#### `sous_secteurs`
- **Lecture** : Tous les utilisateurs authentifiés ✅
- **Écriture** : Gestionnaires de secteur et admins
- **Création/Suppression** : Admins uniquement

#### `services`
- **Lecture** : Tous les utilisateurs authentifiés ✅
- **Écriture** : Gestionnaires de structure et admins
- **Création/Suppression** : Admins uniquement

## 🛡️ Fonctions de Sécurité

### Fonctions d'Authentification

```javascript
// Vérifier si l'utilisateur est authentifié
function isAuthenticated()

// Obtenir l'ID utilisateur
function getUserId()

// Vérifier la propriété d'une ressource
function isOwner(userId)

// Obtenir les données utilisateur
function getUserData()
```

### Fonctions de Rôles

```javascript
// Vérifications hiérarchiques
function isSuperAdmin()
function isAdmin()
function isSectorManager()
function isStructureManager()
function isModerator()
function isAnalyst()

// Vérifications fonctionnelles
function canManageUsers()
function isActiveUser()
```

## 🔐 Sécurité Avancée

### Protection contre les Attaques

1. **Injection de données** : Toutes les requêtes sont validées via les fonctions utilitaires
2. **Escalade de privilèges** : Hiérarchie stricte des rôles
3. **Accès non autorisé** : Vérification systématique de l'authentification
4. **Modification de données critiques** : Restrictions selon le rôle

### Vérifications Obligatoires

- ✅ Utilisateur authentifié
- ✅ Utilisateur actif
- ✅ Rôle approprié pour l'action
- ✅ Propriété de la ressource (si applicable)

## 📈 Collections Spéciales

### Statistiques et Rapports

- **`statistics`** : Lecture pour analystes+, écriture interdite (système uniquement)
- **`reports`** : Lecture pour analystes+, création pour modérateurs+
- **`logs`** : Lecture pour admins uniquement, écriture système
- **`audit`** : Lecture pour super admins uniquement

### Médias et Notifications

- **`media`** : Propriétaire ou admin peut lire/supprimer
- **`notifications`** : Destinataire peut lire/modifier, admin peut créer/supprimer

## 🚨 Règles de Sécurité Critiques

### Interdictions Absolues

- ❌ Accès anonyme à toute collection
- ❌ Modification des logs par les utilisateurs
- ❌ Suppression d'administrateurs par des non-super-admins
- ❌ Accès aux audits par des non-super-admins

### Restrictions Importantes

- ⚠️ Les utilisateurs ne peuvent modifier que leurs propres plaintes non résolues
- ⚠️ Les gestionnaires de secteur ne peuvent agir que dans leurs secteurs assignés
- ⚠️ Les statistiques ne peuvent être écrites que par le système

## 🔧 Maintenance et Monitoring

### Vérifications Recommandées

1. **Audits réguliers** : Vérifier les accès dans la collection `audit`
2. **Monitoring des logs** : Surveiller les tentatives d'accès non autorisées
3. **Révision des rôles** : Vérifier périodiquement les permissions des utilisateurs

### Tests de Sécurité

```javascript
// Test d'accès non autorisé
// Vérifier qu'un utilisateur ne peut pas accéder aux données d'un autre

// Test d'escalade de privilèges
// Vérifier qu'un rôle inférieur ne peut pas effectuer d'actions de niveau supérieur

// Test de modification de données critiques
// Vérifier que les champs sensibles sont protégés
```

## 📞 Support et Résolution de Problèmes

### Erreurs Communes

1. **"Permission denied"** : Vérifier le rôle et le statut actif de l'utilisateur
2. **"User not found"** : L'utilisateur doit exister dans la collection `admin` ou `users`
3. **"Invalid role"** : Le rôle doit correspondre aux valeurs définies

### Debug

Pour déboguer les règles, vérifiez :
- L'utilisateur est-il authentifié ?
- Le rôle est-il correctement défini ?
- L'utilisateur est-il actif ?
- Les données de la ressource sont-elles accessibles ?

---

**Important** : Ces règles sont critiques pour la sécurité de l'application. Toute modification doit être testée rigoureusement avant le déploiement en production. 