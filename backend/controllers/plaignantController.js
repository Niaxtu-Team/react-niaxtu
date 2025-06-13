import Plaignant from '../models/Plaignant.js';
import { auth, db } from '../config/firebase.js';
import admin from 'firebase-admin';

/**
 * 👤 Contrôleur Plaignant - Gestion des utilisateurs de base
 * Récupération des plaignants depuis la collection Firebase "users"
 * STRUCTURE ALIGNÉE AVEC L'APPLICATION MOBILE
 */

/**
 * Obtenir un plaignant par ID
 */
export const obtenirPlaignant = async (req, res) => {
  try {
    const { phone } = req.params;
    const userDoc = await db.collection('users').doc(phone).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    const userData = userDoc.data();
    
    const dataPlaignant = {
      id: userDoc.id,
      uid: userData.uid,
      pseudo: userData.pseudo,
      prenom: userData.prenom,
      nom: userData.nom,
      age: userData.age,
      sexe: userData.sexe,
      avatar: userData.avatar,
      adresse: userData.adresse,
      localisation: userData.localisation,
      preferences: userData.preferences,
      statistiques: userData.statistiques,
      statut: userData.statut || 'actif',
      raisonStatut: userData.raisonStatut,
      dateFinSuspension: userData.dateFinSuspension,
      historique: userData.historique || [],
      security: userData.security || { tentativesConnexionEchouees: 0, compteBloque: false },
      verification: userData.verification || { emailVerifie: false, telephoneVerifie: false },
      deviceInfo: userData.deviceInfo,
      isActif: userData.isActif !== undefined ? userData.isActif : (userData.statut === 'actif'),
      isVerifie: userData.isVerifie || false,
      dateInscription: userData.dateInscription,
      dateActivation: userData.dateActivation
    };

    res.json({ success: true, data: dataPlaignant });
  } catch (error) {
    console.error('Erreur obtention plaignant:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du plaignant' });
  }
};

/**
 * Lister les plaignants avec pagination
 */
export const listerPlaignants = async (req, res) => {
  try {
    console.log('Début de listerPlaignants');
    const {
      page = 1,
      limit = 20,
      orderBy = 'createdAt',
      orderDirection = 'desc',
      isActif,
      search = ''
    } = req.query;

    console.log('Paramètres reçus:', { page, limit, orderBy, orderDirection, isActif, search });

    // Construction de la requête de base
    let query = db.collection('users');

    // Ajout des filtres si spécifiés
    if (isActif === 'true') {
      query = query.where('statut', '==', 'actif');
    } else if (isActif === 'false') {
      query = query.where('statut', '==', 'inactif');
    }

    // Ajout de l'ordre et de la pagination
    query = query
      .orderBy(orderBy, orderDirection === 'asc' ? 'asc' : 'desc')
      .offset((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Récupération du total
    const totalSnapshot = await query.count().get();
    const total = totalSnapshot.data().count;
    console.log('Nombre total de documents:', total);

    if (total === 0) {
      console.log('Aucun document trouvé');
      return res.json({
        success: true,
        data: {
          plaignants: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            hasMore: false
          },
          filtres: {
            isActif: isActif === 'true' ? true : isActif === 'false' ? false : null,
            search: search || null,
            orderBy,
            orderDirection
          }
        }
      });
    }

    // Récupération des données
    const snapshot = await query.get();
    console.log('Nombre de documents récupérés:', snapshot.size);

    const plaignants = [];

    // Conversion des documents en objets
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('Traitement du document avec phone:', doc.id, 'createdAt:', data.createdAt);
      
      plaignants.push({
        id: doc.id,
        phone: doc.id,
        pseudo: data.pseudo || '',
        prenom: data.prenom || '',
        nom: data.nom || '',
        email: data.email || '',
        otp: data.otp,
        password: data.password,
        statut: data.statut || 'actif',
        raisonStatut: data.raisonStatut,
        isActif: data.statut === 'actif',
        createdAt: data.createdAt,
        dateActivation: data.dateActivation,
        dateDesactivation: data.dateDesactivation,
        dateFinSuspension: data.dateFinSuspension,
        dateMiseAJour: data.dateMiseAJour,
        dernierConnexion: data.dernierConnexion,
        updatedAt: data.updatedAt,
        historique: data.historique || []
      });
    });

    // Filtrage par recherche si spécifié
    let plaignantsFiltres = plaignants;
    if (search && search.length >= 2) {
      console.log('Application du filtre de recherche:', search);
      const searchLower = search.toLowerCase();
      plaignantsFiltres = plaignants.filter(p => 
        p.pseudo?.toLowerCase().includes(searchLower) ||
        p.prenom?.toLowerCase().includes(searchLower) ||
        p.nom?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        p.phone?.includes(searchLower)
      );
    }

    console.log('Nombre de plaignants après filtrage:', plaignantsFiltres.length);

    // Calcul de hasMore
    const hasMore = (parseInt(page) - 1) * parseInt(limit) + plaignantsFiltres.length < total;
    console.log('Calcul hasMore:', { 
      page: parseInt(page), 
      limit: parseInt(limit), 
      plaignantsLength: plaignantsFiltres.length, 
      total, 
      hasMore 
    });

    const response = {
      success: true,
      data: {
        plaignants: plaignantsFiltres,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          hasMore
        },
        filtres: {
          isActif: isActif === 'true' ? true : isActif === 'false' ? false : null,
          search: search || null,
          orderBy,
          orderDirection
        }
      }
    };

    console.log('Réponse envoyée avec succès');
    res.json(response);

  } catch (error) {
    console.error('Erreur dans listerPlaignants:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plaignants',
      error: error.message
    });
  }
};

