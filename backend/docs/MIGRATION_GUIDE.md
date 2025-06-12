# 🔄 Guide de Migration SQL vers Firestore

## 📊 Correspondance des Tables

### Transformation des Tables SQL en Collections Firestore

| **Table SQL** | **Collection Firestore** | **Changements** |
|---------------|--------------------------|-----------------|
| `Plaignant` | `plaignant` | ✅ Mapping direct + ajout métadonnées |
| `Structure` | `ministere`, `direction`, `service`, `bureau` | 🔄 **Éclatement hiérarchique** |
| `Secteur` | `secteur` | ✅ Mapping direct |
| `Type_cible` | `type_plainte` | ✅ Renommage + mapping |
| `Plainte` | `plainte` | ✅ Mapping + dénormalisation |
| `Commentaires` | `commentaire` | ✅ Mapping direct |
| `Fichier` | `fichier` | ✅ Mapping + métadonnées |
| `Cible_privee` | `cible_privee` | ✅ Mapping + sécurité |
| `Reponse_cible` | `reponse_cible` | ✅ Mapping + templates |

---

## 🏗️ Restructuration Majeure : Structure → Hiérarchie Ministérielle

### Ancien Modèle (SQL)
```sql
Structure {
  structure_id: bigint,
  secteur_id: bigint,
  structure_libelle: varchar(255),
  structure_ordre: bigint,
  structure_email: varchar(255),
  structure_tel1: varchar(255),
  structure_tel2: varchar(255),
  structure_mots_cles: varchar(255)
}
```

### Nouveau Modèle (Firestore) - 4 Niveaux
```javascript
// Niveau 1: Ministère
ministere: {
  nom: "Ministère de l'Intérieur",
  code: "MIN_INT",
  ministre: "Jean Dupont",
  // ... autres champs
}

// Niveau 2: Direction
direction: {
  nom: "Direction Générale de la Sécurité Publique",
  code: "DGSP",
  ministereId: "ministere_123",
  directeur: "Marie Martin",
  // ... autres champs
}

// Niveau 3: Service
service: {
  nom: "Service de Police Municipale", 
  code: "SPM",
  directionId: "direction_456",
  ministereId: "ministere_123", // Référence rapide
  chefService: "Pierre Durand",
  // ... autres champs
}

// Niveau 4: Bureau
bureau: {
  nom: "Bureau des Permis de Conduire",
  code: "BPC", 
  serviceId: "service_789",
  directionId: "direction_456", // Navigation
  ministereId: "ministere_123", // Navigation
  responsable: "Sophie Leblanc",
  // ... autres champs
}
```

---

## 📋 Scripts de Migration

### 1. Migration des Plaignants
```javascript
// scripts/migrate-plaignants.js
import { db } from '../config/firebase.js';

export const migratePlaignants = async (sqlData) => {
  const batch = db.batch();
  
  for (const plaignant of sqlData.plaignants) {
    const docRef = db.collection('plaignant').doc();
    
    const firestoreData = {
      // Mapping direct
      uid: plaignant.plaignant_id, // Temporaire, sera remplacé par Firebase Auth
      email: plaignant.plaignant_email,
      pseudo: plaignant.plaignant_pseudo,
      prenom: plaignant.plaignant_prenom,
      nom: plaignant.plaignant_nom,
      telephone: plaignant.plaignant_tel1,
      age: plaignant.plaignant_age,
      sexe: plaignant.plaignant_sexe,
      avatar: plaignant.plaignant_avatar,
      
      // Restructuration adresse
      adresse: {
        rue: plaignant.plaignant_adresse || "",
        ville: "", // À extraire de l'adresse
        codePostal: "",
        pays: "France"
      },
      
      // Nouveaux champs Firestore
      localisation: {
        latitude: null,
        longitude: null,
        precision: 100
      },
      preferences: {
        notifications: true,
        newsletter: false,
        langue: "fr"
      },
      statistiques: {
        nombrePlaintes: 0, // Sera calculé
        dernierePlainte: null,
        scoreReputation: 50
      },
      
      // Métadonnées
      isActif: true,
      isVerifie: false,
      dateInscription: plaignant.created_at || new Date(),
      dernierConnexion: null,
      dateMiseAJour: new Date()
    };
    
    batch.set(docRef, firestoreData);
  }
  
  await batch.commit();
  console.log(`✅ ${sqlData.plaignants.length} plaignants migrés`);
};
```

