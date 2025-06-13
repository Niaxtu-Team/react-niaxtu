# 🎯 Prompt de Contrôle Mobile - Cohérence des Données Niaxtu

## 📋 Mission Critique
Tu es l'IA responsable de l'application mobile Niaxtu. Le backend admin a ajouté des **champs de contrôle** pour gérer les plaignants. Tu dois **IMPÉRATIVEMENT** vérifier ces champs pour maintenir la cohérence avec l'administration.

## ⚠️ NOUVEAUX CHAMPS DE CONTRÔLE OBLIGATOIRES

### **1. Champ `statut` (PRIORITÉ MAXIMALE)**
```dart
// NOUVEAUX STATUTS POSSIBLES
enum StatutCompte {
  actif,        // Utilisateur peut utiliser l'app normalement
  inactif,      // Compte désactivé - BLOQUER l'accès
  suspendu,     // Suspension temporaire - BLOQUER l'accès  
  banni,        // Bannissement définitif - BLOQUER l'accès
  en_attente    // En attente d'activation admin - BLOQUER l'accès
}
```

**❌ ANCIEN CODE (À REMPLACER)**
```dart
// NE PLUS UTILISER SEULEMENT isActif
if (userData['isActif'] == false) {
  // Ancien contrôle insuffisant
}
```

**✅ NOUVEAU CODE (OBLIGATOIRE)**
```dart
// VÉRIFIER LE STATUT EN PRIORITÉ
String statut = userData['statut'] ?? 'actif';
bool isActif = userData['isActif'] ?? true;

// COHÉRENCE DES DEUX CHAMPS
bool peutAcceder = (statut == 'actif') && isActif;

if (!peutAcceder) {
  await _bloquerAccesUtilisateur(statut, userData);
  return;
}
```

### **2. Champ `raisonStatut` (AFFICHAGE UTILISATEUR)**
```dart
// AFFICHER LA RAISON DU BLOCAGE
String? raison = userData['raisonStatut'];
if (raison != null) {
  await _afficherMessageBloquage(statut, raison);
}
```

### **3. Champ `dateFinSuspension` (GESTION TEMPORAIRE)**
```dart
// VÉRIFIER SI SUSPENSION EXPIRÉE
if (statut == 'suspendu' && userData['dateFinSuspension'] != null) {
  Timestamp finSuspension = userData['dateFinSuspension'];
  if (DateTime.now().isAfter(finSuspension.toDate())) {
    // Suspension expirée - demander réactivation
    await _demanderReactivation();
  }
}
```

### **4. Champ `historique` (TRAÇABILITÉ)**
```dart
// GARDER TRACE DES CHANGEMENTS
List<Map> historique = userData['historique'] ?? [];
// Peut être utilisé pour afficher l'historique des sanctions
```

## 🔧 MODIFICATIONS OBLIGATOIRES PAR FONCTION

### **1. AuthController.userExists()**
```dart
Future<bool> userExists(String phone) async {
  try {
    final snapshot = await db.collection('users')
        .where('telephone', '==', phone)
        .get();
    
    if (snapshot.docs.isNotEmpty) {
      // VÉRIFIER LE STATUT DU COMPTE EXISTANT
      final userData = snapshot.docs.first.data();
      String statut = userData['statut'] ?? 'actif';
      
      // Si compte banni définitivement, considérer comme inexistant
      if (statut == 'banni') {
        return false; // Permettre re-inscription
      }
    }
    
    return snapshot.docs.isNotEmpty;
  } catch (e) {
    return false;
  }
}
```

### **2. AuthController.signIn() - CONTRÔLE PRINCIPAL**
```dart
Future<User?> signIn(String email, String password) async {
  try {
    // Connexion Firebase normale
    UserCredential credential = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    
    // VÉRIFICATION OBLIGATOIRE DU STATUT
    await _verifierStatutCompte(credential.user!.uid);
    
    return credential.user;
  } catch (e) {
    throw e;
  }
}

// FONCTION DE VÉRIFICATION CRITIQUE
Future<void> _verifierStatutCompte(String uid) async {
  try {
    final userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) return;
    
    final userData = userDoc.data()!;
    String statut = userData['statut'] ?? 'actif';
    bool isActif = userData['isActif'] ?? true;
    
    // LOGIQUE DE BLOCAGE
    switch (statut) {
      case 'actif':
        if (!isActif) {
          throw Exception('Compte désactivé par l\'administration');
        }
        break;
        
      case 'inactif':
        throw Exception('Compte inactif. Contactez le support.');
        
      case 'suspendu':
        String raison = userData['raisonStatut'] ?? 'Suspension administrative';
        DateTime? finSuspension = userData['dateFinSuspension']?.toDate();
        
        if (finSuspension != null && DateTime.now().isAfter(finSuspension)) {
          // Suspension expirée - permettre connexion et demander réactivation
          await _demanderReactivationAutomatique(uid);
        } else {
          String message = 'Compte suspendu: $raison';
          if (finSuspension != null) {
            message += '\nFin de suspension: ${DateFormat('dd/MM/yyyy').format(finSuspension)}';
          }
          throw Exception(message);
        }
        break;
        
      case 'banni':
        String raison = userData['raisonStatut'] ?? 'Bannissement administratif';
        throw Exception('Compte banni définitivement: $raison');
        
      case 'en_attente':
        throw Exception('Compte en attente d\'activation par un administrateur');
        
      default:
        throw Exception('Statut de compte invalide');
    }
    
    // Mettre à jour dernière connexion
    await userDoc.reference.update({
      'dernierConnexion': FieldValue.serverTimestamp(),
      'dateMiseAJour': FieldValue.serverTimestamp(),
    });
    
  } catch (e) {
    // Déconnecter et afficher erreur
    await _auth.signOut();
    throw e;
  }
}
```

