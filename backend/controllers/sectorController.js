import { db } from '../config/firebase.js';
import { UserPermissions, hasPermission } from '../models/User.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Sector:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du secteur
 *         name:
 *           type: string
 *           description: Nom du secteur
 *         description:
 *           type: string
 *           description: Description du secteur
 *         icon:
 *           type: string
 *           description: Icône FontAwesome
 *         color:
 *           type: string
 *           description: Couleur hexadécimale
 *         isActive:
 *           type: boolean
 *           description: Secteur actif
 *         order:
 *           type: number
 *           description: Ordre d'affichage
 *         statistics:
 *           type: object
 *           properties:
 *             totalComplaints:
 *               type: number
 *             resolvedComplaints:
 *               type: number
 *             pendingComplaints:
 *               type: number
 *             structures:
 *               type: number
 *             subSectors:
 *               type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: string
 *           description: UID du créateur
 *     SubSector:
 *       type: object
 *       required:
 *         - name
 *         - sectorId
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         sectorId:
 *           type: string
 *         icon:
 *           type: string
 *         isActive:
 *           type: boolean
 *         order:
 *           type: number
 *         statistics:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/sectors:
 *   get:
 *     summary: Récupérer tous les secteurs
 *     tags: [Secteurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *       - in: query
 *         name: withStats
 *         schema:
 *           type: boolean
 *         description: Inclure les statistiques
 *       - in: query
 *         name: withSubSectors
 *         schema:
 *           type: boolean
 *         description: Inclure les sous-secteurs
 *     responses:
 *       200:
 *         description: Liste des secteurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sector'
 */
export const getAllSectors = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_SECTORS)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }

    const { active, withStats, withSubSectors } = req.query;
    
    let query = db.collection('sectors');
    
    // Filtrer par secteurs accessibles si utilisateur limité
    if (req.user.accessScope?.sectorIds) {
      query = query.where('__name__', 'in', req.user.accessScope.sectorIds);
    }
    
    if (active !== undefined) {
      query = query.where('isActive', '==', active === 'true');
    }
    
    const snapshot = await query.orderBy('order', 'asc').get();
    const sectors = [];
    
    for (const doc of snapshot.docs) {
      const sectorData = { id: doc.id, ...doc.data() };
      
      // Ajouter les statistiques si demandées
      if (withStats === 'true') {
        sectorData.statistics = await getSectorStatistics(doc.id);
      }
      
      // Ajouter les sous-secteurs si demandés
      if (withSubSectors === 'true') {
        const subSectors = await getSubSectorsBySector(doc.id);
        sectorData.subSectors = subSectors;
      }
      
      sectors.push(sectorData);
    }
    
    res.json({
      success: true,
      data: sectors,
      count: sectors.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des secteurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/sectors/{id}:
 *   get:
 *     summary: Récupérer un secteur par ID
 *     tags: [Secteurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du secteur
 *       404:
 *         description: Secteur non trouvé
 */
export const getSectorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!hasPermission(req.user, UserPermissions.VIEW_SECTORS, { sectorId: id })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const doc = await db.collection('sectors').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Secteur non trouvé' });
    }
    
    const sectorData = { id: doc.id, ...doc.data() };
    
    // Ajouter les statistiques et sous-secteurs
    sectorData.statistics = await getSectorStatistics(id);
    sectorData.subSectors = await getSubSectorsBySector(id);
    sectorData.structures = await getStructuresBySector(id);
    
    res.json({
      success: true,
      data: sectorData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du secteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/sectors:
 *   post:
 *     summary: Créer un nouveau secteur
 *     tags: [Secteurs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Secteur créé avec succès
 *       400:
 *         description: Données invalides
 */
export const createSector = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.CREATE_SECTORS)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const { name, description, icon, color, order } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Le nom du secteur est requis' });
    }
    
    // Vérifier l'unicité du nom
    const existingSnapshot = await db.collection('sectors')
      .where('name', '==', name.trim())
      .limit(1)
      .get();
      
    if (!existingSnapshot.empty) {
      return res.status(400).json({ error: 'Un secteur avec ce nom existe déjà' });
    }
    
    // Déterminer l'ordre si non spécifié
    let sectorOrder = order;
    if (!sectorOrder) {
      const lastSectorSnapshot = await db.collection('sectors')
        .orderBy('order', 'desc')
        .limit(1)
        .get();
      sectorOrder = lastSectorSnapshot.empty ? 1 : lastSectorSnapshot.docs[0].data().order + 1;
    }
    
    const sectorData = {
      name: name.trim(),
      description: description?.trim() || '',
      icon: icon || 'fa-layer-group',
      color: color || '#3b82f6',
      isActive: true,
      order: sectorOrder,
      statistics: {
        totalComplaints: 0,
        resolvedComplaints: 0,
        pendingComplaints: 0,
        structures: 0,
        subSectors: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.uid
    };
    
    const docRef = await db.collection('sectors').add(sectorData);
    
    // Log de l'action
    await logAction('CREATE_SECTOR', req.user.uid, { sectorId: docRef.id, name });
    
    res.status(201).json({
      success: true,
      message: 'Secteur créé avec succès',
      data: { id: docRef.id, ...sectorData }
    });
  } catch (error) {
    console.error('Erreur lors de la création du secteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/sectors/{id}:
 *   put:
 *     summary: Modifier un secteur
 *     tags: [Secteurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               order:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Secteur modifié avec succès
 *       404:
 *         description: Secteur non trouvé
 */
export const updateSector = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!hasPermission(req.user, UserPermissions.EDIT_SECTORS, { sectorId: id })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const doc = await db.collection('sectors').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Secteur non trouvé' });
    }
    
    const { name, description, icon, color, order, isActive } = req.body;
    const updateData = {};
    
    if (name?.trim()) {
      // Vérifier l'unicité du nom si changé
      if (name.trim() !== doc.data().name) {
        const existingSnapshot = await db.collection('sectors')
          .where('name', '==', name.trim())
          .limit(1)
          .get();
          
        if (!existingSnapshot.empty) {
          return res.status(400).json({ error: 'Un secteur avec ce nom existe déjà' });
        }
      }
      updateData.name = name.trim();
    }
    
    if (description !== undefined) updateData.description = description.trim();
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    updateData.updatedAt = new Date().toISOString();
    updateData.updatedBy = req.user.uid;
    
    await db.collection('sectors').doc(id).update(updateData);
    
    // Log de l'action
    await logAction('UPDATE_SECTOR', req.user.uid, { sectorId: id, changes: updateData });
    
    res.json({
      success: true,
      message: 'Secteur modifié avec succès',
      data: updateData
    });
  } catch (error) {
    console.error('Erreur lors de la modification du secteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/sectors/{id}:
 *   delete:
 *     summary: Supprimer un secteur
 *     tags: [Secteurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Secteur supprimé avec succès
 *       400:
 *         description: Impossible de supprimer - secteur utilisé
 *       404:
 *         description: Secteur non trouvé
 */
export const deleteSector = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!hasPermission(req.user, UserPermissions.DELETE_SECTORS, { sectorId: id })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const doc = await db.collection('sectors').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Secteur non trouvé' });
    }
    
    // Vérifier s'il y a des sous-secteurs ou structures liés
    const [subSectorsSnapshot, structuresSnapshot, complaintsSnapshot] = await Promise.all([
      db.collection('subSectors').where('sectorId', '==', id).limit(1).get(),
      db.collection('structures').where('sectorId', '==', id).limit(1).get(),
      db.collection('complaints').where('sectorId', '==', id).limit(1).get()
    ]);
    
    if (!subSectorsSnapshot.empty || !structuresSnapshot.empty || !complaintsSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer ce secteur car il contient des sous-secteurs, structures ou plaintes' 
      });
    }
    
    await db.collection('sectors').doc(id).delete();
    
    // Log de l'action
    await logAction('DELETE_SECTOR', req.user.uid, { sectorId: id, name: doc.data().name });
    
    res.json({
      success: true,
      message: 'Secteur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du secteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/sectors/{id}/toggle:
 *   put:
 *     summary: Activer/désactiver un secteur
 *     tags: [Secteurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statut du secteur modifié
 */
export const toggleSectorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!hasPermission(req.user, UserPermissions.ACTIVATE_SECTORS, { sectorId: id })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const doc = await db.collection('sectors').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Secteur non trouvé' });
    }
    
    const isActive = !doc.data().isActive;
    
    await db.collection('sectors').doc(id).update({
      isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid
    });
    
    // Log de l'action
    await logAction('TOGGLE_SECTOR', req.user.uid, { sectorId: id, isActive });
    
    res.json({
      success: true,
      message: `Secteur ${isActive ? 'activé' : 'désactivé'} avec succès`,
      data: { isActive }
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/sectors/reorder:
 *   put:
 *     summary: Réorganiser l'ordre des secteurs
 *     tags: [Secteurs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sectors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     order:
 *                       type: number
 *     responses:
 *       200:
 *         description: Ordre des secteurs mis à jour
 */
export const reorderSectors = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.REORDER_SECTORS)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const { sectors } = req.body;
    
    if (!Array.isArray(sectors)) {
      return res.status(400).json({ error: 'Format de données invalide' });
    }
    
    const batch = db.batch();
    
    for (const sector of sectors) {
      if (sector.id && typeof sector.order === 'number') {
        const sectorRef = db.collection('sectors').doc(sector.id);
        batch.update(sectorRef, {
          order: sector.order,
          updatedAt: new Date().toISOString(),
          updatedBy: req.user.uid
        });
      }
    }
    
    await batch.commit();
    
    // Log de l'action
    await logAction('REORDER_SECTORS', req.user.uid, { sectorsCount: sectors.length });
    
    res.json({
      success: true,
      message: 'Ordre des secteurs mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la réorganisation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ===================== SOUS-SECTEURS =====================

/**
 * @swagger
 * /api/sectors/{sectorId}/subsectors:
 *   get:
 *     summary: Récupérer les sous-secteurs d'un secteur
 *     tags: [Sous-secteurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sectorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des sous-secteurs
 */
export const getSubSectorsBySector = async (sectorId, includeStats = false) => {
  try {
    const snapshot = await db.collection('subSectors')
      .where('sectorId', '==', sectorId)
      .orderBy('order', 'asc')
      .get();
    
    const subSectors = [];
    
    for (const doc of snapshot.docs) {
      const subSectorData = { id: doc.id, ...doc.data() };
      
      if (includeStats) {
        subSectorData.statistics = await getSubSectorStatistics(doc.id);
      }
      
      subSectors.push(subSectorData);
    }
    
    return subSectors;
  } catch (error) {
    console.error('Erreur lors de la récupération des sous-secteurs:', error);
    return [];
  }
};

/**
 * @swagger
 * /api/subsectors:
 *   post:
 *     summary: Créer un nouveau sous-secteur
 *     tags: [Sous-secteurs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sectorId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               sectorId:
 *                 type: string
 *               icon:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Sous-secteur créé avec succès
 */
export const createSubSector = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.CREATE_SUBSECTORS)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const { name, description, sectorId, icon, order } = req.body;
    
    if (!name?.trim() || !sectorId) {
      return res.status(400).json({ error: 'Le nom et l\'ID du secteur sont requis' });
    }
    
    // Vérifier que le secteur existe
    const sectorDoc = await db.collection('sectors').doc(sectorId).get();
    if (!sectorDoc.exists) {
      return res.status(400).json({ error: 'Secteur non trouvé' });
    }
    
    // Vérifier les permissions sur le secteur
    if (!hasPermission(req.user, UserPermissions.CREATE_SUBSECTORS, { sectorId })) {
      return res.status(403).json({ error: 'Permission insuffisante pour ce secteur' });
    }
    
    // Vérifier l'unicité du nom dans le secteur
    const existingSnapshot = await db.collection('subSectors')
      .where('sectorId', '==', sectorId)
      .where('name', '==', name.trim())
      .limit(1)
      .get();
      
    if (!existingSnapshot.empty) {
      return res.status(400).json({ error: 'Un sous-secteur avec ce nom existe déjà dans ce secteur' });
    }
    
    // Déterminer l'ordre
    let subSectorOrder = order;
    if (!subSectorOrder) {
      const lastSubSectorSnapshot = await db.collection('subSectors')
        .where('sectorId', '==', sectorId)
        .orderBy('order', 'desc')
        .limit(1)
        .get();
      subSectorOrder = lastSubSectorSnapshot.empty ? 1 : lastSubSectorSnapshot.docs[0].data().order + 1;
    }
    
    const subSectorData = {
      name: name.trim(),
      description: description?.trim() || '',
      sectorId,
      icon: icon || 'fa-th-large',
      isActive: true,
      order: subSectorOrder,
      statistics: {
        totalComplaints: 0,
        resolvedComplaints: 0,
        pendingComplaints: 0,
        structures: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.uid
    };
    
    const docRef = await db.collection('subSectors').add(subSectorData);
    
    // Mettre à jour les statistiques du secteur
    await updateSectorStatistics(sectorId);
    
    // Log de l'action
    await logAction('CREATE_SUBSECTOR', req.user.uid, { 
      subSectorId: docRef.id, 
      sectorId, 
      name 
    });
    
    res.status(201).json({
      success: true,
      message: 'Sous-secteur créé avec succès',
      data: { id: docRef.id, ...subSectorData }
    });
  } catch (error) {
    console.error('Erreur lors de la création du sous-secteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/subsectors/{id}:
 *   put:
 *     summary: Modifier un sous-secteur
 *     tags: [Sous-secteurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sous-secteur modifié avec succès
 */
export const updateSubSector = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('subSectors').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Sous-secteur non trouvé' });
    }
    
    const subSectorData = doc.data();
    
    if (!hasPermission(req.user, UserPermissions.EDIT_SUBSECTORS, { sectorId: subSectorData.sectorId })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const { name, description, icon, order, isActive } = req.body;
    const updateData = {};
    
    if (name?.trim()) {
      // Vérifier l'unicité du nom si changé
      if (name.trim() !== subSectorData.name) {
        const existingSnapshot = await db.collection('subSectors')
          .where('sectorId', '==', subSectorData.sectorId)
          .where('name', '==', name.trim())
          .limit(1)
          .get();
          
        if (!existingSnapshot.empty) {
          return res.status(400).json({ error: 'Un sous-secteur avec ce nom existe déjà dans ce secteur' });
        }
      }
      updateData.name = name.trim();
    }
    
    if (description !== undefined) updateData.description = description.trim();
    if (icon) updateData.icon = icon;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    updateData.updatedAt = new Date().toISOString();
    updateData.updatedBy = req.user.uid;
    
    await db.collection('subSectors').doc(id).update(updateData);
    
    // Log de l'action
    await logAction('UPDATE_SUBSECTOR', req.user.uid, { 
      subSectorId: id, 
      sectorId: subSectorData.sectorId, 
      changes: updateData 
    });
    
    res.json({
      success: true,
      message: 'Sous-secteur modifié avec succès',
      data: updateData
    });
  } catch (error) {
    console.error('Erreur lors de la modification du sous-secteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/subsectors/{id}:
 *   delete:
 *     summary: Supprimer un sous-secteur
 *     tags: [Sous-secteurs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sous-secteur supprimé avec succès
 */
export const deleteSubSector = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('subSectors').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Sous-secteur non trouvé' });
    }
    
    const subSectorData = doc.data();
    
    if (!hasPermission(req.user, UserPermissions.DELETE_SUBSECTORS, { sectorId: subSectorData.sectorId })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    // Vérifier s'il y a des structures ou plaintes liées
    const [structuresSnapshot, complaintsSnapshot] = await Promise.all([
      db.collection('structures').where('subSectorId', '==', id).limit(1).get(),
      db.collection('complaints').where('subSectorId', '==', id).limit(1).get()
    ]);
    
    if (!structuresSnapshot.empty || !complaintsSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer ce sous-secteur car il contient des structures ou plaintes' 
      });
    }
    
    await db.collection('subSectors').doc(id).delete();
    
    // Mettre à jour les statistiques du secteur
    await updateSectorStatistics(subSectorData.sectorId);
    
    // Log de l'action
    await logAction('DELETE_SUBSECTOR', req.user.uid, { 
      subSectorId: id, 
      sectorId: subSectorData.sectorId, 
      name: subSectorData.name 
    });
    
    res.json({
      success: true,
      message: 'Sous-secteur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du sous-secteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ===================== FONCTIONS UTILITAIRES =====================

// Calculer les statistiques d'un secteur
export const getSectorStatistics = async (sectorId) => {
  try {
    const [complaintsSnapshot, structuresSnapshot, subSectorsSnapshot] = await Promise.all([
      db.collection('complaints').where('sectorId', '==', sectorId).get(),
      db.collection('structures').where('sectorId', '==', sectorId).get(),
      db.collection('subSectors').where('sectorId', '==', sectorId).get()
    ]);
    
    const complaints = [];
    complaintsSnapshot.forEach(doc => complaints.push(doc.data()));
    
    return {
      totalComplaints: complaints.length,
      resolvedComplaints: complaints.filter(c => c.status === 'resolue').length,
      pendingComplaints: complaints.filter(c => c.status === 'en-attente').length,
      inProgressComplaints: complaints.filter(c => c.status === 'en-traitement').length,
      rejectedComplaints: complaints.filter(c => c.status === 'rejetee').length,
      structures: structuresSnapshot.size,
      subSectors: subSectorsSnapshot.size
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques du secteur:', error);
    return {
      totalComplaints: 0,
      resolvedComplaints: 0,
      pendingComplaints: 0,
      inProgressComplaints: 0,
      rejectedComplaints: 0,
      structures: 0,
      subSectors: 0
    };
  }
};

// Calculer les statistiques d'un sous-secteur
export const getSubSectorStatistics = async (subSectorId) => {
  try {
    const [complaintsSnapshot, structuresSnapshot] = await Promise.all([
      db.collection('complaints').where('subSectorId', '==', subSectorId).get(),
      db.collection('structures').where('subSectorId', '==', subSectorId).get()
    ]);
    
    const complaints = [];
    complaintsSnapshot.forEach(doc => complaints.push(doc.data()));
    
    return {
      totalComplaints: complaints.length,
      resolvedComplaints: complaints.filter(c => c.status === 'resolue').length,
      pendingComplaints: complaints.filter(c => c.status === 'en-attente').length,
      structures: structuresSnapshot.size
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques du sous-secteur:', error);
    return {
      totalComplaints: 0,
      resolvedComplaints: 0,
      pendingComplaints: 0,
      structures: 0
    };
  }
};

// Mettre à jour les statistiques d'un secteur
export const updateSectorStatistics = async (sectorId) => {
  try {
    const statistics = await getSectorStatistics(sectorId);
    
    await db.collection('sectors').doc(sectorId).update({
      statistics,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
  }
};

// Récupérer les structures d'un secteur
export const getStructuresBySector = async (sectorId) => {
  try {
    const snapshot = await db.collection('structures')
      .where('sectorId', '==', sectorId)
      .get();
    
    const structures = [];
    snapshot.forEach(doc => {
      structures.push({ id: doc.id, ...doc.data() });
    });
    
    return structures;
  } catch (error) {
    console.error('Erreur lors de la récupération des structures:', error);
    return [];
  }
};

// Logger les actions
export const logAction = async (action, userId, details = {}) => {
  try {
    await db.collection('audit_logs').add({
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
      ip: details.ip || null,
      userAgent: details.userAgent || null
    });
  } catch (error) {
    console.error('Erreur lors du logging:', error);
  }
}; 