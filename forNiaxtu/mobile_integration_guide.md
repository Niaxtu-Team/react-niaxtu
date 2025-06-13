# Guide d'Intégration Mobile Niaxtu - Nouvelle Structure

## 1. Structure des Données Firebase

### Collection 'users'
- Identifiant : `phone` (numéro de téléphone comme ID unique)
- Champs principaux :
  ```json
  {
    "phone": "+221XXXXXXXXX",
    "email": "string",
    "pseudo": "string",
    "prenom": "string",
    "nom": "string",
    "age": "number",
    "sexe": "string",
    "adresse": "string",
    "statut": "string" // 'actif', 'inactif', 'suspendu'
  }
  ```

### Collection 'complaints'
- Identifiant : auto-généré
- Structure :
  ```json
  {
    "userId": "string (phone number)",
    "title": "string",
    "description": "string",
    "isPrivee": "boolean",
    "typologies": ["string"],
    "latitude": "number",
    "longitude": "number",
    "address": "string",
    "media": ["string (URLs)"],
    "createdAt": "timestamp",
    "status": "string",
    "lastUpdated": "timestamp",
    
    // Pour structure publique
    "ministere": "string?",
    "direction": "string?",
    "service": "string?",
    
    // Pour structure privée
    "nomStructurePrivee": "string?",
    "emailStructurePrivee": "string?",
    "telephoneStructurePrivee": "string?"
  }
  ```

## 2. Modifications Nécessaires dans le Code Mobile

### LocalisationComplaintController

1. Modification de la méthode `saveComplaint` :
```dart
Future<void> saveComplaint({
  required String title,
  required String description,
  required bool isPrivee,
  required List<String> typologies,
  required Position position,
  required String address,
  required List<XFile> mediaFiles,
  // Nouveaux champs optionnels
  String? ministere,
  String? direction,
  String? service,
  String? nomStructurePrivee,
  String? emailStructurePrivee,
  String? telephoneStructurePrivee,
}) async {
  // ... Reste du code inchangé ...
}
```

2. Adaptation du formatage des données :
```dart
Map<String, dynamic> _formatComplaintData(String docId, Map<String, dynamic> data) {
  return {
    'id': docId,
    'title': data['title'] ?? '',
    'description': data['description'] ?? '',
    'isPrivee': data['isPrivee'] ?? false,
    'ministere': data['ministere'],
    'direction': data['direction'],
    'service': data['service'],
    'nomStructurePrivee': data['nomStructurePrivee'],
    'emailStructurePrivee': data['emailStructurePrivee'],
    'telephoneStructurePrivee': data['telephoneStructurePrivee'],
    // ... Autres champs ...
  };
}
```

### ExposeComplaintPage

1. Modification des validations :
```dart
// Pour structure privée
if (_isPrivee) {
  if (_structureController.text.isEmpty ||
      _telephoneController.text.isEmpty ||
      _emailController.text.isEmpty) {
    return false;
  }
} else {
  // Pour structure publique
  if (selectedMinistereId == null ||
      selectedDirectionId == null ||
      selectedServiceId == null) {
    return false;
  }
}
```

2. Adaptation de la soumission :
```dart
await controller.saveComplaint(
  title: _selectedTypePlainte!,
  description: description,
  isPrivee: _isPrivee,
  typologies: selectedTypes,
  position: pos,
  address: pos.latitude.toString() + ", " + pos.longitude.toString(),
  mediaFiles: _mediaFiles,
  // Nouveaux champs
  ministere: !_isPrivee ? selectedMinistereId : null,
  direction: !_isPrivee ? selectedDirectionId : null,
  service: !_isPrivee ? selectedServiceId : null,
  nomStructurePrivee: _isPrivee ? _structureController.text : null,
  emailStructurePrivee: _isPrivee ? _emailController.text : null,
  telephoneStructurePrivee: _isPrivee ? _telephoneController.text : null,
);
```

## 3. Points Importants à Noter

1. **Identification des Utilisateurs**
   - Utiliser le numéro de téléphone comme ID unique
   - Format : "+221XXXXXXXXX"
   - Vérifier la présence du "+" dans le numéro

2. **Gestion des Structures**
   - Structure privée : Collecter nom, email et téléphone
   - Structure publique : Utiliser les IDs des ministères/directions/services

3. **Validation des Données**
   - Vérifier le format du téléphone (9 chiffres, préfixes valides)
   - Valider l'email avec regex
   - S'assurer que tous les champs requis sont remplis

4. **Stockage des Médias**
   - Utiliser Firebase Storage pour les fichiers
   - Stocker uniquement les URLs dans Firestore
   - Limiter à 5 fichiers par plainte

## 4. Workflow de Soumission

1. **Préparation**
   ```dart
   // 1. Vérifier la connexion
   // 2. Valider les permissions (localisation, stockage)
   // 3. Collecter les données du formulaire
   ```

2. **Validation**
   ```dart
   // 1. Vérifier les champs requis
   // 2. Valider les formats (email, téléphone)
   // 3. Vérifier la position
   ```

3. **Upload des Médias**
   ```dart
   // 1. Compresser les images si nécessaire
   // 2. Upload vers Firebase Storage
   // 3. Récupérer les URLs
   ```

4. **Sauvegarde Firestore**
   ```dart
   // 1. Préparer le document
   // 2. Ajouter à la collection 'complaints'
   // 3. Gérer les erreurs
   ```

## 5. Gestion des Erreurs

1. **Erreurs Réseau**
   - Implémenter des retries pour les uploads
   - Sauvegarder localement en cas d'échec

2. **Validation des Données**
   - Messages d'erreur clairs et spécifiques
   - Guide utilisateur pour les corrections

3. **Gestion des Permissions**
   - Demander les permissions au bon moment
   - Expliquer pourquoi elles sont nécessaires

## 6. Améliorations Recommandées

1. **Cache Local**
   - Sauvegarder les brouillons localement
   - Synchroniser quand la connexion est disponible

2. **Compression des Médias**
   - Réduire la taille des images avant upload
   - Maintenir une qualité acceptable

3. **État de la Plainte**
   - Implémenter un système de suivi
   - Notifications des changements de statut 