/**
 * Mettre à jour un plaignant (STRUCTURE MOBILE + CONTRÔLES ADMIN)
 */
export const mettreAJourPlaignant = async (req, res) => {
  try {
    const { phone } = req.params;
    const updates = req.body;
    const userDoc = await db.collection('users').doc(phone).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'Plaignant non trouvé' });
    }
    const userData = userDoc.data();
    if (userData.role && userData.role !== 'plaignant') {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    if (req.user?.uid !== userData.uid && !['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Permission refusée' });
    }
    const champsModifiables = [ 'pseudo', 'prenom', 'nom', 'phone', 'age', 'sexe', 'avatar', 'adresse', 'localisation', 'preferences' ];
    const champsControleAdmin = [ 'statut', 'raisonStatut', 'dateFinSuspension', 'security', 'verification' ];
    const updateData = {};
    champsModifiables.forEach(champ => { if (updates[champ] !== undefined) { updateData[champ] = updates[champ]; } });
    if (['admin', 'super_admin'].includes(req.user?.role)) {
      champsControleAdmin.forEach(champ => { if (updates[champ] !== undefined) { updateData[champ] = updates[champ]; } });
      if (updates.statut !== undefined) { updateData.isActif = updates.statut === 'actif'; }
      else if (updates.isActif !== undefined) { updateData.statut = updates.isActif ? 'actif' : 'inactif'; }
    }
    updateData.dateMiseAJour = new Date();
    await db.collection('users').doc(phone).update(updateData);
    res.json({ success: true, message: 'Plaignant mis à jour avec succès', data: { phone: phone, pseudo: updateData.pseudo || userData.pseudo, prenom: updateData.prenom || userData.prenom, nom: updateData.nom || userData.nom, statut: updateData.statut || userData.statut, dateMiseAJour: updateData.dateMiseAJour } });
  } catch (error) {
    console.error('Erreur mise à jour plaignant:', error);
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la mise à jour' });
  }
};

/**
 * Désactiver un plaignant (Admin seulement) - COHÉRENCE MOBILE
 */
