import express from 'express';
import { 
  getAllSectors,
  getSectorById,
  createSector,
  updateSector,
  deleteSector,
  toggleSectorStatus,
  reorderSectors,
  createSubSector,
  updateSubSector,
  deleteSubSector,
  getSubSectorsBySector
} from '../controllers/sectorController.js';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import { UserPermissions, hasPermission } from '../models/User.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// ===================== ROUTES SECTEURS =====================

/**
 * @swagger
 * tags:
 *   name: Secteurs
 *   description: Gestion des secteurs
 */

// Récupérer tous les secteurs
router.get('/', getAllSectors);

// Récupérer un secteur par ID
router.get('/:id', getSectorById);

// Créer un nouveau secteur
router.post('/', createSector);

// Modifier un secteur
router.put('/:id', updateSector);

// Supprimer un secteur
router.delete('/:id', deleteSector);

// Activer/désactiver un secteur
router.put('/:id/toggle', toggleSectorStatus);

// Réorganiser les secteurs
router.put('/reorder', reorderSectors);

// Récupérer les sous-secteurs d'un secteur
router.get('/:sectorId/subsectors', async (req, res) => {
  try {
    const { sectorId } = req.params;
    const { withStats } = req.query;
    
    const subSectors = await getSubSectorsBySector(sectorId, withStats === 'true');
    
    res.json({
      success: true,
      data: subSectors,
      count: subSectors.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sous-secteurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===================== ROUTES SOUS-SECTEURS =====================

/**
 * @swagger
 * tags:
 *   name: Sous-secteurs
 *   description: Gestion des sous-secteurs
 */

// Créer un nouveau sous-secteur
router.post('/subsectors', createSubSector);

// Modifier un sous-secteur
router.put('/subsectors/:id', updateSubSector);

// Supprimer un sous-secteur
router.delete('/subsectors/:id', deleteSubSector);

// Activer/désactiver un sous-secteur
router.put('/subsectors/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('subSectors').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Sous-secteur non trouvé' });
    }
    
    const subSectorData = doc.data();
    
    if (!hasPermission(req.user, UserPermissions.ACTIVATE_SUBSECTORS, { sectorId: subSectorData.sectorId })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const isActive = !subSectorData.isActive;
    
    await db.collection('subSectors').doc(id).update({
      isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid
    });
    
    res.json({
      success: true,
      message: `Sous-secteur ${isActive ? 'activé' : 'désactivé'} avec succès`,
      data: { isActive }
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router; 