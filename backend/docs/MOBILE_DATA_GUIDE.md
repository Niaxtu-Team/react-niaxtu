# Guide de Récupération des Données - Application Mobile Niaxtu

## Structure des Collections Firebase

### 1. Collection `ministères`
```dart
final ministeresRef = FirebaseFirestore.instance.collection('ministères');

// Récupérer tous les ministères actifs
final ministeres = await ministeresRef
  .where('actif', isEqualTo: true)
  .orderBy('nom')
  .get();
```

### 2. Collection `directions`
```dart
// Récupérer les directions d'un ministère spécifique
final directionsRef = FirebaseFirestore.instance.collection('directions');

final directions = await directionsRef
  .where('ministereId', isEqualTo: ministereId)
  .where('actif', isEqualTo: true)
  .orderBy('nom')
  .get();
```

### 3. Collection `services`
```dart
// Récupérer les services d'une direction spécifique
final servicesRef = FirebaseFirestore.instance.collection('services');

final services = await servicesRef
  .where('ministereId', isEqualTo: ministereId)
  .where('directionId', isEqualTo: directionId)
  .where('actif', isEqualTo: true)
  .orderBy('nom')
  .get();
```

## Exemple d'Utilisation dans un Widget

```dart
class StructureSelector extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
        .collection('ministeres')
        .where('actif', isEqualTo: true)
        .orderBy('nom')
        .snapshots(),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Text('Erreur: ${snapshot.error}');
        }

        if (snapshot.connectionState == ConnectionState.waiting) {
          return CircularProgressIndicator();
        }

        final ministeres = snapshot.data!.docs;
        
        return ListView.builder(
          itemCount: ministeres.length,
          itemBuilder: (context, index) {
            final ministere = ministeres[index];
            return ExpansionTile(
              title: Text(ministere['nom']),
              children: [
                FutureBuilder<QuerySnapshot>(
                  future: FirebaseFirestore.instance
                    .collection('directions')
                    .where('ministereId', isEqualTo: ministere.id)
                    .where('actif', isEqualTo: true)
                    .get(),
                  builder: (context, directionSnapshot) {
                    if (!directionSnapshot.hasData) {
                      return CircularProgressIndicator();
                    }

                    final directions = directionSnapshot.data!.docs;
                    return Column(
                      children: directions.map((direction) {
                        return ListTile(
                          title: Text(direction['nom']),
                          onTap: () => _loadServices(
                            ministereId: ministere.id,
                            directionId: direction.id,
                          ),
                        );
                      }).toList(),
                    );
                  },
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _loadServices({
    required String ministereId,
    required String directionId,
  }) async {
    final services = await FirebaseFirestore.instance
      .collection('services')
      .where('ministereId', isEqualTo: ministereId)
      .where('directionId', isEqualTo: directionId)
      .where('actif', isEqualTo: true)
      .get();

    // Traiter les services...
  }
}
```

## Points Importants à Noter

1. **Filtrage par Statut Actif** : Toujours inclure le filtre `where('actif', isEqualTo: true)` pour ne récupérer que les entités actives.

2. **Tri par Nom** : Utiliser `orderBy('nom')` pour avoir une liste alphabétique.

3. **Relations** :
   - Les directions ont un champ `ministereId` qui les lie à leur ministère
   - Les services ont des champs `ministereId` et `directionId` qui les lient à leur hiérarchie

4. **Performance** :
   - Créer des index composites dans Firebase pour les requêtes combinant plusieurs `where` avec `orderBy`
   - Utiliser `StreamBuilder` pour les données qui doivent être mises à jour en temps réel
   - Utiliser `FutureBuilder` pour les données statiques

5. **Gestion des Erreurs** :
   - Toujours gérer les cas d'erreur et de chargement
   - Afficher des messages d'erreur explicites à l'utilisateur
   - Prévoir un mécanisme de retry en cas d'échec de chargement 