### 2. Migration Structure → Hiérarchie
```javascript
// scripts/migrate-structure.js
export const migrateStructureToHierarchy = async (sqlData) => {
  // Étape 1: Créer les ministères
  const ministeres = await createMinisteres(sqlData.structures);
  
  // Étape 2: Créer les directions
  const directions = await createDirections(sqlData.structures, ministeres);
  
  // Étape 3: Créer les services
  const services = await createServices(sqlData.structures, directions);
  
  // Étape 4: Créer les bureaux
  const bureaux = await createBureaux(sqlData.structures, services);
  
  return { ministeres, directions, services, bureaux };
};

const createMinisteres = async (structures) => {
  const ministeresMap = new Map();
  
  // Grouper par ministère (logique métier à définir)
  const ministeresUniques = extractMinisteresFromStructures(structures);
  
  for (const ministereData of ministeresUniques) {
    const docRef = db.collection('ministere').doc();
    
    const data = {
      nom: ministereData.nom,
      code: ministereData.code,
      description: ministereData.description,
      ministre: "",
      adresse: {},
      contact: {
        email: ministereData.email,
        telephone: ministereData.tel1
      },
      logo: "",
      couleur: "#3b82f6",
      isActif: true,
      dateCreation: new Date(),
      dateMiseAJour: new Date(),
      creePar: "migration_script"
    };
    
    await docRef.set(data);
    ministeresMap.set(ministereData.originalId, docRef.id);
  }
  
  return ministeresMap;
};
```

### 3. Migration des Plaintes
```javascript
// scripts/migrate-plaintes.js
export const migratePlaintes = async (sqlData, structureMapping) => {
  const batch = db.batch();
  
  for (const plainte of sqlData.plaintes) {
    const docRef = db.collection('plainte').doc();
    
    // Résoudre la nouvelle structure assignée
    const nouveauBureauId = resolveNewStructure(
      plainte.structure_id, 
      structureMapping
    );
    
    const firestoreData = {
      // Informations plaignant (dénormalisées)
      plaignantId: plainte.plaignant_id,
      plaignantPseudo: plainte.plaignant_pseudo,
      prenom: plainte.plaignant_prenom,
      nom: plainte.plaignant_nom,
      tel1: plainte.plaignant_tel1,
      tel2: plainte.plaignant_tel2,
      email: plainte.plaignant_email,
      age: plainte.plaignant_age,
      sexe: plainte.plaignant_sexe,
      
      // Détails plainte
      titre: plainte.plainte_titre || "Plainte sans titre",
      description: plainte.plainte_description,
      typePlainteId: plainte.type_cible_id,
      typePlainteLibelle: plainte.type_cible_libelle, // À résoudre
      
      // Localisation
      localisation: {
        adresse: plainte.plainte_localise_adresse,
        ville: plainte.plainte_localise_ville,
        codePostal: plainte.plainte_localise_cp,
        latitude: parseFloat(plainte.plainte_localise_lat) || null,
        longitude: parseFloat(plainte.plainte_localise_long) || null,
        precision: 100
      },
      
      // Assignation nouvelle structure
      secteurId: plainte.secteur_id,
      secteurLibelle: plainte.secteur_libelle, // À résoudre
      structureId: nouveauBureauId,
      structureNom: "", // À résoudre
      cheminHierarchique: "", // À calculer
      
      // Statut et priorité
      statut: mapStatut(plainte.plainte_statut),
      priorite: "moyenne", // Valeur par défaut
      
      // Dates
      dateCreation: plainte.plainte_date_recu || new Date(),
      dateReception: plainte.plainte_date_recu || new Date(),
      dateTransfert: plainte.plainte_date_transfert,
      dateResolution: null,
      dateMiseAJour: new Date(),
      
      // Métadonnées
      source: "migration",
      canal: "ancien_systeme",
      reference: generateReference(),
      tags: extractTags(plainte.plainte_description),
      
      // Assignation
      assigneA: null,
      assignePar: null,
      dateAssignation: null,
      
      // Fichiers (à migrer séparément)
      fichiers: [],
      
      // Statistiques
      nombreVues: 0,
      nombreCommentaires: 0,
      scoreUrgence: 50,
      
      isActive: true
    };
    
    batch.set(docRef, firestoreData);
  }
  
  await batch.commit();
  console.log(`✅ ${sqlData.plaintes.length} plaintes migrées`);
};

// Fonctions utilitaires
const mapStatut = (sqlStatut) => {
  const mapping = {
    0: "en-attente",
    1: "en-traitement", 
    2: "resolue",
    3: "rejetee"
  };
  return mapping[sqlStatut] || "en-attente";
};

const generateReference = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `PLT-${year}-${random}`;
};
```

