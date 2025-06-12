import Plaignant from '../models/Plaignant.js';
import { auth } from '../config/firebase.js';

/**
 * 👤 Contrôleur Plaignant - Gestion des utilisateurs de base
 * Basé sur la documentation DATABASE_SCHEMA_FIRESTORE.md
 */

/**
 * Créer un nouveau plaignant
 */
export const creerPlaignant = async (req, res) => {
  try {
    const {
      email,
      pseudo,
      prenom,
      nom,
      telephone,
      age,
      sexe,
      adresse,
      localisation,
      preferences
    } = req.body;

    // Vérifier si l'email existe déjà
    const existant = await Plaignant.findByEmail(email);
    if (existant) {
      return res.status(400).json({
        success: false,
        message: 'Un plaignant avec cet email existe déjà'
      });
    }

    // Créer le plaignant
    const plaignant = new Plaignant({
      email,
      pseudo,
      prenom,
      nom,
      telephone,
      age,
      sexe,
      adresse,
      localisation,
      preferences
    });

    // Valider et sauvegarder
    await plaignant.save();

    res.status(201).json({
      success: true,
      message: 'Plaignant créé avec succès',
      data: {
        id: plaignant.id,
        email: plaignant.email,
        pseudo: plaignant.pseudo,
        prenom: plaignant.prenom,
        nom: plaignant.nom,
        isActif: plaignant.isActif,
        dateInscription: plaignant.dateInscription
      }
    });

  } catch (error) {
    console.error('Erreur création plaignant:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création du plaignant'
    });
  }
};

/**
 * Obtenir un plaignant par ID
 */
export const obtenirPlaignant = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plaignant = await Plaignant.findById(id);
    
    if (!plaignant) {
      return res.status(404).json({
        success: false,
        message: 'Plaignant non trouvé'
      });
    }

    // Masquer les données sensibles selon le rôle
    const dataPlaignant = {
      id: plaignant.id,
      pseudo: plaignant.pseudo,
      prenom: plaignant.prenom,
      nom: plaignant.nom,
      age: plaignant.age,
      sexe: plaignant.sexe,
      avatar: plaignant.avatar,
      adresse: plaignant.adresse,
      preferences: plaignant.preferences,
      statistiques: plaignant.statistiques,
      isActif: plaignant.isActif,
      isVerifie: plaignant.isVerifie,
      dateInscription: plaignant.dateInscription
    };

    // Ajouter email et téléphone si admin ou propriétaire
    if (req.user?.role === 'admin' || req.user?.role === 'super_admin' || 
        req.user?.uid === plaignant.uid) {
      dataPlaignant.email = plaignant.email;
      dataPlaignant.telephone = plaignant.telephone;
      dataPlaignant.dernierConnexion = plaignant.dernierConnexion;
    }

    res.json({
      success: true,
      data: dataPlaignant
    });

  } catch (error) {
    console.error('Erreur obtention plaignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du plaignant'
    });
  }
};

/**
 * Lister les plaignants avec pagination et filtres
 */
export const listerPlaignants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      orderBy = 'dateInscription',
      orderDirection = 'desc',
      isActif = 'true',
      search = ''
    } = req.query;

    const options = {
      limit: parseInt(limit),
      orderBy,
      orderDirection,
      isActif: isActif === 'true'
    };

    // Pagination
    if (page > 1) {
      // Pour une vraie pagination, il faudrait stocker le lastDoc
      // Ici on utilise une approche simplifiée
    }

    const result = await Plaignant.list(options);

    // Filtrer par recherche côté serveur si nécessaire
    let plaignants = result.plaignants;
    if (search) {
      const searchLower = search.toLowerCase();
      plaignants = plaignants.filter(p => 
        p.pseudo.toLowerCase().includes(searchLower) ||
        p.prenom.toLowerCase().includes(searchLower) ||
        p.nom.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower)
      );
    }

    // Masquer les données sensibles
    const plaignantsPublics = plaignants.map(p => ({
      id: p.id,
      pseudo: p.pseudo,
      prenom: p.prenom,
      nom: p.nom,
      age: p.age,
      sexe: p.sexe,
      avatar: p.avatar,
      adresse: {
        ville: p.adresse.ville,
        codePostal: p.adresse.codePostal
      },
      statistiques: p.statistiques,
      isActif: p.isActif,
      isVerifie: p.isVerifie,
      dateInscription: p.dateInscription
    }));

    res.json({
      success: true,
      data: {
        plaignants: plaignantsPublics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: plaignants.length,
          hasMore: result.hasMore
        }
      }
    });

  } catch (error) {
    console.error('Erreur listage plaignants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plaignants'
    });
  }
};

/**
 * Mettre à jour un plaignant
 */
