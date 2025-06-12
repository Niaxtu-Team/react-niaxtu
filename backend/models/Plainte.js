import { db } from '../config/firebase.js';

/**
 * 📝 Modèle Plainte - Système de plaintes avec géolocalisation
 * Collection: plainte
 * Basé sur la documentation DATABASE_SCHEMA_FIRESTORE.md
 */
class Plainte {
  constructor(data = {}) {
    // Identifiants
    this.id = data.id || null;
    
    // Informations plaignant (dénormalisées pour performance)
    this.plaignantId = data.plaignantId || '';
    this.plaignantPseudo = data.plaignantPseudo || '';
    this.prenom = data.prenom || '';
    this.nom = data.nom || '';
    this.tel1 = data.tel1 || '';
    this.tel2 = data.tel2 || null;
    this.email = data.email || '';
    this.age = data.age || null;
    this.sexe = data.sexe || '';
    
    // Détails de la plainte
    this.titre = data.titre || '';
    this.description = data.description || '';
    this.typePlainteId = data.typePlainteId || '';
    this.typePlainteLibelle = data.typePlainteLibelle || '';
    
    // Localisation
    this.localisation = {
      adresse: data.localisation?.adresse || '',
      ville: data.localisation?.ville || '',
      codePostal: data.localisation?.codePostal || '',
      latitude: data.localisation?.latitude || null,
      longitude: data.localisation?.longitude || null,
      precision: data.localisation?.precision || 100
    };
    
    // Assignation structure
    this.secteurId = data.secteurId || '';
    this.secteurLibelle = data.secteurLibelle || '';
    this.structureId = data.structureId || ''; // Bureau assigné
    this.structureNom = data.structureNom || '';
    this.cheminHierarchique = data.cheminHierarchique || '';
    
    // Statut et priorité
    this.statut = data.statut || 'en-attente'; // en-attente|en-traitement|resolue|rejetee
    this.priorite = data.priorite || 'moyenne'; // faible|moyenne|elevee|urgente
    
    // Dates importantes
    this.dateCreation = data.dateCreation || new Date();
    this.dateReception = data.dateReception || new Date();
    this.dateTransfert = data.dateTransfert || null;
    this.dateResolution = data.dateResolution || null;
    this.dateMiseAJour = data.dateMiseAJour || new Date();
    
    // Métadonnées
    this.source = data.source || 'web'; // web|mobile|telephone|courrier
    this.canal = data.canal || 'plateforme';
    this.reference = data.reference || this.generateReference();
    this.tags = data.tags || [];
    
    // Assignation
    this.assigneA = data.assigneA || null; // ID admin assigné
    this.assignePar = data.assignePar || null;
    this.dateAssignation = data.dateAssignation || null;
    
    // Fichiers joints
    this.fichiers = data.fichiers || [];
    
    // Statistiques
    this.nombreVues = data.nombreVues || 0;
    this.nombreCommentaires = data.nombreCommentaires || 0;
    this.scoreUrgence = data.scoreUrgence || 50;
    
    this.isActive = data.isActive ?? true;
  }

