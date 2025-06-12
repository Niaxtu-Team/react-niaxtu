import { db } from '../config/firebase.js';

/**
 * 👤 Modèle Plaignant - Utilisateurs de base du système
 * Collection: plaignant
 * Basé sur la documentation DATABASE_SCHEMA_FIRESTORE.md
 */
class Plaignant {
  constructor(data = {}) {
    // Identifiants
    this.id = data.id || null;
    this.uid = data.uid || null; // Firebase Auth UID
    
    // Informations personnelles
    this.email = data.email || '';
    this.pseudo = data.pseudo || '';
    this.prenom = data.prenom || '';
    this.nom = data.nom || '';
    this.telephone = data.telephone || '';
    this.age = data.age || null;
    this.sexe = data.sexe || ''; // M|F|Autre
    this.avatar = data.avatar || '';
    
    // Adresse structurée
    this.adresse = {
      rue: data.adresse?.rue || '',
      ville: data.adresse?.ville || '',
      codePostal: data.adresse?.codePostal || '',
      pays: data.adresse?.pays || 'France'
    };
    
    // Localisation GPS
    this.localisation = {
      latitude: data.localisation?.latitude || null,
      longitude: data.localisation?.longitude || null,
      precision: data.localisation?.precision || 100
    };
    
    // Préférences utilisateur
    this.preferences = {
      notifications: data.preferences?.notifications ?? true,
      newsletter: data.preferences?.newsletter ?? false,
      langue: data.preferences?.langue || 'fr'
    };
    
    // Statistiques
    this.statistiques = {
      nombrePlaintes: data.statistiques?.nombrePlaintes || 0,
      dernierePlainte: data.statistiques?.dernierePlainte || null,
      scoreReputation: data.statistiques?.scoreReputation || 50
    };
    
    // Métadonnées
    this.isActif = data.isActif ?? true;
    this.isVerifie = data.isVerifie ?? false;
    this.dateInscription = data.dateInscription || new Date();
    this.dernierConnexion = data.dernierConnexion || null;
    this.dateMiseAJour = data.dateMiseAJour || new Date();
  }

  /**
   * Valider les données du plaignant
   */
  validate() {
    const errors = [];
    
    // Validations obligatoires
    if (!this.email || !this.email.includes('@')) {
      errors.push('Email valide requis');
    }
    
    if (!this.pseudo || this.pseudo.length < 3) {
      errors.push('Pseudo requis (minimum 3 caractères)');
    }
    
    if (!this.prenom || this.prenom.length < 2) {
      errors.push('Prénom requis (minimum 2 caractères)');
    }
    
    if (!this.nom || this.nom.length < 2) {
      errors.push('Nom requis (minimum 2 caractères)');
    }
    
    if (this.age && (this.age < 13 || this.age > 120)) {
      errors.push('Âge doit être entre 13 et 120 ans');
    }
    
    if (this.sexe && !['M', 'F', 'Autre'].includes(this.sexe)) {
      errors.push('Sexe doit être M, F ou Autre');
    }
    
    // Validation téléphone français
    if (this.telephone && !this.telephone.match(/^(\+33|0)[1-9](\d{8})$/)) {
      errors.push('Format téléphone invalide (format français attendu)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convertir en objet pour Firestore
   */
  toFirestore() {
    const validation = this.validate();
    if (!validation.isValid) {
      throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
    }
    
    return {
      uid: this.uid,
      email: this.email,
      pseudo: this.pseudo,
      prenom: this.prenom,
      nom: this.nom,
      telephone: this.telephone,
      age: this.age,
      sexe: this.sexe,
      avatar: this.avatar,
      adresse: this.adresse,
      localisation: this.localisation,
      preferences: this.preferences,
      statistiques: this.statistiques,
      isActif: this.isActif,
      isVerifie: this.isVerifie,
      dateInscription: this.dateInscription,
      dernierConnexion: this.dernierConnexion,
      dateMiseAJour: new Date()
    };
  }

  /**
   * Créer un plaignant depuis les données Firestore
   */
  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    const plaignant = new Plaignant(data);
    plaignant.id = doc.id;
    
    return plaignant;
  }

  /**
   * Sauvegarder le plaignant
   */
  async save() {
    const collection = db.collection('plaignant');
    
    if (this.id) {
      // Mise à jour
      await collection.doc(this.id).update(this.toFirestore());
    } else {
      // Création
      const docRef = await collection.add(this.toFirestore());
      this.id = docRef.id;
    }
    
    return this;
  }

  /**
   * Trouver un plaignant par ID
   */
  static async findById(id) {
    const doc = await db.collection('plaignant').doc(id).get();
    return this.fromFirestore(doc);
  }

  /**
   * Trouver un plaignant par UID Firebase
   */
  static async findByUid(uid) {
    const snapshot = await db.collection('plaignant')
      .where('uid', '==', uid)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    return this.fromFirestore(snapshot.docs[0]);
  }

  /**
   * Trouver un plaignant par email
   */
  static async findByEmail(email) {
    const snapshot = await db.collection('plaignant')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    return this.fromFirestore(snapshot.docs[0]);
  }

  /**
   * Lister les plaignants avec pagination
   */
  static async list(options = {}) {
    const {
      limit = 20,
      startAfter = null,
      orderBy = 'dateInscription',
      orderDirection = 'desc',
      isActif = true
    } = options;
    
    let query = db.collection('plaignant')
      .where('isActif', '==', isActif)
      .orderBy(orderBy, orderDirection)
      .limit(limit);
    
    if (startAfter) {
      query = query.startAfter(startAfter);
    }
    
    const snapshot = await query.get();
    
    return {
      plaignants: snapshot.docs.map(doc => this.fromFirestore(doc)),
      hasMore: snapshot.docs.length === limit,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
    };
  }

  /**
   * Mettre à jour les statistiques du plaignant
   */
  async updateStatistiques(stats) {
    if (!this.id) throw new Error('Plaignant doit être sauvegardé avant mise à jour');
    
    this.statistiques = { ...this.statistiques, ...stats };
    this.dateMiseAJour = new Date();
    
    await db.collection('plaignant').doc(this.id).update({
      statistiques: this.statistiques,
      dateMiseAJour: this.dateMiseAJour
    });
    
    return this;
  }

  /**
   * Marquer la dernière connexion
   */
  async updateDerniereConnexion() {
    if (!this.id) return;
    
    this.dernierConnexion = new Date();
    
    await db.collection('plaignant').doc(this.id).update({
      dernierConnexion: this.dernierConnexion
    });
    
    return this;
  }

  /**
   * Désactiver le plaignant
   */
  async desactiver() {
    if (!this.id) throw new Error('Plaignant doit être sauvegardé avant désactivation');
    
    this.isActif = false;
    this.dateMiseAJour = new Date();
    
    await db.collection('plaignant').doc(this.id).update({
      isActif: false,
      dateMiseAJour: this.dateMiseAJour
    });
    
    return this;
  }
}

export default Plaignant; 