export const mettreAJourPlaignant = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const plaignant = await Plaignant.findById(id);
    
    if (!plaignant) {
      return res.status(404).json({
        success: false,
        message: 'Plaignant non trouvé'
      });
    }

    // Vérifier les permissions
    if (req.user?.uid !== plaignant.uid && 
        !['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission refusée'
      });
    }

    // Champs modifiables
    const champsModifiables = [
      'pseudo', 'prenom', 'nom', 'telephone', 'age', 'sexe', 
      'avatar', 'adresse', 'localisation', 'preferences'
    ];

    // Appliquer les mises à jour
    champsModifiables.forEach(champ => {
      if (updates[champ] !== undefined) {
        plaignant[champ] = updates[champ];
      }
    });

    // Sauvegarder
    await plaignant.save();

    res.json({
      success: true,
      message: 'Plaignant mis à jour avec succès',
      data: {
        id: plaignant.id,
        pseudo: plaignant.pseudo,
        prenom: plaignant.prenom,
        nom: plaignant.nom,
        dateMiseAJour: plaignant.dateMiseAJour
      }
    });

  } catch (error) {
    console.error('Erreur mise à jour plaignant:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour'
    });
  }
};

/**
 * Désactiver un plaignant
 */
export const desactiverPlaignant = async (req, res) => {
  try {
    const { id } = req.params;

    // Seuls les admins peuvent désactiver
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission refusée - Admin requis'
      });
    }

    const plaignant = await Plaignant.findById(id);
    
    if (!plaignant) {
      return res.status(404).json({
        success: false,
        message: 'Plaignant non trouvé'
      });
    }

    await plaignant.desactiver();

    res.json({
      success: true,
      message: 'Plaignant désactivé avec succès'
    });

  } catch (error) {
    console.error('Erreur désactivation plaignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la désactivation'
    });
  }
};

/**
 * Obtenir les statistiques d'un plaignant
 */
export const obtenirStatistiquesPlaignant = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plaignant = await Plaignant.findById(id);
    
    if (!plaignant) {
      return res.status(404).json({
        success: false,
        message: 'Plaignant non trouvé'
      });
    }

    // Vérifier les permissions
    if (req.user?.uid !== plaignant.uid && 
        !['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission refusée'
      });
    }

    res.json({
      success: true,
      data: {
        statistiques: plaignant.statistiques,
        informationsGenerales: {
          dateInscription: plaignant.dateInscription,
          dernierConnexion: plaignant.dernierConnexion,
          isVerifie: plaignant.isVerifie,
          isActif: plaignant.isActif
        }
      }
    });

  } catch (error) {
    console.error('Erreur statistiques plaignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

/**
 * Marquer la connexion d'un plaignant
 */
export const marquerConnexion = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'UID Firebase requis'
      });
    }

    const plaignant = await Plaignant.findByUid(uid);
    
    if (!plaignant) {
      return res.status(404).json({
        success: false,
        message: 'Plaignant non trouvé'
      });
    }

    await plaignant.updateDerniereConnexion();

    res.json({
      success: true,
      message: 'Connexion enregistrée',
      data: {
        dernierConnexion: plaignant.dernierConnexion
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

    // Pour une recherche simple, on récupère tous les plaignants actifs
    // et on filtre côté serveur (pas optimal pour de gros volumes)
    const result = await Plaignant.list({
      limit: parseInt(limit) * 2, // Récupérer plus pour filtrer
      isActif: true
    });

    const searchTerm = q.toLowerCase();
    const plaignantsFiltrés = result.plaignants.filter(p => 
      p.pseudo.toLowerCase().includes(searchTerm) ||
      p.prenom.toLowerCase().includes(searchTerm) ||
      p.nom.toLowerCase().includes(searchTerm) ||
      p.email.toLowerCase().includes(searchTerm)
    ).slice(0, parseInt(limit));

    const resultats = plaignantsFiltrés.map(p => ({
      id: p.id,
      pseudo: p.pseudo,
      prenom: p.prenom,
      nom: p.nom,
      email: p.email,
      avatar: p.avatar,
      statistiques: p.statistiques,
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
    const { id } = req.params;
    const { isVerifie } = req.body;

    // Seuls les admins peuvent vérifier
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission refusée - Admin requis'
      });
    }

    const plaignant = await Plaignant.findById(id);
    
    if (!plaignant) {
      return res.status(404).json({
        success: false,
        message: 'Plaignant non trouvé'
      });
    }

    plaignant.isVerifie = isVerifie;
    await plaignant.save();

    res.json({
      success: true,
      message: `Plaignant ${isVerifie ? 'vérifié' : 'non vérifié'} avec succès`,
      data: {
        id: plaignant.id,
        isVerifie: plaignant.isVerifie
      }
    });

  } catch (error) {
    console.error('Erreur vérification plaignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification'
    });
  }
}; 