import express from 'express';
import { 
  getAllComplaintTypes,
  createComplaintType,
  updateComplaintType,
  deleteComplaintType,
  getAllTargetTypes,
  createTargetType,
  updateTargetType,
  deleteTargetType,
  getComplaintTypeStatistics
} from '../controllers/typesController.js';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import { UserPermissions, hasPermission } from '../models/User.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

// ===================== ROUTES TYPES DE PLAINTES =====================

/**
 * @swagger
 * tags:
 *   name: Types de plaintes
 *   description: Gestion des types de plaintes
 */

// Récupérer tous les types de plaintes
router.get('/complaints', getAllComplaintTypes);

// Créer un nouveau type de plainte
router.post('/complaints', createComplaintType);

// Modifier un type de plainte
router.put('/complaints/:id', updateComplaintType);

// Supprimer un type de plainte
router.delete('/complaints/:id', deleteComplaintType);

// Activer/désactiver un type de plainte
router.put('/complaints/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('complaintTypes').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Type de plainte non trouvé' });
    }
    
    const typeData = doc.data();
    
    if (!hasPermission(req.user, UserPermissions.EDIT_COMPLAINT_TYPES, { sectorId: typeData.sectorId })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const isActive = !typeData.isActive;
    
    await db.collection('complaintTypes').doc(id).update({
      isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid
    });
    
    res.json({
      success: true,
      message: `Type de plainte ${isActive ? 'activé' : 'désactivé'} avec succès`,
      data: { isActive }
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les statistiques d'un type de plainte
router.get('/complaints/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!hasPermission(req.user, UserPermissions.VIEW_COMPLAINT_TYPES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const doc = await db.collection('complaintTypes').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Type de plainte non trouvé' });
    }
    
    const statistics = await getComplaintTypeStatistics(id);
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===================== ROUTES TYPES DE CIBLES =====================

/**
 * @swagger
 * tags:
 *   name: Types de cibles
 *   description: Gestion des types de cibles
 */

// Récupérer tous les types de cibles
router.get('/targets', getAllTargetTypes);

// Créer un nouveau type de cible
router.post('/targets', createTargetType);

// Modifier un type de cible
router.put('/targets/:id', updateTargetType);

// Supprimer un type de cible
router.delete('/targets/:id', deleteTargetType);

// Activer/désactiver un type de cible
router.put('/targets/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!hasPermission(req.user, UserPermissions.EDIT_TARGET_TYPES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const doc = await db.collection('targetTypes').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Type de cible non trouvé' });
    }
    
    const typeData = doc.data();
    const isActive = !typeData.isActive;
    
    await db.collection('targetTypes').doc(id).update({
      isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid
    });
    
    res.json({
      success: true,
      message: `Type de cible ${isActive ? 'activé' : 'désactivé'} avec succès`,
      data: { isActive }
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les catégories de types de cibles
router.get('/targets/categories', async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_TARGET_TYPES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const snapshot = await db.collection('targetTypes')
      .where('isActive', '==', true)
      .get();
    
    const categories = new Set();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });
    
    res.json({
      success: true,
      data: Array.from(categories).sort(),
      count: categories.size
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Exporter les types
router.get('/export', async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.EXPORT_DATA)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const { type = 'both', format = 'json' } = req.query;
    
    const exportData = {};
    
    if (type === 'complaints' || type === 'both') {
      const complaintsSnapshot = await db.collection('complaintTypes').get();
      const complaintTypes = [];
      
      for (const doc of complaintsSnapshot.docs) {
        const complaintType = { id: doc.id, ...doc.data() };
        
        // Ajouter les statistiques
        complaintType.statistics = await getComplaintTypeStatistics(doc.id);
        
        // Ajouter le nom du secteur si applicable
        if (complaintType.sectorId) {
          const sectorDoc = await db.collection('sectors').doc(complaintType.sectorId).get();
          if (sectorDoc.exists) {
            complaintType.sectorName = sectorDoc.data().name;
          }
        }
        
        complaintTypes.push(complaintType);
      }
      
      exportData.complaintTypes = complaintTypes;
    }
    
    if (type === 'targets' || type === 'both') {
      const targetsSnapshot = await db.collection('targetTypes').get();
      const targetTypes = [];
      
      targetsSnapshot.forEach(doc => {
        targetTypes.push({ id: doc.id, ...doc.data() });
      });
      
      exportData.targetTypes = targetTypes;
    }
    
    // Log de l'export
    await db.collection('audit_logs').add({
      action: 'EXPORT_TYPES',
      userId: req.user.uid,
      details: { 
        type,
        format,
        complaintTypesCount: exportData.complaintTypes?.length || 0,
        targetTypesCount: exportData.targetTypes?.length || 0
      },
      timestamp: new Date().toISOString()
    });
    
    if (format === 'csv') {
      // Convertir en CSV si demandé
      let csv = '';
      
      if (exportData.complaintTypes) {
        csv += 'Types de plaintes\n';
        csv += 'ID,Nom,Description,Secteur,Sévérité,Attribution auto,Statut,Créé le\n';
        
        exportData.complaintTypes.forEach(type => {
          csv += [
            type.id,
            type.name,
            type.description || '',
            type.sectorName || '',
            type.severity,
            type.autoAssignment ? 'Oui' : 'Non',
            type.isActive ? 'Actif' : 'Inactif',
            type.createdAt
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n';
        });
        
        csv += '\n';
      }
      
      if (exportData.targetTypes) {
        csv += 'Types de cibles\n';
        csv += 'ID,Nom,Description,Catégorie,Statut,Créé le\n';
        
        exportData.targetTypes.forEach(type => {
          csv += [
            type.id,
            type.name,
            type.description || '',
            type.category || '',
            type.isActive ? 'Actif' : 'Inactif',
            type.createdAt
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n';
        });
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="types.csv"');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: exportData,
        exportedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router; 