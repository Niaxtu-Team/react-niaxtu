import { db } from '../config/firebase.js';
import { UserRoles, UserPermissions, hasPermission } from '../models/User.js';

/**
 * @swagger
 * /api/admin/users/{uid}/role:
 *   put:
 *     summary: Modifier le rôle d'un utilisateur
 *     tags: [Administration]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, moderator, admin, super_admin]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Rôle modifié avec succès
 *       403:
 *         description: Permission insuffisante
 *       404:
 *         description: Utilisateur non trouvé
 */
export const updateUserRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const { role, permissions = [] } = req.body;
    
    // Vérifier les permissions - seuls les admins peuvent modifier les rôles
    if (!hasPermission(req.user, UserPermissions.MANAGE_USERS)) {
      return res.status(403).json({ 
        error: 'Permission insuffisante pour modifier les rôles' 
      });
    }
    
    // Vérifier que l'administrateur cible existe
    const adminDoc = await db.collection('admin').doc(uid).get();
    if (!adminDoc.exists) {
      return res.status(404).json({ error: 'Administrateur non trouvé' });
    }
    
    const updateData = {
      role,
      permissions,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid
    };
    
    await db.collection('admin').doc(uid).update(updateData);
    
    res.json({
      success: true,
      message: 'Rôle administrateur mis à jour avec succès',
      data: updateData
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/admin/users/{uid}/activate:
 *   put:
 *     summary: Activer/désactiver un utilisateur
 *     tags: [Administration]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Statut utilisateur modifié
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { uid } = req.params;
    const { isActive } = req.body;
    
    if (!hasPermission(req.user, UserPermissions.MANAGE_USERS)) {
      return res.status(403).json({ 
        error: 'Permission insuffisante' 
      });
    }
    
    await db.collection('admin').doc(uid).update({
      isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid
    });
    
    res.json({
      success: true,
      message: `Administrateur ${isActive ? 'activé' : 'désactivé'} avec succès`
    });
  } catch (error) {
    console.error('Erreur lors de la modification du statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/admin/stats/dashboard:
 *   get:
 *     summary: Statistiques du tableau de bord admin
 *     tags: [Administration]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     active:
 *                       type: number
 *                     byRole:
 *                       type: object
 *                 complaints:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     pending:
 *                       type: number
 *                     inProgress:
 *                       type: number
 *                     resolved:
 *                       type: number
 *                     rejected:
 *                       type: number
 *                 sectors:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     active:
 *                       type: number
 */
export const getDashboardStats = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_REPORTS)) {
      return res.status(403).json({ 
        error: 'Permission insuffisante pour voir les statistiques' 
      });
    }
    
    // Statistiques des administrateurs
    const adminsSnapshot = await db.collection('admin').get();
    const admins = [];
    adminsSnapshot.forEach(doc => admins.push(doc.data()));
    
    const adminStats = {
      total: admins.length,
      active: admins.filter(u => u.isActive).length,
      byRole: {
        analyst: admins.filter(u => u.role === UserRoles.ANALYST).length,
        moderator: admins.filter(u => u.role === UserRoles.MODERATOR).length,
        structure_manager: admins.filter(u => u.role === UserRoles.STRUCTURE_MANAGER).length,
        sector_manager: admins.filter(u => u.role === UserRoles.SECTOR_MANAGER).length,
        admin: admins.filter(u => u.role === UserRoles.ADMIN).length,
        super_admin: admins.filter(u => u.role === UserRoles.SUPER_ADMIN).length
      }
    };
    
    // Statistiques des plaintes
    const complaintsSnapshot = await db.collection('complaints').get();
    const complaints = [];
    complaintsSnapshot.forEach(doc => complaints.push(doc.data()));
    
    const complaintStats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'en-attente').length,
      inProgress: complaints.filter(c => c.status === 'en-traitement').length,
      resolved: complaints.filter(c => c.status === 'resolue').length,
      rejected: complaints.filter(c => c.status === 'rejetee').length
    };
    
    // Statistiques des secteurs
    const sectorsSnapshot = await db.collection('sectors').get();
    const sectors = [];
    sectorsSnapshot.forEach(doc => sectors.push(doc.data()));
    
    const sectorStats = {
      total: sectors.length,
      active: sectors.filter(s => s.isActive).length
    };
    
    // Statistiques des structures
    const structuresSnapshot = await db.collection('structures').get();
    const structures = [];
    structuresSnapshot.forEach(doc => structures.push(doc.data()));
    
    const structureStats = {
      total: structures.length,
      active: structures.filter(s => s.isActive).length
    };
    
    res.json({
      success: true,
      stats: {
        admins: adminStats,
        complaints: complaintStats,
        sectors: sectorStats,
        structures: structureStats,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/admin/reports/export:
 *   post:
 *     summary: Exporter des données
 *     tags: [Administration]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collections:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [users, complaints, sectors, structures]
 *               format:
 *                 type: string
 *                 enum: [json, csv]
 *                 default: json
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date
 *                   end:
 *                     type: string
 *                     format: date
 *     responses:
 *       200:
 *         description: Données exportées avec succès
 */
export const exportData = async (req, res) => {
  try {
    const { collections = ['complaints'], format = 'json', dateRange } = req.body;
    
    if (!hasPermission(req.user, UserPermissions.EXPORT_DATA)) {
      return res.status(403).json({ 
        error: 'Permission insuffisante pour exporter des données' 
      });
    }
    
    const exportData = {};
    
    for (const collection of collections) {
      let query = db.collection(collection);
      
      // Filtrer par date si spécifié
      if (dateRange && dateRange.start && dateRange.end) {
        query = query
          .where('createdAt', '>=', dateRange.start)
          .where('createdAt', '<=', dateRange.end);
      }
      
      const snapshot = await query.get();
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      
      exportData[collection] = data;
    }
    
    // Log de l'export pour audit
    await db.collection('audit_logs').add({
      action: 'DATA_EXPORT',
      userId: req.user.uid,
      collections,
      format,
      dateRange,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Données exportées avec succès',
      data: exportData,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}; 