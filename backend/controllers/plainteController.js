import Plainte from '../models/Plainte.js';
import Plaignant from '../models/Plaignant.js';

/**
 * 📝 Contrôleur Plainte - Gestion du système de plaintes
 * Basé sur la documentation DATABASE_SCHEMA_FIRESTORE.md
 */

/**
 * Créer une nouvelle plainte
 */
export const creerPlainte = async (req, res) => {
  try {
    const {
      plaignantId,
      titre,
      description,
      typePlainteId,
      typePlainteLibelle,
      localisation,
      secteurId,
      secteurLibelle,
      priorite = 'moyenne',
      source = 'web'
    } = req.body;

    // Vérifier que le plaignant existe
    const plaignant = await Plaignant.findById(plaignantId);
    if (!plaignant) {
      return res.status(404).json({
        success: false,
        message: 'Plaignant non trouvé'
      });
    }

    // Créer la plainte avec dénormalisation des données plaignant
    const plainte = new Plainte({
      plaignantId,
      plaignantPseudo: plaignant.pseudo,
      prenom: plaignant.prenom,
      nom: plaignant.nom,
      tel1: plaignant.telephone,
      email: plaignant.email,
      age: plaignant.age,
      sexe: plaignant.sexe,
      titre,
      description,
      typePlainteId,
      typePlainteLibelle,
      localisation,
      secteurId,
      secteurLibelle,
      priorite,
      source
    });

    // Sauvegarder
    await plainte.save();

    // Mettre à jour les statistiques du plaignant
    await plaignant.updateStatistiques({
      nombrePlaintes: plaignant.statistiques.nombrePlaintes + 1,
      dernierePlainte: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Plainte créée avec succès',
      data: {
        id: plainte.id,
        reference: plainte.reference,
        titre: plainte.titre,
        statut: plainte.statut,
        priorite: plainte.priorite,
        scoreUrgence: plainte.scoreUrgence,
        dateCreation: plainte.dateCreation,
        tags: plainte.tags
      }
    });

  } catch (error) {
    console.error('Erreur création plainte:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la plainte'
    });
  }
};

/**
 * Obtenir une plainte par ID
 */
export const obtenirPlainte = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plainte = await Plainte.findById(id);
    
    if (!plainte) {
      return res.status(404).json({
        success: false,
        message: 'Plainte non trouvée'
      });
    }

    // Incrémenter le nombre de vues
    await plainte.incrementerVues();

    res.json({
      success: true,
      data: plainte
    });

  } catch (error) {
    console.error('Erreur obtention plainte:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la plainte'
    });
  }
};

/**
 * Lister les plaintes avec filtres et pagination
 */
export const listerPlaintes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      orderBy = 'dateCreation',
      orderDirection = 'desc',
      statut,
      secteurId,
      structureId,
      plaignantId,
      priorite,
      isActive = 'true'
    } = req.query;

    const options = {
      limit: parseInt(limit),
      orderBy,
      orderDirection,
      statut,
      secteurId,
      structureId,
      plaignantId,
      priorite,
      isActive: isActive === 'true'
    };

    const result = await Plainte.list(options);

    res.json({
      success: true,
      data: {
        plaintes: result.plaintes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.plaintes.length,
          hasMore: result.hasMore
        }
      }
    });

  } catch (error) {
    console.error('Erreur listage plaintes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plaintes'
    });
  }
};

/**
 * Rechercher des plaintes par mots-clés
 */
export const rechercherPlaintes = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Terme de recherche requis (minimum 2 caractères)'
      });
    }

    const plaintes = await Plainte.search(q, { limit: parseInt(limit) });

    res.json({
      success: true,
      data: {
        resultats: plaintes,
        total: plaintes.length,
        terme: q
      }
    });

  } catch (error) {
    console.error('Erreur recherche plaintes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche'
    });
  }
};

/**
 * Assigner une plainte à un administrateur
 */
export const assignerPlainte = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    // Seuls les admins peuvent assigner
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission refusée - Admin requis'
      });
    }

    const plainte = await Plainte.findById(id);
    
    if (!plainte) {
      return res.status(404).json({
        success: false,
        message: 'Plainte non trouvée'
      });
    }

    await plainte.assigner(adminId, req.user.uid);

    res.json({
      success: true,
      message: 'Plainte assignée avec succès',
      data: {
        id: plainte.id,
        assigneA: plainte.assigneA,
        statut: plainte.statut,
        dateAssignation: plainte.dateAssignation
      }
    });

  } catch (error) {
    console.error('Erreur assignation plainte:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'assignation'
    });
  }
};

/**
 * Changer le statut d'une plainte
 */
export const changerStatutPlainte = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, resolutionNote } = req.body;

    // Seuls les admins peuvent changer le statut
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission refusée - Admin requis'
      });
    }

    const plainte = await Plainte.findById(id);
    
    if (!plainte) {
      return res.status(404).json({
        success: false,
        message: 'Plainte non trouvée'
      });
    }

    await plainte.changerStatut(statut, resolutionNote);

    res.json({
      success: true,
      message: `Statut changé vers "${statut}" avec succès`,
      data: {
        id: plainte.id,
        statut: plainte.statut,
        dateResolution: plainte.dateResolution,
        dateMiseAJour: plainte.dateMiseAJour
      }
    });

  } catch (error) {
    console.error('Erreur changement statut:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors du changement de statut'
    });
  }
};

/**
 * Obtenir les statistiques des plaintes
 */
export const obtenirStatistiquesPlaintes = async (req, res) => {
  try {
    const { secteurId, structureId } = req.query;

    // Seuls les admins peuvent voir les statistiques globales
    if (!['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission refusée - Admin requis'
      });
    }

    const stats = await Plainte.getStatistiques({ secteurId, structureId });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur statistiques plaintes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
}; 