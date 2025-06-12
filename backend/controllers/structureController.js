import { db } from '../config/firebase.js';
import { UserPermissions, hasPermission } from '../models/User.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Structure:
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
 *         subSectorId:
 *           type: string
 *         type:
 *           type: string
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             zipCode:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *         contact:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *             website:
 *               type: string
 *             manager:
 *               type: string
 *         isActive:
 *           type: boolean
 *         capacity:
 *           type: number
 *         operatingHours:
 *           type: object
 *         statistics:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Ministere:
 *       type: object
 *       required:
 *         - nom
 *       properties:
 *         id:
 *           type: string
 *         nom:
 *           type: string
 *         description:
 *           type: string
 *         code:
 *           type: string
 *         actif:
 *           type: boolean
 *         contact:
 *           type: object
 *           properties:
 *             telephone:
 *               type: string
 *             email:
 *               type: string
 *             adresse:
 *               type: string
 *         statistiques:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Direction:
 *       type: object
 *       required:
 *         - nom
 *         - ministereId
 *       properties:
 *         id:
 *           type: string
 *         nom:
 *           type: string
 *         ministereId:
 *           type: string
 *         ministereName:
 *           type: string
 *         description:
 *           type: string
 *         code:
 *           type: string
 *         actif:
 *           type: boolean
 *         responsable:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Service:
 *       type: object
 *       required:
 *         - nom
 *         - ministereId
 *         - directionId
 *       properties:
 *         id:
 *           type: string
 *         nom:
 *           type: string
 *         ministereId:
 *           type: string
 *         directionId:
 *           type: string
 *         ministereName:
 *           type: string
 *         directionName:
 *           type: string
 *         description:
 *           type: string
 *         code:
 *           type: string
 *         actif:
 *           type: boolean
 *         responsable:
 *           type: object
 *         localisation:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *             adresse:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/structures:
 *   get:
 *     summary: Récupérer toutes les structures
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sectorId
 *         schema:
 *           type: string
 *         description: Filtrer par secteur
 *       - in: query
 *         name: subSectorId
 *         schema:
 *           type: string
 *         description: Filtrer by sous-secteur
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrer par type
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrer par ville
 *       - in: query
 *         name: withStats
 *         schema:
 *           type: boolean
 *         description: Inclure les statistiques
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page à récupérer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des structures
 */