export const desactiverPlaignant = async (req, res) => {
  try {
    const { phone } = req.params;
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Permission refusée - Admin requis' });
    }
    const userDoc = await db.collection('users').doc(phone).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'Plaignant non trouvé' });
    }
    const userData = userDoc.data();
    if (userData.role && userData.role !== 'plaignant') {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    const updateData = {
      statut: 'inactif',
      isActif: false,
      raisonStatut: 'Désactivation par administrateur',
      dateDesactivation: new Date(),
      dateMiseAJour: new Date()
    };
    const nouvelHistorique = {
      statut: 'inactif',
      raison: 'Désactivation par administrateur',
      date: new Date(),
      adminId: req.user.uid,
      adminNom: req.user.displayName || req.user.email
    };
    updateData.historique = admin.firestore.FieldValue.arrayUnion(nouvelHistorique);
    await db.collection('users').doc(phone).update(updateData);
    res.json({ success: true, message: 'Plaignant désactivé avec succès' });
  } catch (error) {
    console.error('Erreur désactivation plaignant:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la désactivation' });
  }
};

/**
 * Obtenir les statistiques d'un plaignant
 */
export const obtenirStatistiquesPlaignant = async (req, res) => {
  try {
    const { phone } = req.params;
    const userDoc = await db.collection('users').doc(phone).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'Plaignant non trouvé' });
    }
    const userData = userDoc.data();
    if (userData.role && userData.role !== 'plaignant') {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, data: { statistiques: userData.statistiques, informationsGenerales: { dateInscription: userData.dateInscription, dernierConnexion: userData.dernierConnexion, isVerifie: userData.isVerifie, isActif: userData.isActif } } });
  } catch (error) {
    console.error('Erreur statistiques plaignant:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques' });
  }
};

/**
 * Marquer la connexion d'un plaignant
 */
export const marquerConnexion = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone Firebase requis'
      });
    }

    // Rechercher l'utilisateur par phone dans collection users (mobile)
    const snapshot = await db.collection('users').where('phone', '==', phone).get();
    
    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Plaignant non trouvé'
      });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Vérifier que c'est bien un plaignant
    if (userData.role && userData.role !== 'plaignant') {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const dernierConnexion = new Date();
    
    // Mettre à jour avec la même structure que le mobile
    await userDoc.ref.update({ 
      dernierConnexion,
      dateMiseAJour: new Date()
    });

    res.json({
      success: true,
      message: 'Connexion enregistrée',
      data: {
        dernierConnexion
      }
    });

  } catch (error) {
    console.error('Erreur marquage connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de la connexion'
    });
  }
};

/**
 * Rechercher des plaignants
 */
export const rechercherPlaignants = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Terme de recherche requis (minimum 2 caractères)'
      });
    }

    // Seuls les admins peuvent rechercher
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission refusée - Admin requis'
      });
    }

    // Récupérer les plaignants actifs depuis Firebase
    const snapshot = await db.collection('users')
      .where('statut', '==', 'actif')
      .limit(parseInt(limit) * 2)
      .get();

    let plaignants = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      plaignants.push({
        phone: data.phone,
        ...data,
        // Assurer cohérence
        statut: data.statut || (data.isActif ? 'actif' : 'inactif')
      });
    });

    const searchTerm = q.toLowerCase();
    const plaignantsFiltrés = plaignants.filter(p => 
      p.pseudo?.toLowerCase().includes(searchTerm) ||
      p.prenom?.toLowerCase().includes(searchTerm) ||
      p.nom?.toLowerCase().includes(searchTerm) ||
      p.email?.toLowerCase().includes(searchTerm)
    ).slice(0, parseInt(limit));

    const resultats = plaignantsFiltrés.map(p => ({
      phone: p.phone,
      uid: p.uid,
      pseudo: p.pseudo,
      prenom: p.prenom,
      nom: p.nom,
      email: p.email,
      avatar: p.avatar,
      statistiques: p.statistiques,
      statut: p.statut,
      dateInscription: p.dateInscription
    }));

    res.json({
      success: true,
      data: {
        resultats,
        total: resultats.length,
        terme: q
      }
    });

  } catch (error) {
    console.error('Erreur recherche plaignants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche'
    });
  }
};