---

## 🔧 Outils de Migration

### Script Principal
```javascript
// scripts/migrate-all.js
import { migratePlaignants } from './migrate-plaignants.js';
import { migrateStructureToHierarchy } from './migrate-structure.js';
import { migratePlaintes } from './migrate-plaintes.js';
import { validateMigration } from './validate-migration.js';

export const migrateAll = async (sqlExportFile) => {
  console.log('🚀 Début de la migration SQL → Firestore');
  
  try {
    // 1. Charger les données SQL
    const sqlData = await loadSQLData(sqlExportFile);
    console.log('📊 Données SQL chargées:', {
      plaignants: sqlData.plaignants.length,
      structures: sqlData.structures.length,
      plaintes: sqlData.plaintes.length,
      commentaires: sqlData.commentaires.length
    });
    
    // 2. Migrer les plaignants
    await migratePlaignants(sqlData);
    
    // 3. Migrer la structure hiérarchique
    const structureMapping = await migrateStructureToHierarchy(sqlData);
    
    // 4. Migrer les secteurs et types
    await migrateSecteurs(sqlData);
    await migrateTypePlaintes(sqlData);
    
    // 5. Migrer les plaintes
    await migratePlaintes(sqlData, structureMapping);
    
    // 6. Migrer les commentaires
    await migrateCommentaires(sqlData);
    
    // 7. Migrer les fichiers
    await migrateFichiers(sqlData);
    
    // 8. Validation finale
    await validateMigration(sqlData);
    
    console.log('✅ Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
};
```

### Validation Post-Migration
```javascript
// scripts/validate-migration.js
export const validateMigration = async (originalData) => {
  console.log('🔍 Validation de la migration...');
  
  const validation = {
    plaignants: await validatePlaignants(originalData.plaignants),
    structures: await validateStructures(originalData.structures),
    plaintes: await validatePlaintes(originalData.plaintes),
    commentaires: await validateCommentaires(originalData.commentaires)
  };
  
  // Rapport de validation
  console.log('📊 Rapport de validation:', validation);
  
  const totalErrors = Object.values(validation)
    .reduce((sum, v) => sum + v.errors, 0);
  
  if (totalErrors === 0) {
    console.log('✅ Migration validée - Aucune erreur détectée');
  } else {
    console.warn(`⚠️ ${totalErrors} erreurs détectées lors de la validation`);
  }
  
  return validation;
};
```

---

## 📋 Checklist de Migration

### Pré-Migration
- [ ] **Backup** de la base SQL existante
- [ ] **Export** des données au format JSON
- [ ] **Configuration** Firebase avec vraies credentials
- [ ] **Test** de connexion Firestore
- [ ] **Préparation** des mappings de structure

### Migration
- [ ] **Plaignants** → Collection `plaignant`
- [ ] **Structure** → Hiérarchie `ministere/direction/service/bureau`
- [ ] **Secteurs** → Collection `secteur`
- [ ] **Types** → Collection `type_plainte`
- [ ] **Plaintes** → Collection `plainte` (avec dénormalisation)
- [ ] **Commentaires** → Collection `commentaire`
- [ ] **Fichiers** → Collection `fichier` + Storage

### Post-Migration
- [ ] **Validation** des données migrées
- [ ] **Création** des index composites
- [ ] **Configuration** des règles de sécurité
- [ ] **Test** des requêtes principales
- [ ] **Formation** des utilisateurs sur la nouvelle structure

### Optimisation
- [ ] **Index** pour les requêtes fréquentes
- [ ] **Dénormalisation** des données critiques
- [ ] **Cache** côté client
- [ ] **Monitoring** des performances

---

## 🚀 Commandes de Migration

```bash
# 1. Préparer l'environnement
cd backend
npm install

# 2. Exporter les données SQL
node scripts/export-sql-data.js > data/sql-export.json

# 3. Lancer la migration complète
node scripts/migrate-all.js data/sql-export.json

# 4. Valider la migration
node scripts/validate-migration.js

# 5. Créer les index
node scripts/create-indexes.js

# 6. Configurer les règles de sécurité
firebase deploy --only firestore:rules
```

---

*Guide de migration généré le 11 juin 2025 - Version 1.0* 