### **3. Fonction de Réactivation Automatique**
```dart
Future<void> _demanderReactivationAutomatique(String uid) async {
  try {
    // Mettre à jour le statut localement après expiration suspension
    await db.collection('users').doc(uid).update({
      'statut': 'actif',
      'isActif': true,
      'raisonStatut': 'Réactivation automatique après expiration de suspension',
      'dateFinSuspension': null,
      'historique': FieldValue.arrayUnion([{
        'statut': 'actif',
        'raison': 'Réactivation automatique après expiration',
        'date': FieldValue.serverTimestamp(),
        'adminId': 'SYSTEM_AUTO',
        'adminNom': 'Système automatique'
      }]),
      'dateMiseAJour': FieldValue.serverTimestamp(),
    });
    
    // Afficher message de réactivation
    CustomSnackBar.show(
      context: context,
      message: 'Votre compte a été réactivé automatiquement',
      type: SnackBarType.success,
    );
    
  } catch (e) {
    print('Erreur réactivation automatique: $e');
  }
}
```

### **4. Interface Utilisateur - Messages de Statut**
```dart
Widget _buildAccountStatusMessage(Map<String, dynamic> userData) {
  String statut = userData['statut'] ?? 'actif';
  String? raison = userData['raisonStatut'];
  DateTime? finSuspension = userData['dateFinSuspension']?.toDate();
  
  if (statut == 'actif') return SizedBox.shrink();
  
  Color couleur;
  IconData icone;
  String message;
  
  switch (statut) {
    case 'en_attente':
      couleur = Colors.orange;
      icone = Icons.hourglass_empty;
      message = 'Compte en attente d\'activation';
      break;
    case 'suspendu':
      couleur = Colors.red;
      icone = Icons.pause_circle;
      message = 'Compte suspendu';
      if (finSuspension != null) {
        message += ' jusqu\'au ${DateFormat('dd/MM/yyyy').format(finSuspension)}';
      }
      break;
    case 'inactif':
      couleur = Colors.grey;
      icone = Icons.block;
      message = 'Compte désactivé';
      break;
    case 'banni':
      couleur = Colors.black;
      icone = Icons.gavel;
      message = 'Compte banni définitivement';
      break;
    default:
      return SizedBox.shrink();
  }
  
  return Container(
    margin: EdgeInsets.all(16),
    padding: EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: couleur.withOpacity(0.1),
      border: Border.all(color: couleur),
      borderRadius: BorderRadius.circular(8),
    ),
    child: Row(
      children: [
        Icon(icone, color: couleur),
        SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(message, style: TextStyle(color: couleur, fontWeight: FontWeight.bold)),
              if (raison != null) Text('Raison: $raison', style: TextStyle(fontSize: 12)),
            ],
          ),
        ),
      ],
    ),
  );
}
```

## 📍 POINTS DE VÉRIFICATION OBLIGATOIRES

### **À Chaque Connexion**
- [ ] Vérifier `statut` ET `isActif`
- [ ] Bloquer si != 'actif' ou isActif != true
- [ ] Afficher raison du blocage
- [ ] Gérer les suspensions expirées

### **À Chaque Action Importante**
- [ ] Vérifier statut avant envoi de plainte
- [ ] Vérifier statut avant modification profil
- [ ] Vérifier statut avant accès aux fonctionnalités

### **Mise à Jour Automatique**
- [ ] Mettre à jour `dernierConnexion` à chaque connexion
- [ ] Mettre à jour `dateMiseAJour` à chaque modification
- [ ] Conserver la cohérence `statut` ↔ `isActif`

## 🚨 RÈGLES CRITIQUES DE COHÉRENCE

1. **JAMAIS** se fier uniquement à `isActif`
2. **TOUJOURS** vérifier `statut` en priorité
3. **MAINTENIR** la cohérence : `isActif = (statut == 'actif')`
4. **BLOQUER** l'accès si `statut != 'actif'`
5. **AFFICHER** la `raisonStatut` à l'utilisateur
6. **GÉRER** les suspensions temporaires avec `dateFinSuspension`

## 📝 Variables d'Environnement

```dart
// Ajouter dans les constantes de l'app
class AppConstants {
  static const bool DEBUG_SHOW_ALL_STATUTS = true; // En développement
  static const bool AUTO_REACTIVATE_EXPIRED = true; // Réactivation auto
  static const int CHECK_STATUT_INTERVAL = 300; // 5 minutes
}
```

---

**🎯 OBJECTIF** : Assurer une cohérence parfaite entre l'app mobile et l'administration backend pour le contrôle des comptes utilisateurs. 