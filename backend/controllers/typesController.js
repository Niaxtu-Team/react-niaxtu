import { db } from '../config/firebase.js';
import { UserPermissions, hasPermission } from '../models/User.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     ComplaintType:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         sectorId:
 *           type: string
 *         isActive:
 *           type: boolean
 *         severity:
 *           type: string
 *           enum: [faible, moyenne, elevee, critique]
 *         autoAssignment:
 *           type: boolean
 *         icon:
 *           type: string
 *         color:
 *           type: string
 *         statistics:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *     TargetType:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         isActive:
 *           type: boolean
 *         icon:
 *           type: string
 *         examples:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// ===================== TYPES DE PLAINTES =====================

/**
 * @swagger
 * /api/types/complaints:
 *   get:
 *     summary: Récupérer tous les types de plaintes
 *     tags: [Types de plaintes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sectorId
 *         schema:
 *           type: string
 *         description: Filtrer par secteur
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *         description: Filtrer par sévérité
 *       - in: query
 *         name: withStats
 *         schema:
 *           type: boolean
 *         description: Inclure les statistiques
 *     responses:
 *       200:
 *         description: Liste des types de plaintes
 */
export const getAllComplaintTypes = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_COMPLAINT_TYPES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }

    const { sectorId, active, severity, withStats } = req.query;
    
    let query = db.collection('complaintTypes');
    
    // Filtrer par secteurs accessibles si utilisateur limité
    if (req.user.accessScope?.sectorIds && !sectorId) {
      query = query.where('sectorId', 'in', req.user.accessScope.sectorIds);
    }
    
    if (sectorId) {
      query = query.where('sectorId', '==', sectorId);
    }
    
    if (active !== undefined) {
      query = query.where('isActive', '==', active === 'true');
    }
    
    if (severity) {
      query = query.where('severity', '==', severity);
    }
    
    const snapshot = await query.orderBy('name', 'asc').get();
    const complaintTypes = [];
    
    for (const doc of snapshot.docs) {
      const typeData = { id: doc.id, ...doc.data() };
      
      // Ajouter les statistiques si demandées
      if (withStats === 'true') {
        typeData.statistics = await getComplaintTypeStatistics(doc.id);
      }
      
      complaintTypes.push(typeData);
    }
    
    res.json({
      success: true,
      data: complaintTypes,
      count: complaintTypes.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des types de plaintes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/types/complaints:
 *   post:
 *     summary: Créer un nouveau type de plainte
 *     tags: [Types de plaintes]
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
 *               sectorId:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [faible, moyenne, elevee, critique]
 *               autoAssignment:
 *                 type: boolean
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Type de plainte créé avec succès
 */
export const createComplaintType = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.CREATE_COMPLAINT_TYPES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const {
      name,
      description,
      sectorId,
      severity = 'moyenne',
      autoAssignment = false,
      icon,
      color
    } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Le nom du type de plainte est requis' });
    }
    
    // Vérifier que le secteur existe si spécifié
    if (sectorId) {
      const sectorDoc = await db.collection('sectors').doc(sectorId).get();
      if (!sectorDoc.exists) {
        return res.status(400).json({ error: 'Secteur non trouvé' });
      }
      
      // Vérifier les permissions sur le secteur
      if (!hasPermission(req.user, UserPermissions.CREATE_COMPLAINT_TYPES, { sectorId })) {
        return res.status(403).json({ error: 'Permission insuffisante pour ce secteur' });
      }
    }
    
    // Vérifier l'unicité du nom
    let uniqueQuery = db.collection('complaintTypes').where('name', '==', name.trim());
    if (sectorId) {
      uniqueQuery = uniqueQuery.where('sectorId', '==', sectorId);
    }
    
    const existingSnapshot = await uniqueQuery.limit(1).get();
    if (!existingSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Un type de plainte avec ce nom existe déjà' + (sectorId ? ' dans ce secteur' : '') 
      });
    }
    
    const complaintTypeData = {
      name: name.trim(),
      description: description?.trim() || '',
      sectorId: sectorId || null,
      severity,
      autoAssignment,
      icon: icon || 'fa-exclamation-triangle',
      color: color || '#f59e0b',
      isActive: true,
      statistics: {
        totalComplaints: 0,
        resolvedComplaints: 0,
        averageResolutionTime: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.uid
    };
    
    const docRef = await db.collection('complaintTypes').add(complaintTypeData);
    
    // Log de l'action
    await logAction('CREATE_COMPLAINT_TYPE', req.user.uid, { 
      typeId: docRef.id, 
      sectorId, 
      name 
    });
    
    res.status(201).json({
      success: true,
      message: 'Type de plainte créé avec succès',
      data: { id: docRef.id, ...complaintTypeData }
    });
  } catch (error) {
    console.error('Erreur lors de la création du type de plainte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/types/complaints/{id}:
 *   put:
 *     summary: Modifier un type de plainte
 *     tags: [Types de plaintes]
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
 *         description: Type de plainte modifié avec succès
 */
export const updateComplaintType = async (req, res) => {
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
    
    const {
      name,
      description,
      severity,
      autoAssignment,
      icon,
      color,
      isActive
    } = req.body;
    
    const updateData = {};
    
    if (name?.trim()) {
      // Vérifier l'unicité du nom si changé
      if (name.trim() !== typeData.name) {
        let uniqueQuery = db.collection('complaintTypes').where('name', '==', name.trim());
        if (typeData.sectorId) {
          uniqueQuery = uniqueQuery.where('sectorId', '==', typeData.sectorId);
        }
        
        const existingSnapshot = await uniqueQuery.limit(1).get();
        if (!existingSnapshot.empty) {
          return res.status(400).json({ 
            error: 'Un type de plainte avec ce nom existe déjà' + (typeData.sectorId ? ' dans ce secteur' : '') 
          });
        }
      }
      updateData.name = name.trim();
    }
    
    if (description !== undefined) updateData.description = description.trim();
    if (severity) updateData.severity = severity;
    if (autoAssignment !== undefined) updateData.autoAssignment = autoAssignment;
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    updateData.updatedAt = new Date().toISOString();
    updateData.updatedBy = req.user.uid;
    
    await db.collection('complaintTypes').doc(id).update(updateData);
    
    // Log de l'action
    await logAction('UPDATE_COMPLAINT_TYPE', req.user.uid, { 
      typeId: id, 
      sectorId: typeData.sectorId,
      changes: updateData 
    });
    
    res.json({
      success: true,
      message: 'Type de plainte modifié avec succès',
      data: updateData
    });
  } catch (error) {
    console.error('Erreur lors de la modification du type de plainte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/types/complaints/{id}:
 *   delete:
 *     summary: Supprimer un type de plainte
 *     tags: [Types de plaintes]
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
 *         description: Type de plainte supprimé avec succès
 */
export const deleteComplaintType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('complaintTypes').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Type de plainte non trouvé' });
    }
    
    const typeData = doc.data();
    
    if (!hasPermission(req.user, UserPermissions.DELETE_COMPLAINT_TYPES, { sectorId: typeData.sectorId })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    // Vérifier s'il y a des plaintes utilisant ce type
    const complaintsSnapshot = await db.collection('complaints')
      .where('complaintTypeId', '==', id)
      .limit(1)
      .get();
    
    if (!complaintsSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer ce type car il est utilisé par des plaintes existantes' 
      });
    }
    
    await db.collection('complaintTypes').doc(id).delete();
    
    // Log de l'action
    await logAction('DELETE_COMPLAINT_TYPE', req.user.uid, { 
      typeId: id, 
      sectorId: typeData.sectorId,
      name: typeData.name 
    });
    
    res.json({
      success: true,
      message: 'Type de plainte supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du type de plainte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ===================== TYPES DE CIBLES =====================

/**
 * @swagger
 * /api/types/targets:
 *   get:
 *     summary: Récupérer tous les types de cibles
 *     tags: [Types de cibles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *     responses:
 *       200:
 *         description: Liste des types de cibles
 */
export const getAllTargetTypes = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_TARGET_TYPES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }

    const { category, active } = req.query;
    
    let query = db.collection('targetTypes');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (active !== undefined) {
      query = query.where('isActive', '==', active === 'true');
    }
    
    const snapshot = await query.orderBy('name', 'asc').get();
    const targetTypes = [];
    
    snapshot.forEach(doc => {
      targetTypes.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({
      success: true,
      data: targetTypes,
      count: targetTypes.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des types de cibles:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/types/targets:
 *   post:
 *     summary: Créer un nouveau type de cible
 *     tags: [Types de cibles]
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
 *               category:
 *                 type: string
 *               icon:
 *                 type: string
 *               examples:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Type de cible créé avec succès
 */
export const createTargetType = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.CREATE_TARGET_TYPES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const {
      name,
      description,
      category,
      icon,
      examples = []
    } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Le nom du type de cible est requis' });
    }
    
    // Vérifier l'unicité du nom
    const existingSnapshot = await db.collection('targetTypes')
      .where('name', '==', name.trim())
      .limit(1)
      .get();
      
    if (!existingSnapshot.empty) {
      return res.status(400).json({ error: 'Un type de cible avec ce nom existe déjà' });
    }
    
    const targetTypeData = {
      name: name.trim(),
      description: description?.trim() || '',
      category: category || 'general',
      icon: icon || 'fa-bullseye',
      examples: Array.isArray(examples) ? examples : [],
      isActive: true,
      statistics: {
        totalComplaints: 0,
        resolvedComplaints: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.uid
    };
    
    const docRef = await db.collection('targetTypes').add(targetTypeData);
    
    // Log de l'action
    await logAction('CREATE_TARGET_TYPE', req.user.uid, { 
      typeId: docRef.id, 
      name 
    });
    
    res.status(201).json({
      success: true,
      message: 'Type de cible créé avec succès',
      data: { id: docRef.id, ...targetTypeData }
    });
  } catch (error) {
    console.error('Erreur lors de la création du type de cible:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/types/targets/{id}:
 *   put:
 *     summary: Modifier un type de cible
 *     tags: [Types de cibles]
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
 *         description: Type de cible modifié avec succès
 */
export const updateTargetType = async (req, res) => {
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
    
    const {
      name,
      description,
      category,
      icon,
      examples,
      isActive
    } = req.body;
    
    const updateData = {};
    
    if (name?.trim()) {
      // Vérifier l'unicité du nom si changé
      if (name.trim() !== typeData.name) {
        const existingSnapshot = await db.collection('targetTypes')
          .where('name', '==', name.trim())
          .limit(1)
          .get();
          
        if (!existingSnapshot.empty) {
          return res.status(400).json({ error: 'Un type de cible avec ce nom existe déjà' });
        }
      }
      updateData.name = name.trim();
    }
    
    if (description !== undefined) updateData.description = description.trim();
    if (category) updateData.category = category;
    if (icon) updateData.icon = icon;
    if (examples) updateData.examples = Array.isArray(examples) ? examples : [];
    if (isActive !== undefined) updateData.isActive = isActive;
    
    updateData.updatedAt = new Date().toISOString();
    updateData.updatedBy = req.user.uid;
    
    await db.collection('targetTypes').doc(id).update(updateData);
    
    // Log de l'action
    await logAction('UPDATE_TARGET_TYPE', req.user.uid, { 
      typeId: id, 
      changes: updateData 
    });
    
    res.json({
      success: true,
      message: 'Type de cible modifié avec succès',
      data: updateData
    });
  } catch (error) {
    console.error('Erreur lors de la modification du type de cible:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/types/targets/{id}:
 *   delete:
 *     summary: Supprimer un type de cible
 *     tags: [Types de cibles]
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
 *         description: Type de cible supprimé avec succès
 */
export const deleteTargetType = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!hasPermission(req.user, UserPermissions.DELETE_TARGET_TYPES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const doc = await db.collection('targetTypes').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Type de cible non trouvé' });
    }
    
    const typeData = doc.data();
    
    // Vérifier s'il y a des plaintes utilisant ce type
    const complaintsSnapshot = await db.collection('complaints')
      .where('targetTypeId', '==', id)
      .limit(1)
      .get();
    
    if (!complaintsSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer ce type car il est utilisé par des plaintes existantes' 
      });
    }
    
    await db.collection('targetTypes').doc(id).delete();
    
    // Log de l'action
    await logAction('DELETE_TARGET_TYPE', req.user.uid, { 
      typeId: id, 
      name: typeData.name 
    });
    
    res.json({
      success: true,
      message: 'Type de cible supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du type de cible:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ===================== FONCTIONS UTILITAIRES =====================

// Calculer les statistiques d'un type de plainte
export const getComplaintTypeStatistics = async (typeId) => {
  try {
    const complaintsSnapshot = await db.collection('complaints')
      .where('complaintTypeId', '==', typeId)
      .get();
    
    const complaints = [];
    complaintsSnapshot.forEach(doc => complaints.push(doc.data()));
    
    // Calculer le temps moyen de résolution
    const resolvedComplaints = complaints.filter(c => c.status === 'resolue' && c.resolvedAt);
    let averageResolutionTime = 0;
    
    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((sum, complaint) => {
        const created = new Date(complaint.createdAt);
        const resolved = new Date(complaint.resolvedAt);
        return sum + (resolved - created);
      }, 0);
      
      averageResolutionTime = Math.round(totalTime / resolvedComplaints.length / (1000 * 60 * 60 * 24)); // En jours
    }
    
    return {
      totalComplaints: complaints.length,
      resolvedComplaints: complaints.filter(c => c.status === 'resolue').length,
      pendingComplaints: complaints.filter(c => c.status === 'en-attente').length,
      inProgressComplaints: complaints.filter(c => c.status === 'en-traitement').length,
      rejectedComplaints: complaints.filter(c => c.status === 'rejetee').length,
      averageResolutionTime
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques du type:', error);
    return {
      totalComplaints: 0,
      resolvedComplaints: 0,
      pendingComplaints: 0,
      inProgressComplaints: 0,
      rejectedComplaints: 0,
      averageResolutionTime: 0
    };
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