export const getAllStructures = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_STRUCTURES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }

    const { 
      sectorId, 
      subSectorId, 
      active, 
      type, 
      city, 
      withStats, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = db.collection('structures');
    
    // Filtrer par structures accessibles si utilisateur limité
    if (req.user.accessScope?.structureIds) {
      query = query.where('__name__', 'in', req.user.accessScope.structureIds);
    } else if (req.user.accessScope?.sectorIds) {
      query = query.where('sectorId', 'in', req.user.accessScope.sectorIds);
    }
    
    // Appliquer les filtres
    if (sectorId) {
      query = query.where('sectorId', '==', sectorId);
    }
    
    if (subSectorId) {
      query = query.where('subSectorId', '==', subSectorId);
    }
    
    if (active !== undefined) {
      query = query.where('isActive', '==', active === 'true');
    }
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    if (city) {
      query = query.where('location.city', '==', city);
    }
    
    // Compter le total
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedQuery = query.offset(offset).limit(parseInt(limit));
    
    const snapshot = await paginatedQuery.get();
    const structures = [];
    
    for (const doc of snapshot.docs) {
      const structureData = { id: doc.id, ...doc.data() };
      
      // Ajouter les statistiques si demandées
      if (withStats === 'true') {
        structureData.statistics = await getStructureStatistics(doc.id);
      }
      
      structures.push(structureData);
    }
    
    res.json({
      success: true,
      data: structures,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des structures:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/structures/{id}:
 *   get:
 *     summary: Récupérer une structure par ID
 *     tags: [Structures]
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
 *         description: Détails de la structure
 *       404:
 *         description: Structure non trouvée
 */
export const getStructureById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('structures').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Structure non trouvée' });
    }
    
    const structureData = doc.data();
    
    if (!hasPermission(req.user, UserPermissions.VIEW_STRUCTURES, { 
      structureId: id, 
      sectorId: structureData.sectorId 
    })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const structure = { id: doc.id, ...structureData };
    
    // Ajouter les informations complètes
    structure.statistics = await getStructureStatistics(id);
    structure.sector = await getSectorInfo(structureData.sectorId);
    
    if (structureData.subSectorId) {
      structure.subSector = await getSubSectorInfo(structureData.subSectorId);
    }
    
    res.json({
      success: true,
      data: structure
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la structure:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/structures:
 *   post:
 *     summary: Créer une nouvelle structure
 *     tags: [Structures]
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
 *               subSectorId:
 *                 type: string
 *               type:
 *                 type: string
 *               location:
 *                 type: object
 *               contact:
 *                 type: object
 *               capacity:
 *                 type: number
 *               operatingHours:
 *                 type: object
 *     responses:
 *       201:
 *         description: Structure créée avec succès
 */
export const createStructure = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.CREATE_STRUCTURES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const {
      name,
      description,
      sectorId,
      subSectorId,
      type,
      location,
      contact,
      capacity,
      operatingHours
    } = req.body;
    
    if (!name?.trim() || !sectorId) {
      return res.status(400).json({ error: 'Le nom et l\'ID du secteur sont requis' });
    }
    
    // Vérifier que le secteur existe
    const sectorDoc = await db.collection('sectors').doc(sectorId).get();
    if (!sectorDoc.exists) {
      return res.status(400).json({ error: 'Secteur non trouvé' });
    }
    
    // Vérifier le sous-secteur si spécifié
    if (subSectorId) {
      const subSectorDoc = await db.collection('subSectors').doc(subSectorId).get();
      if (!subSectorDoc.exists || subSectorDoc.data().sectorId !== sectorId) {
        return res.status(400).json({ error: 'Sous-secteur non trouvé ou incompatible avec le secteur' });
      }
    }
    
    // Vérifier les permissions sur le secteur
    if (!hasPermission(req.user, UserPermissions.CREATE_STRUCTURES, { sectorId })) {
      return res.status(403).json({ error: 'Permission insuffisante pour ce secteur' });
    }
    
    // Vérifier l'unicité du nom dans le secteur
    const existingSnapshot = await db.collection('structures')
      .where('sectorId', '==', sectorId)
      .where('name', '==', name.trim())
      .limit(1)
      .get();
      
    if (!existingSnapshot.empty) {
      return res.status(400).json({ error: 'Une structure avec ce nom existe déjà dans ce secteur' });
    }
    
    const structureData = {
      name: name.trim(),
      description: description?.trim() || '',
      sectorId,
      subSectorId: subSectorId || null,
      type: type || 'general',
      location: {
        address: location?.address || '',
        city: location?.city || '',
        zipCode: location?.zipCode || '',
        coordinates: {
          lat: location?.coordinates?.lat || null,
          lng: location?.coordinates?.lng || null
        }
      },
      contact: {
        phone: contact?.phone || '',
        email: contact?.email || '',
        website: contact?.website || '',
        manager: contact?.manager || ''
      },
      isActive: true,
      capacity: capacity || null,
      operatingHours: operatingHours || {},
      statistics: {
        totalComplaints: 0,
        resolvedComplaints: 0,
        pendingComplaints: 0,
        averageResolutionTime: 0,
        satisfactionRating: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.uid
    };
    
    const docRef = await db.collection('structures').add(structureData);
    
    // Mettre à jour les statistiques du secteur et sous-secteur
    await updateSectorStatistics(sectorId);
    if (subSectorId) {
      await updateSubSectorStatistics(subSectorId);
    }
    
    // Log de l'action
    await logAction('CREATE_STRUCTURE', req.user.uid, { 
      structureId: docRef.id, 
      sectorId, 
      subSectorId,
      name 
    });
    
    res.status(201).json({
      success: true,
      message: 'Structure créée avec succès',
      data: { id: docRef.id, ...structureData }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la structure:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/structures/{id}:
 *   put:
 *     summary: Modifier une structure
 *     tags: [Structures]
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
 *         description: Structure modifiée avec succès
 */
export const updateStructure = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('structures').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Structure non trouvée' });
    }
    
    const structureData = doc.data();
    
    if (!hasPermission(req.user, UserPermissions.EDIT_STRUCTURES, { 
      structureId: id, 
      sectorId: structureData.sectorId 
    })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const {
      name,
      description,
      type,
      location,
      contact,
      capacity,
      operatingHours,
      isActive
    } = req.body;
    
    const updateData = {};
    
    if (name?.trim()) {
      // Vérifier l'unicité du nom si changé
      if (name.trim() !== structureData.name) {
        const existingSnapshot = await db.collection('structures')
          .where('sectorId', '==', structureData.sectorId)
          .where('name', '==', name.trim())
          .limit(1)
          .get();
          
        if (!existingSnapshot.empty) {
          return res.status(400).json({ error: 'Une structure avec ce nom existe déjà dans ce secteur' });
        }
      }
      updateData.name = name.trim();
    }
    
    if (description !== undefined) updateData.description = description.trim();
    if (type) updateData.type = type;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (capacity !== undefined) updateData.capacity = capacity;
    
    // Mettre à jour la localisation
    if (location) {
      updateData.location = {
        ...structureData.location,
        ...location
      };
    }
    
    // Mettre à jour les contacts
    if (contact) {
      updateData.contact = {
        ...structureData.contact,
        ...contact
      };
    }
    
    // Mettre à jour les horaires
    if (operatingHours) {
      updateData.operatingHours = {
        ...structureData.operatingHours,
        ...operatingHours
      };
    }
    
    updateData.updatedAt = new Date().toISOString();
    updateData.updatedBy = req.user.uid;
    
    await db.collection('structures').doc(id).update(updateData);
    
    // Log de l'action
    await logAction('UPDATE_STRUCTURE', req.user.uid, { 
      structureId: id, 
      sectorId: structureData.sectorId,
      changes: updateData 
    });
    
    res.json({
      success: true,
      message: 'Structure modifiée avec succès',
      data: updateData
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la structure:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/structures/{id}:
 *   delete:
 *     summary: Supprimer une structure
 *     tags: [Structures]
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
 *         description: Structure supprimée avec succès
 */
export const deleteStructure = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('structures').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Structure non trouvée' });
    }
    
    const structureData = doc.data();
    
    if (!hasPermission(req.user, UserPermissions.DELETE_STRUCTURES, { 
      structureId: id, 
      sectorId: structureData.sectorId 
    })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    // Vérifier s'il y a des plaintes liées
    const complaintsSnapshot = await db.collection('complaints')
      .where('structureId', '==', id)
      .limit(1)
      .get();
    
    if (!complaintsSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette structure car elle contient des plaintes' 
      });
    }
    
    await db.collection('structures').doc(id).delete();
    
    // Mettre à jour les statistiques du secteur et sous-secteur
    await updateSectorStatistics(structureData.sectorId);
    if (structureData.subSectorId) {
      await updateSubSectorStatistics(structureData.subSectorId);
    }
    
    // Log de l'action
    await logAction('DELETE_STRUCTURE', req.user.uid, { 
      structureId: id, 
      sectorId: structureData.sectorId,
      name: structureData.name 
    });
    
    res.json({
      success: true,
      message: 'Structure supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la structure:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/structures/{id}/toggle:
 *   put:
 *     summary: Activer/désactiver une structure
 *     tags: [Structures]
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
 *         description: Statut de la structure modifié
 */
export const toggleStructureStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('structures').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Structure non trouvée' });
    }
    
    const structureData = doc.data();
    
    if (!hasPermission(req.user, UserPermissions.ACTIVATE_STRUCTURES, { 
      structureId: id, 
      sectorId: structureData.sectorId 
    })) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const isActive = !structureData.isActive;
    
    await db.collection('structures').doc(id).update({
      isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid
    });
    
    // Log de l'action
    await logAction('TOGGLE_STRUCTURE', req.user.uid, { 
      structureId: id, 
      sectorId: structureData.sectorId,
      isActive 
    });
    
    res.json({
      success: true,
      message: `Structure ${isActive ? 'activée' : 'désactivée'} avec succès`,
      data: { isActive }
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/structures/search:
 *   get:
 *     summary: Rechercher des structures
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: sectorId
 *         schema:
 *           type: string
 *         description: Filtrer par secteur
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Recherche par localisation
 *     responses:
 *       200:
 *         description: Résultats de recherche
 */
export const searchStructures = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_STRUCTURES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const { q, sectorId, location } = req.query;
    
    if (!q?.trim()) {
      return res.status(400).json({ error: 'Terme de recherche requis' });
    }
    
    let query = db.collection('structures');
    
    // Filtres contextuels
    if (req.user.accessScope?.structureIds) {
      query = query.where('__name__', 'in', req.user.accessScope.structureIds);
    } else if (req.user.accessScope?.sectorIds) {
      query = query.where('sectorId', 'in', req.user.accessScope.sectorIds);
    }
    
    if (sectorId) {
      query = query.where('sectorId', '==', sectorId);
    }
    
    const snapshot = await query.get();
    const structures = [];
    
    const searchTerm = q.toLowerCase();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const structure = { id: doc.id, ...data };
      
      // Recherche dans le nom, description, ville, manager
      const searchableText = [
        data.name,
        data.description,
        data.location?.city,
        data.location?.address,
        data.contact?.manager,
        data.type
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (searchableText.includes(searchTerm)) {
        if (!location || (data.location?.city?.toLowerCase().includes(location.toLowerCase()))) {
          structures.push(structure);
        }
      }
    });
    
    // Trier by pertinence (nom exact d'abord)
    structures.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(searchTerm);
      const bNameMatch = b.name.toLowerCase().includes(searchTerm);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      return a.name.localeCompare(b.name);
    });
    
    res.json({
      success: true,
      data: structures.slice(0, 50), // Limiter à 50 résultats
      count: structures.length,
      query: q
    });
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/structures/nearby:
 *   get:
 *     summary: Trouver les structures à proximité
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Rayon en kilomètres
 *       - in: query
 *         name: sectorId
 *         schema:
 *           type: string
 *         description: Filtrer par secteur
 *     responses:
 *       200:
 *         description: Structures à proximité
 */
export const getNearbyStructures = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_STRUCTURES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const { lat, lng, radius = 10, sectorId } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Coordonnées requises' });
    }
    
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);
    
    let query = db.collection('structures');
    
    if (sectorId) {
      query = query.where('sectorId', '==', sectorId);
    }
    
    const snapshot = await query.get();
    const nearbyStructures = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const coords = data.location?.coordinates;
      
      if (coords?.lat && coords?.lng) {
        const distance = calculateDistance(userLat, userLng, coords.lat, coords.lng);
        
        if (distance <= searchRadius) {
          nearbyStructures.push({
            id: doc.id,
            ...data,
            distance: Math.round(distance * 100) / 100 // Arrondir à 2 décimales
          });
        }
      }
    });
    
    // Trier by distance
    nearbyStructures.sort((a, b) => a.distance - b.distance);
    
    res.json({
      success: true,
      data: nearbyStructures,
      count: nearbyStructures.length,
      center: { lat: userLat, lng: userLng },
      radius: searchRadius
    });
  } catch (error) {
    console.error('Erreur lors de la recherche à proximité:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ===================== FONCTIONS UTILITAIRES =====================

// Calculer les statistiques d'une structure
export const getStructureStatistics = async (structureId) => {
  try {
    const complaintsSnapshot = await db.collection('complaints')
      .where('structureId', '==', structureId)
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
    
    // Calculer la note de satisfaction moyenne
    const ratedComplaints = complaints.filter(c => c.satisfactionRating > 0);
    const satisfactionRating = ratedComplaints.length > 0 
      ? ratedComplaints.reduce((sum, c) => sum + c.satisfactionRating, 0) / ratedComplaints.length
      : 0;
    
    return {
      totalComplaints: complaints.length,
      resolvedComplaints: complaints.filter(c => c.status === 'resolue').length,
      pendingComplaints: complaints.filter(c => c.status === 'en-attente').length,
      inProgressComplaints: complaints.filter(c => c.status === 'en-traitement').length,
      rejectedComplaints: complaints.filter(c => c.status === 'rejetee').length,
      averageResolutionTime,
      satisfactionRating: Math.round(satisfactionRating * 10) / 10
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques de la structure:', error);
    return {
      totalComplaints: 0,
      resolvedComplaints: 0,
      pendingComplaints: 0,
      inProgressComplaints: 0,
      rejectedComplaints: 0,
      averageResolutionTime: 0,
      satisfactionRating: 0
    };
  }
};

// Récupérer les informations d'un secteur
export const getSectorInfo = async (sectorId) => {
  try {
    const doc = await db.collection('sectors').doc(sectorId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du secteur:', error);
    return null;
  }
};

// Récupérer les informations d'un sous-secteur
export const getSubSectorInfo = async (subSectorId) => {
  try {
    const doc = await db.collection('subSectors').doc(subSectorId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du sous-secteur:', error);
    return null;
  }
};

// Mettre à jour les statistiques d'un secteur
const updateSectorStatistics = async (sectorId) => {
  // Cette fonction sera importée du sectorController
  // Pour éviter les dépendances circulaires, on peut l'implémenter ici aussi
  try {
    const [complaintsSnapshot, structuresSnapshot, subSectorsSnapshot] = await Promise.all([
      db.collection('complaints').where('sectorId', '==', sectorId).get(),
      db.collection('structures').where('sectorId', '==', sectorId).get(),
      db.collection('subSectors').where('sectorId', '==', sectorId).get()
    ]);
    
    const complaints = [];
    complaintsSnapshot.forEach(doc => complaints.push(doc.data()));
    
    const statistics = {
      totalComplaints: complaints.length,
      resolvedComplaints: complaints.filter(c => c.status === 'resolue').length,
      pendingComplaints: complaints.filter(c => c.status === 'en-attente').length,
      inProgressComplaints: complaints.filter(c => c.status === 'en-traitement').length,
      rejectedComplaints: complaints.filter(c => c.status === 'rejetee').length,
      structures: structuresSnapshot.size,
      subSectors: subSectorsSnapshot.size
    };
    
    await db.collection('sectors').doc(sectorId).update({
      statistics,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques du secteur:', error);
  }
};

// Mettre à jour les statistiques d'un sous-secteur
const updateSubSectorStatistics = async (subSectorId) => {
  try {
    const [complaintsSnapshot, structuresSnapshot] = await Promise.all([
      db.collection('complaints').where('subSectorId', '==', subSectorId).get(),
      db.collection('structures').where('subSectorId', '==', subSectorId).get()
    ]);
    
    const complaints = [];
    complaintsSnapshot.forEach(doc => complaints.push(doc.data()));
    
    const statistics = {
      totalComplaints: complaints.length,
      resolvedComplaints: complaints.filter(c => c.status === 'resolue').length,
      pendingComplaints: complaints.filter(c => c.status === 'en-attente').length,
      structures: structuresSnapshot.size
    };
    
    await db.collection('subSectors').doc(subSectorId).update({
      statistics,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques du sous-secteur:', error);
  }
};

// Calculer la distance entre deux points GPS
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

// ===================== MINISTÈRES =====================

/**
 * @swagger
 * /api/structures/ministeres:
 *   get:
 *     summary: Récupérer tous les ministères
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: actif
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *       - in: query
 *         name: withStats
 *         schema:
 *           type: boolean
 *         description: Inclure les statistiques
 *     responses:
 *       200:
 *         description: Liste des ministères
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
 *                     $ref: '#/components/schemas/Ministere'
 */
export const getAllMinisteres = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_STRUCTURES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }

    const { actif, withStats } = req.query;
    
          let query = db.collection('ministeres');
    
    if (actif !== undefined) {
      query = query.where('actif', '==', actif === 'true');
    }
    
    const snapshot = await query.orderBy('nom', 'asc').get();
    const ministeres = [];
    
    for (const doc of snapshot.docs) {
      const ministereData = { id: doc.id, ...doc.data() };
      
      // Ajouter les statistiques si demandées
      if (withStats === 'true') {
        ministereData.statistiques = await getMinistereStatistics(doc.id);
      }
      
      ministeres.push(ministereData);
    }
    
    res.json({
      success: true,
      data: ministeres,
      count: ministeres.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ministères:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/structures/ministeres:
 *   post:
 *     summary: Créer un nouveau ministère
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Ministère de l'Éducation Nationale"
 *               description:
 *                 type: string
 *               code:
 *                 type: string
 *                 example: "MEN"
 *               contact:
 *                 type: object
 *                 properties:
 *                   telephone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   adresse:
 *                     type: string
 *     responses:
 *       201:
 *         description: Ministère créé avec succès
 */
export const createMinistere = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.CREATE_STRUCTURES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const { nom, description, code, contact } = req.body;
    
    if (!nom?.trim()) {
      return res.status(400).json({ error: 'Le nom du ministère est requis' });
    }
    
    // Vérifier l'unicité du nom
          const existingSnapshot = await db.collection('ministeres')
      .where('nom', '==', nom.trim())
      .limit(1)
      .get();
    
    if (!existingSnapshot.empty) {
      return res.status(400).json({ error: 'Un ministère avec ce nom existe déjà' });
    }
    
    // Vérifier l'unicité du code si fourni
    if (code) {
      const existingCodeSnapshot = await db.collection('ministères')
        .where('code', '==', code.trim().toUpperCase())
        .limit(1)
        .get();
      
      if (!existingCodeSnapshot.empty) {
        return res.status(400).json({ error: 'Un ministère avec ce code existe déjà' });
      }
    }
    
    const ministereData = {
      nom: nom.trim(),
      description: description?.trim() || '',
      code: code?.trim().toUpperCase() || '',
      actif: true,
      contact: contact || {},
      statistiques: {
        nombreDirections: 0,
        nombreServices: 0,
        nombrePlaintes: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.uid
    };
    
    const docRef = await db.collection('ministères').add(ministereData);
    
    res.status(201).json({
      success: true,
      message: 'Ministère créé avec succès',
      data: { id: docRef.id, ...ministereData }
    });
  } catch (error) {
    console.error('Erreur lors de la création du ministère:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ===================== DIRECTIONS =====================

/**
 * @swagger
 * /api/structures/ministeres/{ministereId}/directions:
 *   get:
 *     summary: Récupérer les directions d'un ministère
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ministereId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: actif
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *     responses:
 *       200:
 *         description: Liste des directions
 */
export const getDirectionsByMinistere = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_STRUCTURES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }

    const { ministereId } = req.params;
    const { actif } = req.query;
    
    // Vérifier que le ministère existe
    const ministereDoc = await db.collection('ministères').doc(ministereId).get();
    if (!ministereDoc.exists) {
      return res.status(404).json({ error: 'Ministère non trouvé' });
    }
    
    let query = db.collection('directions').where('ministereId', '==', ministereId);
    
    if (actif !== undefined) {
      query = query.where('actif', '==', actif === 'true');
    }
    
    const snapshot = await query.orderBy('nom', 'asc').get();
    const directions = [];
    
    snapshot.forEach(doc => {
      directions.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({
      success: true,
      data: directions,
      count: directions.length,
      ministere: { id: ministereDoc.id, nom: ministereDoc.data().nom }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des directions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/structures/directions:
 *   post:
 *     summary: Créer une nouvelle direction
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - ministereId
 *             properties:
 *               nom:
 *                 type: string
 *               ministereId:
 *                 type: string
 *               description:
 *                 type: string
 *               code:
 *                 type: string
 *               responsable:
 *                 type: object
 *     responses:
 *       201:
 *         description: Direction créée avec succès
 */
export const createDirection = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.CREATE_STRUCTURES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const { nom, ministereId, description, code, responsable } = req.body;
    
    if (!nom?.trim() || !ministereId) {
      return res.status(400).json({ 
        error: 'Le nom de la direction et l\'ID du ministère sont requis' 
      });
    }
    
    // Vérifier que le ministère existe
    const ministereDoc = await db.collection('ministères').doc(ministereId).get();
    if (!ministereDoc.exists) {
      return res.status(400).json({ error: 'Ministère non trouvé' });
    }
    
    // Vérifier l'unicité du nom dans le ministère
    const existingSnapshot = await db.collection('directions')
      .where('nom', '==', nom.trim())
      .where('ministereId', '==', ministereId)
      .limit(1)
      .get();
    
    if (!existingSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Une direction avec ce nom existe déjà dans ce ministère' 
      });
    }
    
    const directionData = {
      nom: nom.trim(),
      ministereId,
      ministereName: ministereDoc.data().nom,
      description: description?.trim() || '',
      code: code?.trim().toUpperCase() || '',
      actif: true,
      responsable: responsable || {},
      statistiques: {
        nombreServices: 0,
        nombrePlaintes: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.uid
    };
    
    const docRef = await db.collection('directions').add(directionData);
    
    // Mettre à jour les statistiques du ministère
    await updateMinistereStats(ministereId);
    
    res.status(201).json({
      success: true,
      message: 'Direction créée avec succès',
      data: { id: docRef.id, ...directionData }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la direction:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ===================== SERVICES =====================

/**
 * @swagger
 * /api/structures/directions/{directionId}/services:
 *   get:
 *     summary: Récupérer les services d'une direction
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: directionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: actif
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *     responses:
 *       200:
 *         description: Liste des services
 */
export const getServicesByDirection = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_STRUCTURES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }

    const { directionId } = req.params;
    const { actif } = req.query;
    
    // Vérifier que la direction existe
    const directionDoc = await db.collection('directions').doc(directionId).get();
    if (!directionDoc.exists) {
      return res.status(404).json({ error: 'Direction non trouvée' });
    }
    
    let query = db.collection('services').where('directionId', '==', directionId);
    
    if (actif !== undefined) {
      query = query.where('actif', '==', actif === 'true');
    }
    
    const snapshot = await query.orderBy('nom', 'asc').get();
    const services = [];
    
    snapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });
    
    const directionData = directionDoc.data();
    
    res.json({
      success: true,
      data: services,
      count: services.length,
      direction: { 
        id: directionDoc.id, 
        nom: directionData.nom,
        ministereId: directionData.ministereId,
        ministereName: directionData.ministereName
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/structures/ministeres/{ministereId}/directions/{directionId}/services:
 *   get:
 *     summary: Récupérer les services d'une direction avec filtrage par ministère
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ministereId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: directionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des services
 */
export const getServicesByMinistereAndDirection = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.VIEW_STRUCTURES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }

    const { ministereId, directionId } = req.params;
    const { actif } = req.query;
    
    let query = db.collection('services')
      .where('ministereId', '==', ministereId)
      .where('directionId', '==', directionId);
    
    if (actif !== undefined) {
      query = query.where('actif', '==', actif === 'true');
    }
    
    const snapshot = await query.orderBy('nom', 'asc').get();
    const services = [];
    
    snapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/structures/services:
 *   post:
 *     summary: Créer un nouveau service
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - ministereId
 *               - directionId
 *             properties:
 *               nom:
 *                 type: string
 *               ministereId:
 *                 type: string
 *               directionId:
 *                 type: string
 *               description:
 *                 type: string
 *               code:
 *                 type: string
 *               responsable:
 *                 type: object
 *               localisation:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   adresse:
 *                     type: string
 *     responses:
 *       201:
 *         description: Service créé avec succès
 */
export const createService = async (req, res) => {
  try {
    if (!hasPermission(req.user, UserPermissions.CREATE_STRUCTURES)) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    const { 
      nom, 
      ministereId, 
      directionId, 
      description, 
      code, 
      responsable, 
      localisation 
    } = req.body;
    
    if (!nom?.trim() || !ministereId || !directionId) {
      return res.status(400).json({ 
        error: 'Le nom du service, l\'ID du ministère et l\'ID de la direction sont requis' 
      });
    }
    
    // Vérifier que le ministère et la direction existent
    const [ministereDoc, directionDoc] = await Promise.all([
      db.collection('ministères').doc(ministereId).get(),
      db.collection('directions').doc(directionId).get()
    ]);
    
    if (!ministereDoc.exists) {
      return res.status(400).json({ error: 'Ministère non trouvé' });
    }
    
    if (!directionDoc.exists) {
      return res.status(400).json({ error: 'Direction non trouvée' });
    }
    
    // Vérifier que la direction appartient au ministère
    if (directionDoc.data().ministereId !== ministereId) {
      return res.status(400).json({ 
        error: 'La direction ne correspond pas au ministère' 
      });
    }
    
    // Vérifier l'unicité du nom dans la direction
    const existingSnapshot = await db.collection('services')
      .where('nom', '==', nom.trim())
      .where('directionId', '==', directionId)
      .limit(1)
      .get();
    
    if (!existingSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Un service avec ce nom existe déjà dans cette direction' 
      });
    }
    
    const serviceData = {
      nom: nom.trim(),
      ministereId,
      directionId,
      ministereName: ministereDoc.data().nom,
      directionName: directionDoc.data().nom,
      description: description?.trim() || '',
      code: code?.trim().toUpperCase() || '',
      actif: true,
      responsable: responsable || {},
      localisation: localisation || {},
      statistiques: {
        nombrePlaintes: 0,
        nombrePlaintesResolues: 0,
        tempsReponseResolute: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.uid
    };
    
    const docRef = await db.collection('services').add(serviceData);
    
    // Mettre à jour les statistiques de la direction et du ministère
    await Promise.all([
      updateDirectionStats(directionId),
      updateMinistereStats(ministereId)
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Service créé avec succès',
      data: { id: docRef.id, ...serviceData }
    });
  } catch (error) {
    console.error('Erreur lors de la création du service:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ===================== FONCTIONS UTILITAIRES =====================

async function getMinistereStatistics(ministereId) {
  try {
    const [directionsSnapshot, servicesSnapshot, complaintsSnapshot] = await Promise.all([
      db.collection('directions').where('ministereId', '==', ministereId).get(),
      db.collection('services').where('ministereId', '==', ministereId).get(),
      db.collection('complaints').where('publicStructure.ministereId', '==', ministereId).get()
    ]);
    
    return {
      nombreDirections: directionsSnapshot.size,
      nombreServices: servicesSnapshot.size,
      nombrePlaintes: complaintsSnapshot.size
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques ministère:', error);
    return { nombreDirections: 0, nombreServices: 0, nombrePlaintes: 0 };
  }
}

async function updateMinistereStats(ministereId) {
  try {
    const stats = await getMinistereStatistics(ministereId);
    await db.collection('ministères').doc(ministereId).update({
      statistiques: stats,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des stats ministère:', error);
  }
}

async function updateDirectionStats(directionId) {
  try {
    const servicesSnapshot = await db.collection('services')
      .where('directionId', '==', directionId)
      .where('actif', '==', true)
      .get();
    
    await db.collection('directions').doc(directionId).update({
      'statistiques.nombreServices': servicesSnapshot.size,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur mise à jour stats direction:', error);
  }
}

/**
 * @swagger
 * /api/structures/export:
 *   get:
 *     summary: Exporter les structures
 *     tags: [Structures]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         description: "Format d'export (défaut: json)"
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
 *     responses:
 *       200:
 *         description: Export réussi
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
 *                     $ref: '#/components/schemas/Structure'
 *                 exportInfo:
 *                   type: object
 *           text/csv:
 *             schema:
 *               type: string
 *       403:
 *         description: Permission insuffisante
 *       500:
 *         description: Erreur serveur
 */
export const exportStructures = async (req, res) => {
  try {
    const { format = 'json', sectorId, active } = req.query;
    const userId = req.user?.uid;

    // Vérifier les permissions
    if (!hasPermission(req.user, UserPermissions.EXPORT_DATA)) {
      return res.status(403).json({
        success: false,
        message: 'Permission insuffisante pour exporter les données'
      });
    }

    // Construire la requête
    let query = db.collection('structures');

    if (sectorId) {
      query = query.where('sectorId', '==', sectorId);
    }

    if (active !== undefined) {
      query = query.where('isActive', '==', active === 'true');
    }

    // Exécuter la requête
    const snapshot = await query.orderBy('name').get();
    
    const structures = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Log de l'action
    await logAction('EXPORT_STRUCTURES', userId, {
      format,
      count: structures.length,
      filters: { sectorId, active }
    });

    if (format === 'csv') {
      // Export CSV
      const csvHeaders = [
        'ID',
        'Nom',
        'Description',
        'Secteur ID',
        'Sous-secteur ID',
        'Type',
        'Ville',
        'Adresse',
        'Téléphone',
        'Email',
        'Actif',
        'Date création'
      ];

      const csvRows = structures.map(structure => [
        structure.id,
        structure.name || '',
        structure.description || '',
        structure.sectorId || '',
        structure.subSectorId || '',
        structure.type || '',
        structure.location?.city || '',
        structure.location?.address || '',
        structure.contact?.phone || '',
        structure.contact?.email || '',
        structure.isActive ? 'Oui' : 'Non',
        structure.createdAt || ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="structures_${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csvContent);
    }

    // Export JSON (défaut)
    res.json({
      success: true,
      data: structures,
      exportInfo: {
        format,
        count: structures.length,
        exportedAt: new Date().toISOString(),
        exportedBy: userId,
        filters: { sectorId, active }
      }
    });

  } catch (error) {
    console.error('Erreur export structures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export des structures',
      error: error.message
    });
  }
}; 