  /**
   * Générer une référence unique pour la plainte
   */
  generateReference() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `PLT-${year}-${random}`;
  }

  /**
   * Valider les données de la plainte
   */
  validate() {
    const errors = [];
    
    // Validations obligatoires
    if (!this.plaignantId) {
      errors.push('ID du plaignant requis');
    }
    
    if (!this.titre || this.titre.length < 5) {
      errors.push('Titre requis (minimum 5 caractères)');
    }
    
    if (!this.description || this.description.length < 10) {
      errors.push('Description requise (minimum 10 caractères)');
    }
    
    if (!this.typePlainteId) {
      errors.push('Type de plainte requis');
    }
    
    // Validation localisation
    if (!this.localisation.adresse && !this.localisation.latitude) {
      errors.push('Adresse ou coordonnées GPS requises');
    }
    
    // Validation statut
    const statutsValides = ['en-attente', 'en-traitement', 'resolue', 'rejetee'];
    if (!statutsValides.includes(this.statut)) {
      errors.push('Statut invalide');
    }
    
    // Validation priorité
    const prioritesValides = ['faible', 'moyenne', 'elevee', 'urgente'];
    if (!prioritesValides.includes(this.priorite)) {
      errors.push('Priorité invalide');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Extraire les tags automatiquement depuis la description
   */
  extractTags() {
    const motsCles = [
      'urgence', 'urgent', 'danger', 'dangereux',
      'infrastructure', 'route', 'voirie', 'trottoir',
      'éclairage', 'lumière', 'lampadaire',
      'transport', 'bus', 'métro', 'circulation',
      'sécurité', 'police', 'vol', 'agression',
      'environnement', 'pollution', 'bruit', 'déchets',
      'eau', 'fuite', 'canalisation', 'égout'
    ];
    
    const description = this.description.toLowerCase();
    const tagsDetectes = motsCles.filter(mot => 
      description.includes(mot.toLowerCase())
    );
    
    // Ajouter les tags détectés sans doublons
    this.tags = [...new Set([...this.tags, ...tagsDetectes])];
    
    return this.tags;
  }

  /**
   * Calculer le score d'urgence automatiquement
   */
  calculateScoreUrgence() {
    let score = 50; // Score de base
    
    // Facteurs d'urgence
    const facteurs = {
      'urgent': 30,
      'urgence': 30,
      'danger': 25,
      'dangereux': 25,
      'grave': 20,
      'important': 15,
      'sécurité': 15,
      'accident': 20,
      'blessé': 25,
      'fuite': 15,
      'panne': 10
    };
    
    const description = this.description.toLowerCase();
    
    Object.entries(facteurs).forEach(([mot, points]) => {
      if (description.includes(mot)) {
        score += points;
      }
    });
    
    // Facteur priorité
    const prioriteFacteur = {
      'faible': -10,
      'moyenne': 0,
      'elevee': 15,
      'urgente': 30
    };
    
    score += prioriteFacteur[this.priorite] || 0;
    
    // Limiter entre 0 et 100
    this.scoreUrgence = Math.max(0, Math.min(100, score));
    
    return this.scoreUrgence;
  }

  /**
   * Convertir en objet pour Firestore
   */
  toFirestore() {
    const validation = this.validate();
    if (!validation.isValid) {
      throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
    }
    
    // Extraire les tags et calculer le score d'urgence
    this.extractTags();
    this.calculateScoreUrgence();
    
    return {
      plaignantId: this.plaignantId,
      plaignantPseudo: this.plaignantPseudo,
      prenom: this.prenom,
      nom: this.nom,
      tel1: this.tel1,
      tel2: this.tel2,
      email: this.email,
      age: this.age,
      sexe: this.sexe,
      titre: this.titre,
      description: this.description,
      typePlainteId: this.typePlainteId,
      typePlainteLibelle: this.typePlainteLibelle,
      localisation: this.localisation,
      secteurId: this.secteurId,
      secteurLibelle: this.secteurLibelle,
      structureId: this.structureId,
      structureNom: this.structureNom,
      cheminHierarchique: this.cheminHierarchique,
      statut: this.statut,
      priorite: this.priorite,
      dateCreation: this.dateCreation,
      dateReception: this.dateReception,
      dateTransfert: this.dateTransfert,
      dateResolution: this.dateResolution,
      dateMiseAJour: new Date(),
      source: this.source,
      canal: this.canal,
      reference: this.reference,
      tags: this.tags,
      assigneA: this.assigneA,
      assignePar: this.assignePar,
      dateAssignation: this.dateAssignation,
      fichiers: this.fichiers,
      nombreVues: this.nombreVues,
      nombreCommentaires: this.nombreCommentaires,
      scoreUrgence: this.scoreUrgence,
      isActive: this.isActive
    };
  }

  /**
   * Créer une plainte depuis les données Firestore
   */
  static fromFirestore(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();
    const plainte = new Plainte(data);
    plainte.id = doc.id;
    
    return plainte;
  }

  /**
   * Sauvegarder la plainte
   */
  async save() {
    const collection = db.collection('plainte');
    
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
   * Trouver une plainte par ID
   */
  static async findById(id) {
    const doc = await db.collection('plainte').doc(id).get();
    return this.fromFirestore(doc);
  }

  /**
   * Lister les plaintes avec filtres et pagination
   */
  static async list(options = {}) {
    const {
      limit = 20,
      startAfter = null,
      orderBy = 'dateCreation',
      orderDirection = 'desc',
      statut = null,
      secteurId = null,
      structureId = null,
      plaignantId = null,
      priorite = null,
      isActive = true
    } = options;
    
    let query = db.collection('plainte')
      .where('isActive', '==', isActive);
    
    // Filtres optionnels
    if (statut) query = query.where('statut', '==', statut);
    if (secteurId) query = query.where('secteurId', '==', secteurId);
    if (structureId) query = query.where('structureId', '==', structureId);
    if (plaignantId) query = query.where('plaignantId', '==', plaignantId);
    if (priorite) query = query.where('priorite', '==', priorite);
    
    // Tri et pagination
    query = query.orderBy(orderBy, orderDirection).limit(limit);
    
    if (startAfter) {
      query = query.startAfter(startAfter);
    }
    
    const snapshot = await query.get();
    
    return {
      plaintes: snapshot.docs.map(doc => this.fromFirestore(doc)),
      hasMore: snapshot.docs.length === limit,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
    };
  }

  /**
   * Rechercher les plaintes par mots-clés
   */
  static async search(keywords, options = {}) {
    const { limit = 20 } = options;
    
    // Recherche dans les tags
    const snapshot = await db.collection('plainte')
      .where('tags', 'array-contains-any', keywords.split(' '))
      .where('isActive', '==', true)
      .orderBy('scoreUrgence', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => this.fromFirestore(doc));
  }

  /**
   * Assigner la plainte à un administrateur
   */
  async assigner(adminId, assignePar) {
    if (!this.id) throw new Error('Plainte doit être sauvegardée avant assignation');
    
    this.assigneA = adminId;
    this.assignePar = assignePar;
    this.dateAssignation = new Date();
    this.statut = 'en-traitement';
    this.dateMiseAJour = new Date();
    
    await db.collection('plainte').doc(this.id).update({
      assigneA: this.assigneA,
      assignePar: this.assignePar,
      dateAssignation: this.dateAssignation,
      statut: this.statut,
      dateMiseAJour: this.dateMiseAJour
    });
    
    return this;
  }

  /**
   * Changer le statut de la plainte
   */
  async changerStatut(nouveauStatut, resolutionNote = null) {
    if (!this.id) throw new Error('Plainte doit être sauvegardée avant changement de statut');
    
    const statutsValides = ['en-attente', 'en-traitement', 'resolue', 'rejetee'];
    if (!statutsValides.includes(nouveauStatut)) {
      throw new Error('Statut invalide');
    }
    
    this.statut = nouveauStatut;
    this.dateMiseAJour = new Date();
    
    if (nouveauStatut === 'resolue' || nouveauStatut === 'rejetee') {
      this.dateResolution = new Date();
    }
    
    const updateData = {
      statut: this.statut,
      dateMiseAJour: this.dateMiseAJour
    };
    
    if (this.dateResolution) {
      updateData.dateResolution = this.dateResolution;
    }
    
    if (resolutionNote) {
      updateData.resolutionNote = resolutionNote;
    }
    
    await db.collection('plainte').doc(this.id).update(updateData);
    
    return this;
  }

  /**
   * Ajouter un fichier joint
   */
  async ajouterFichier(fichierData) {
    if (!this.id) throw new Error('Plainte doit être sauvegardée avant ajout de fichier');
    
    this.fichiers.push({
      id: fichierData.id,
      nom: fichierData.nom,
      url: fichierData.url,
      type: fichierData.type,
      taille: fichierData.taille,
      dateUpload: new Date()
    });
    
    await db.collection('plainte').doc(this.id).update({
      fichiers: this.fichiers,
      dateMiseAJour: new Date()
    });
    
    return this;
  }

  /**
   * Incrémenter le nombre de vues
   */
  async incrementerVues() {
    if (!this.id) return;
    
    this.nombreVues += 1;
    
    await db.collection('plainte').doc(this.id).update({
      nombreVues: this.nombreVues
    });
    
    return this;
  }

  /**
   * Statistiques des plaintes
   */
  static async getStatistiques(options = {}) {
    const { secteurId = null, structureId = null } = options;
    
    let query = db.collection('plainte').where('isActive', '==', true);
    
    if (secteurId) query = query.where('secteurId', '==', secteurId);
    if (structureId) query = query.where('structureId', '==', structureId);
    
    const snapshot = await query.get();
    const plaintes = snapshot.docs.map(doc => doc.data());
    
    const stats = {
      total: plaintes.length,
      parStatut: {},
      parPriorite: {},
      parSecteur: {},
      scoreUrgenceMoyen: 0
    };
    
    plaintes.forEach(plainte => {
      // Par statut
      stats.parStatut[plainte.statut] = (stats.parStatut[plainte.statut] || 0) + 1;
      
      // Par priorité
      stats.parPriorite[plainte.priorite] = (stats.parPriorite[plainte.priorite] || 0) + 1;
      
      // Par secteur
      stats.parSecteur[plainte.secteurLibelle] = (stats.parSecteur[plainte.secteurLibelle] || 0) + 1;
      
      // Score d'urgence
      stats.scoreUrgenceMoyen += plainte.scoreUrgence || 0;
    });
    
    if (stats.total > 0) {
      stats.scoreUrgenceMoyen = Math.round(stats.scoreUrgenceMoyen / stats.total);
    }
    
    return stats;
  }
}

export default Plainte; 