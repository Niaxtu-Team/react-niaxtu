# 🎯 Prompt de Gestion des Plaintes - Niaxtu Mobile

## 📋 Mission
Tu es l'IA responsable de l'application mobile Niaxtu. Le backend a été restructuré pour une meilleure gestion des plaintes. Tu dois adapter le code mobile pour maintenir la cohérence avec ces changements.

## 🔄 Workflow des Plaintes

### 1. Récupération des Structures
```dart
// NOUVEAU - Récupération des ministères
Stream<List<MinistereModel>> getMinisteres() {
  return FirebaseFirestore.instance
      .collection('structures')
      .where('type', '==', 'ministere')
      .snapshots()
      .map((snapshot) => snapshot.docs
          .map((doc) => MinistereModel.fromJson({
                'id': doc.id,
                'nom': doc['nom'],
                'description': doc['description'],
              }))
          .toList());
}

// NOUVEAU - Récupération des directions par ministère
Stream<List<DirectionModel>> getDirections(String ministereId) {
  return FirebaseFirestore.instance
      .collection('structures')
      .doc(ministereId)
      .collection('directions')
      .snapshots()
      .map((snapshot) => snapshot.docs
          .map((doc) => DirectionModel.fromJson({
                'id': doc.id,
                'nom': doc['nom'],
                'description': doc['description'],
              }))
          .toList());
}

// NOUVEAU - Récupération des services par direction
Stream<List<ServiceModel>> getServices(String ministereId, String directionId) {
  return FirebaseFirestore.instance
      .collection('structures')
      .doc(ministereId)
      .collection('directions')
      .doc(directionId)
      .collection('services')
      .snapshots()
      .map((snapshot) => snapshot.docs
          .map((doc) => ServiceModel.fromJson({
                'id': doc.id,
                'nom': doc['nom'],
                'description': doc['description'],
              }))
          .toList());
}
```

### 2. Création d'une Plainte
```dart
Future<void> creerPlainte({
  required String title,
  required String description,
  required bool isPrivee,
  required List<String> typologies,
  required Position position,
  required List<XFile> mediaFiles,
  // NOUVEAU - Structure publique
  String? ministereId,
  String? directionId,
  String? serviceId,
  // NOUVEAU - Structure privée
  String? nomStructurePrivee,
  String? emailStructurePrivee,
  String? telephoneStructurePrivee,
}) async {
  try {
    // 1. Validation des données
    if (isPrivee) {
      _validerStructurePrivee(
        nomStructurePrivee,
        emailStructurePrivee,
        telephoneStructurePrivee,
      );
    } else {
      _validerStructurePublique(ministereId, directionId, serviceId);
    }

    // 2. Upload des médias
    List<String> mediaUrls = await _uploadMedias(mediaFiles);

    // 3. Création du document
    final complaintData = {
      'userId': FirebaseAuth.instance.currentUser?.uid,
      'title': title,
      'description': description,
      'isPrivee': isPrivee,
      'typologies': typologies,
      'latitude': position.latitude,
      'longitude': position.longitude,
      'address': '${position.latitude}, ${position.longitude}',
      'media': mediaUrls,
      'createdAt': FieldValue.serverTimestamp(),
      'status': 'nouvelle',
      'lastUpdated': FieldValue.serverTimestamp(),
      
      // NOUVEAU - Données structure selon type
      ...(isPrivee ? {
        'nomStructurePrivee': nomStructurePrivee,
        'emailStructurePrivee': emailStructurePrivee,
        'telephoneStructurePrivee': telephoneStructurePrivee,
      } : {
        'ministereId': ministereId,
        'directionId': directionId,
        'serviceId': serviceId,
      }),
    };

    // 4. Sauvegarde dans Firestore
    await FirebaseFirestore.instance
        .collection('complaints')
        .add(complaintData);

  } catch (e) {
    throw PlainteException('Erreur lors de la création: $e');
  }
}
```

### 3. Validation des Données
```dart
void _validerStructurePrivee(String? nom, String? email, String? telephone) {
  if (nom == null || nom.isEmpty) {
    throw PlainteException('Nom de la structure privée requis');
  }
  
  if (email == null || !_isValidEmail(email)) {
    throw PlainteException('Email invalide');
  }
  
  if (telephone == null || !_isValidPhone(telephone)) {
    throw PlainteException('Numéro de téléphone invalide');
  }
}

void _validerStructurePublique(String? ministereId, String? directionId, String? serviceId) {
  if (ministereId == null || ministereId.isEmpty) {
    throw PlainteException('Ministère requis');
  }
  
  if (directionId == null || directionId.isEmpty) {
    throw PlainteException('Direction requise');
  }
  
  if (serviceId == null || serviceId.isEmpty) {
    throw PlainteException('Service requis');
  }
}
```