/**
 * Vérifier un plaignant (admin seulement)
 */
export const verifierPlaignant = async (req, res) => {
  try {
    const { phone } = req.params;
    const { isVerifie } = req.body;
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Permission refusée - Admin requis' });
    }
    const userDoc = await db.collection('users').doc(phone).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'Plaignant non trouvé' });
    }
    const userData = userDoc.data();
    if (userData.role && userData.role !== 'plaignant') {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    await db.collection('users').doc(phone).update({ isVerifie, dateMiseAJour: new Date() });
    res.json({ success: true, message: `Plaignant ${isVerifie ? 'vérifié' : 'non vérifié'} avec succès`, data: { phone: phone, isVerifie: isVerifie } });
  } catch (error) {
    console.error('Erreur vérification plaignant:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la vérification' });
  }
};

/**
 * Activer un compte plaignant
 */
export const activerPlaignant = async (req, res) => {
  try {
    const { phone } = req.params;
    const userDoc = await db.collection('users').doc(phone).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    const userData = userDoc.data();
    if (userData.role && userData.role !== 'plaignant') {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    await db.collection('users').doc(phone).update({
      statut: 'actif',
      isActif: true,
      dateActivation: new Date().toISOString(),
      historique: admin.firestore.FieldValue.arrayUnion({
        statut: 'actif',
        date: new Date().toISOString(),
        adminId: req.user?.uid,
        adminNom: req.user?.nom,
        raison: req.body.raison || 'Activation du compte'
      })
    });
    res.json({ success: true, message: 'Compte plaignant activé avec succès' });
  } catch (error) {
    console.error('Erreur activation plaignant:', error);
    res.status(500).json({ success: false, message: "Erreur lors de l'activation du compte plaignant" });
  }
};

/**
 * Créer un nouveau compte plaignant
 */
export const creerPlaignant = async (req, res) => {
  try {
    const {
      email,
      password,
      pseudo,
      prenom,
      nom,
      telephone,
      age,
      sexe,
      adresse
    } = req.body;

    // Vérifier que les champs requis sont présents
    if (!email || !password || !pseudo || !prenom || !nom || !telephone) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir tous les champs requis'
      });
    }

    // Formater le numéro de téléphone
    const phone = telephone.startsWith('+') ? telephone : `+221${telephone}`;

    // Vérifier si un utilisateur existe déjà avec ce numéro
    const existingUser = await db.collection('users').doc(phone).get();
    if (existingUser.exists) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur existe déjà avec ce numéro de téléphone'
      });
    }

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${prenom} ${nom}`,
      phoneNumber: phone,
      disabled: false
    });

    // Créer le document utilisateur dans Firestore avec le phone comme ID
    await db.collection('users').doc(phone).set({
      uid: userRecord.uid,
      phone, // Ajouter le phone dans les données
      email,
      pseudo,
      prenom,
      nom,
      age,
      sexe,
      adresse,
      role: 'plaignant',
      dateInscription: new Date().toISOString(),
      statut: 'en_attente',
      isActif: false,
      verification: {
        emailVerifie: false,
        telephoneVerifie: false
      },
      statistiques: {
        nombrePlaintes: 0,
        scoreReputation: 50,
        niveauConfiance: 'nouveau'
      },
      preferences: {
        notifications: true,
        newsletter: false,
        langue: 'fr',
        themeSombre: false
      },
      historique: [{
        statut: 'en_attente',
        date: new Date().toISOString(),
        raison: 'Création du compte'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Compte plaignant créé avec succès',
      data: {
        phone,
        uid: userRecord.uid,
        email: userRecord.email,
        pseudo
      }
    });

  } catch (error) {
    console.error('Erreur création plaignant:', error);
    
    // Gérer les erreurs spécifiques de Firebase Auth
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée'
      });
    }
    
    if (error.code === 'auth/invalid-phone-number') {
      return res.status(400).json({
        success: false,
        message: 'Le numéro de téléphone est invalide'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte plaignant'
    });
  }
};

/**
 * Obtenir l'historique des changements de statut d'un plaignant
 */
export const obtenirHistoriqueStatuts = async (req, res) => {
  try {
    const { phone } = req.params;
    const userDoc = await db.collection('users').doc(phone).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    const userData = userDoc.data();
    if (userData.role && userData.role !== 'plaignant') {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    const historique = userData.historique || [];
    historique.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, data: historique });
  } catch (error) {
    console.error('Erreur obtention historique statuts:', error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération de l'historique des statuts" });
  }
};

/**
 * Suspendre temporairement un plaignant (Admin seulement)
 */
export const suspendrePlaignant = async (req, res) => {
  try {
    const { phone } = req.params;
    const { raison, duree } = req.body;
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Permission refusée - Admin requis' });
    }
    const userDoc = await db.collection('users').doc(phone).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'Plaignant non trouvé' });
    }
    const userData = userDoc.data();
    if (userData.role && userData.role !== 'plaignant') {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    let dateFinSuspension = null;
    if (duree && Number(duree) > 0) {
      const now = new Date();
      dateFinSuspension = new Date(now.getTime() + Number(duree) * 24 * 60 * 60 * 1000);
    }
    const updateData = {
      statut: 'suspendu',
      isActif: false,
      raisonStatut: raison || 'Suspension administrative',
      dateFinSuspension: dateFinSuspension,
      dateMiseAJour: new Date(),
      historique: admin.firestore.FieldValue.arrayUnion({
        statut: 'suspendu',
        raison: raison || 'Suspension administrative',
        date: new Date(),
        adminId: req.user.uid,
        adminNom: req.user.displayName || req.user.email
      })
    };
    await db.collection('users').doc(phone).update(updateData);
    res.json({ success: true, message: 'Plaignant suspendu avec succès', data: { phone, statut: 'suspendu', raisonStatut: raison || 'Suspension administrative', dateFinSuspension } });
  } catch (error) {
    console.error('Erreur suspension plaignant:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suspension du plaignant' });
  }
};

/**
 * Récupérer tous les plaignants
 */
export const getAllPlaignants = async (req, res) => {
  try {
    console.log('Début de getAllPlaignants');

    // Récupération de tous les plaignants
    const snapshot = await db.collection('users').get();
    console.log('Nombre de documents trouvés:', snapshot.size);

    if (snapshot.empty) {
      console.log('Collection users vide');
      return res.json({
        success: true,
        data: [],
        total: 0
      });
    }

    const plaignants = [];

    // Conversion des documents en objets
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('Traitement du document avec phone:', doc.id);
      
      plaignants.push({
        id: doc.id, // Le phone est l'ID du document
        phone: doc.id,
        pseudo: data.pseudo,
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        age: data.age,
        sexe: data.sexe,
        avatar: data.avatar,
        adresse: data.adresse,
        statistiques: data.statistiques || {
          nombrePlaintes: 0,
          scoreReputation: 50,
          niveauConfiance: 'nouveau'
        },
        statut: data.statut || 'actif',
        isActif: data.statut === 'actif',
        isVerifie: data.isVerifie || false,
        dateInscription: data.dateInscription,
        dateActivation: data.dateActivation,
        dernierConnexion: data.dernierConnexion
      });
    });

    console.log('Nombre total de plaignants formatés:', plaignants.length);

    res.json({
      success: true,
      data: plaignants,
      total: plaignants.length
    });

  } catch (error) {
    console.error('Erreur dans getAllPlaignants:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plaignants',
      error: error.message
    });
  }
}; 