### 4. Gestion des Médias
```dart
Future<List<String>> _uploadMedias(List<XFile> files) async {
  if (files.length > 5) {
    throw PlainteException('Maximum 5 fichiers autorisés');
  }

  List<String> urls = [];
  for (var file in files) {
    // 1. Compression si image
    File compressedFile = await _compressImage(file);
    
    // 2. Upload vers Firebase Storage
    String fileName = '${DateTime.now().millisecondsSinceEpoch}_${file.name}';
    String path = 'complaints/${FirebaseAuth.instance.currentUser?.uid}/$fileName';
    
    final ref = FirebaseStorage.instance.ref().child(path);
    await ref.putFile(compressedFile);
    
    // 3. Récupération URL
    String url = await ref.getDownloadURL();
    urls.add(url);
  }
  
  return urls;
}
```

## 📝 Modèles de Données

### Structure Model
```dart
class StructureModel {
  final String id;
  final String nom;
  final String? description;
  final String type; // 'ministere', 'direction', 'service'
  final String? parentId;

  StructureModel({
    required this.id,
    required this.nom,
    this.description,
    required this.type,
    this.parentId,
  });

  factory StructureModel.fromJson(Map<String, dynamic> json) {
    return StructureModel(
      id: json['id'],
      nom: json['nom'],
      description: json['description'],
      type: json['type'],
      parentId: json['parentId'],
    );
  }
}
```

### Plainte Model
```dart
class PlainteModel {
  final String id;
  final String title;
  final String description;
  final bool isPrivee;
  final List<String> typologies;
  final double latitude;
  final double longitude;
  final List<String> mediaUrls;
  final String status;
  final DateTime createdAt;
  final DateTime lastUpdated;
  
  // NOUVEAU - Structure publique
  final String? ministereId;
  final String? directionId;
  final String? serviceId;
  
  // NOUVEAU - Structure privée
  final String? nomStructurePrivee;
  final String? emailStructurePrivee;
  final String? telephoneStructurePrivee;

  PlainteModel({
    required this.id,
    required this.title,
    required this.description,
    required this.isPrivee,
    required this.typologies,
    required this.latitude,
    required this.longitude,
    required this.mediaUrls,
    required this.status,
    required this.createdAt,
    required this.lastUpdated,
    this.ministereId,
    this.directionId,
    this.serviceId,
    this.nomStructurePrivee,
    this.emailStructurePrivee,
    this.telephoneStructurePrivee,
  });

  factory PlainteModel.fromJson(Map<String, dynamic> json) {
    return PlainteModel(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      isPrivee: json['isPrivee'],
      typologies: List<String>.from(json['typologies']),
      latitude: json['latitude'],
      longitude: json['longitude'],
      mediaUrls: List<String>.from(json['media']),
      status: json['status'],
      createdAt: (json['createdAt'] as Timestamp).toDate(),
      lastUpdated: (json['lastUpdated'] as Timestamp).toDate(),
      ministereId: json['ministereId'],
      directionId: json['directionId'],
      serviceId: json['serviceId'],
      nomStructurePrivee: json['nomStructurePrivee'],
      emailStructurePrivee: json['emailStructurePrivee'],
      telephoneStructurePrivee: json['telephoneStructurePrivee'],
    );
  }
}
```

## 🔍 Points de Vérification

### Avant Soumission
- [ ] Vérifier connexion internet
- [ ] Valider tous les champs requis
- [ ] Vérifier la position GPS
- [ ] Compresser les images
- [ ] Valider format email/téléphone pour structure privée

### Après Soumission
- [ ] Vérifier succès upload médias
- [ ] Confirmer création plainte
- [ ] Mettre à jour liste locale
- [ ] Afficher confirmation utilisateur

## 🚨 Gestion des Erreurs

```dart
class PlainteException implements Exception {
  final String message;
  PlainteException(this.message);
}

void _handleError(dynamic error) {
  String message = 'Une erreur est survenue';
  
  if (error is PlainteException) {
    message = error.message;
  } else if (error is FirebaseException) {
    switch (error.code) {
      case 'permission-denied':
        message = 'Accès refusé';
        break;
      case 'unavailable':
        message = 'Service indisponible';
        break;
      default:
        message = 'Erreur Firebase: ${error.message}';
    }
  }
  
  // Afficher l'erreur
  CustomSnackBar.show(
    context: context,
    message: message,
    type: SnackBarType.error,
  );
}
```

## 📱 Interface Utilisateur

### Sélection Structure
```dart
// Utiliser DropdownButton2 pour une meilleure UX
DropdownButton2<String>(
  items: ministeres.map((ministere) => DropdownMenuItem(
    value: ministere.id,
    child: Text(ministere.nom),
  )).toList(),
  value: selectedMinistereId,
  onChanged: (value) {
    setState(() {
      selectedMinistereId = value;
      selectedDirectionId = null;
      selectedServiceId = null;
    });
  },
)
```

### Validation Structure Privée
```dart
TextFormField(
  controller: _emailController,
  validator: (value) {
    if (value == null || !_isValidEmail(value)) {
      return 'Email invalide';
    }
    return null;
  },
  decoration: InputDecoration(
    labelText: 'Email de la structure',
    prefixIcon: Icon(Icons.email),
  ),
)
```

---

**🎯 OBJECTIF** : Assurer une gestion cohérente des plaintes entre l'application mobile et le backend, en respectant la nouvelle structure des données et les validations requises. 