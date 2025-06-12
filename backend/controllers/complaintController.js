import { db } from '../config/firebase.js';
import { UserPermissions, hasPermission } from '../models/User.js';
import { 
  ComplaintStatus, 
  ComplaintPriority, 
  ComplaintTypes, 
  TargetTypes, 
  SubmissionTypes,
  validateSenegalPhoneNumber,
  validateEmail 
} from '../models/Complaint.js';

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Obtenir toutes les plaintes
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [en-attente, en-traitement, resolue, rejetee]
 *         description: Filtrer par statut
 *       - in: query
 *         name: complaintType
 *         schema:
 *           type: string
 *         description: Filtrer par type de plainte
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *         description: Filtrer par type de cible
 *       - in: query
 *         name: ministereId
 *         schema:
 *           type: string
 *         description: Filtrer par ministère
 *       - in: query
 *         name: isDraft
 *         schema:
 *           type: boolean
 *         description: Filtrer les brouillons
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre de résultats
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page de résultats
 *     responses:
 *       200:
 *         description: Liste des plaintes
 */
export const getComplaints = async (req, res) => {
  try {
    const { 
      status, 
      complaintType,
      targetType,
      ministereId, 
      priority, 
      isDraft = false,
      limit = 50, 
      page = 1,
      assignedTo 
    } = req.query;
    
    if (!hasPermission(req.user, UserPermissions.VIEW_COMPLAINTS)) {
      return res.status(403).json({ 
        error: 'Permission insuffisante pour voir les plaintes' 
      });
    }
    
    let query = db.collection('complaints');
    
    // Filtres
    if (status) query = query.where('status', '==', status);
    if (complaintType) query = query.where('complaintType', '==', complaintType);
    if (targetType) query = query.where('targetType', '==', targetType);
    if (priority) query = query.where('priority', '==', priority);
    if (assignedTo) query = query.where('assignedTo', '==', assignedTo);
    if (ministereId) query = query.where('publicStructure.ministereId', '==', ministereId);
    
    // Filtrer par brouillons ou plaintes finalisées
    query = query.where('isDraft', '==', isDraft === 'true');
    
    // Si l'utilisateur n'est pas admin, ne montrer que ses plaintes
    if (!hasPermission(req.user, UserPermissions.MANAGE_COMPLAINTS)) {
      query = query.where('submittedBy', '==', req.user.uid);
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    query = query.orderBy('createdAt', 'desc').limit(parseInt(limit)).offset(offset);
    
    const snapshot = await query.get();
    const complaints = [];
    snapshot.forEach(doc => {
      complaints.push({ id: doc.id, ...doc.data() });
    });
    
    // Compter le total pour la pagination
    let countQuery = db.collection('complaints');
    if (status) countQuery = countQuery.where('status', '==', status);
    if (complaintType) countQuery = countQuery.where('complaintType', '==', complaintType);
    if (targetType) countQuery = countQuery.where('targetType', '==', targetType);
    if (priority) countQuery = countQuery.where('priority', '==', priority);
    if (ministereId) countQuery = countQuery.where('publicStructure.ministereId', '==', ministereId);
    countQuery = countQuery.where('isDraft', '==', isDraft === 'true');
    
    if (!hasPermission(req.user, UserPermissions.MANAGE_COMPLAINTS)) {
      countQuery = countQuery.where('submittedBy', '==', req.user.uid);
    }
    
    const countSnapshot = await countQuery.get();
    const total = countSnapshot.size;
    
    res.json({
      success: true,
      complaints,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des plaintes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Créer une nouvelle plainte (workflow mobile)
 *     tags: [Plaintes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - complaintType
 *               - targetType
 *               - description
 *               - location
 *               - submissionTypes
 *             properties:
 *               complaintType:
 *                 type: string
 *                 enum: ["Retard de paiement", "Prestation insatisfaisante", "Problème administratif", "Autre"]
 *                 example: "Retard de paiement"
 *               targetType:
 *                 type: string
 *                 enum: ["Structure publique", "Structure privée", "Particulier"]
 *                 example: "Structure publique"
 *               submissionTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: ["Vocal", "Exposé", "Suite exposé"]
 *                 example: ["Exposé"]
 *               description:
 *                 type: string
 *                 example: "Description détaillée du problème"
 *               location:
 *                 type: object
 *                 required: [latitude, longitude]
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 14.6937
 *                   longitude:
 *                     type: number
 *                     example: -17.4441
 *                   address:
 *                     type: string
 *                     example: "Dakar, Sénégal"
 *               publicStructure:
 *                 type: object
 *                 properties:
 *                   ministereId:
 *                     type: string
 *                   ministereName:
 *                     type: string
 *                   directionId:
 *                     type: string
 *                   directionName:
 *                     type: string
 *                   serviceId:
 *                     type: string
 *                   serviceName:
 *                     type: string
 *               privateStructure:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *               mediaFiles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [image, audio]
 *                     url:
 *                       type: string
 *                     filename:
 *                       type: string
 *                     size:
 *                       type: number
 *                     mimeType:
 *                       type: string
 *               vocalRecording:
 *                 type: object
 *                 properties:
 *                   url:
 *                     type: string
 *                   duration:
 *                     type: number
 *                   filename:
 *                     type: string
 *               isDraft:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Plainte créée avec succès
 *       400:
 *         description: Données invalides
 */
export const createComplaint = async (req, res) => {
  try {
    const { 
      complaintType,
      targetType,
      submissionTypes = [],
      description,
      location,
      publicStructure,
      privateStructure,
      mediaFiles = [],
      vocalRecording,
      priority = ComplaintPriority.MEDIUM,
      isDraft = false,
      tags = []
    } = req.body;
    
    // Validation des données requises
    if (!complaintType || !Object.values(ComplaintTypes).includes(complaintType)) {
      return res.status(400).json({ 
        error: 'Type de plainte requis et valide' 
      });
    }
    
    if (!targetType || !Object.values(TargetTypes).includes(targetType)) {
      return res.status(400).json({ 
        error: 'Type de cible requis et valide' 
      });
    }
    
    if (!description || description.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Description requise' 
      });
    }
    
    if (!isDraft) {
      // Validation stricte pour les plaintes finalisées
      if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        return res.status(400).json({ 
          error: 'Localisation GPS requise' 
        });
      }
      
      if (!submissionTypes || submissionTypes.length === 0) {
        return res.status(400).json({ 
          error: 'Au moins un type de soumission requis' 
        });
      }
      
      // Validation selon le type de cible
      if (targetType === TargetTypes.PUBLIC_STRUCTURE) {
        if (!publicStructure?.ministereId || !publicStructure?.directionId || !publicStructure?.serviceId) {
          return res.status(400).json({ 
            error: 'Ministère, direction et service requis pour une structure publique' 
          });
        }
      } else if (targetType === TargetTypes.PRIVATE_STRUCTURE) {
        if (!privateStructure?.name || !privateStructure?.phone || !privateStructure?.email) {
          return res.status(400).json({ 
            error: 'Nom, téléphone et email requis pour une structure privée' 
          });
        }
        
        // Validation du téléphone sénégalais
        if (!validateSenegalPhoneNumber(privateStructure.phone)) {
          return res.status(400).json({ 
            error: 'Numéro de téléphone invalide (doit contenir 9 chiffres et commencer par 70, 76, 77 ou 78)' 
          });
        }
        
        // Validation de l'email
        if (!validateEmail(privateStructure.email)) {
          return res.status(400).json({ 
            error: 'Adresse email invalide' 
          });
        }
      }
      
      // Validation des médias
      const imageFiles = mediaFiles.filter(f => f.type === 'image');
      if (imageFiles.length > 5) {
        return res.status(400).json({ 
          error: 'Maximum 5 images autorisées' 
        });
      }
      
      // Validation de l'enregistrement vocal si présent
      if (submissionTypes.includes(SubmissionTypes.VOCAL)) {
        if (!vocalRecording || !vocalRecording.url || !vocalRecording.duration) {
          return res.status(400).json({ 
            error: 'Enregistrement vocal requis pour le type "Vocal"' 
          });
        }
      }
    }
    
    // Créer le titre basé sur le type de plainte
    const title = complaintType;
    
    const complaintData = {
      title,
      description: description.trim(),
      complaintType,
      targetType,
      submissionTypes,
      location,
      publicStructure: targetType === TargetTypes.PUBLIC_STRUCTURE ? publicStructure : null,
      privateStructure: targetType === TargetTypes.PRIVATE_STRUCTURE ? privateStructure : null,
      mediaFiles,
      vocalRecording: submissionTypes.includes(SubmissionTypes.VOCAL) ? vocalRecording : null,
      status: isDraft ? ComplaintStatus.PENDING : ComplaintStatus.PENDING,
      priority,
      isDraft,
      tags,
      submittedBy: req.user.uid,
      assignedTo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      comments: [],
      history: [{
        action: isDraft ? 'DRAFT_CREATED' : 'COMPLAINT_CREATED',
        userId: req.user.uid,
        timestamp: new Date().toISOString(),
        changes: { complaintType, targetType, submissionTypes }
      }]
    };
    
    const docRef = await db.collection('complaints').add(complaintData);
    
    res.status(201).json({
      success: true,
      message: isDraft ? 'Brouillon sauvegardé avec succès' : 'Plainte créée avec succès',
      complaint: { id: docRef.id, ...complaintData }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la plainte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/complaints/{id}/finalize:
 *   put:
 *     summary: Finaliser un brouillon de plainte
 *     tags: [Plaintes]
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
 *         description: Brouillon finalisé avec succès
 */
export const finalizeDraft = async (req, res) => {
  try {
    const { id } = req.params;
    
    const complaintDoc = await db.collection('complaints').doc(id).get();
    if (!complaintDoc.exists) {
      return res.status(404).json({ error: 'Plainte non trouvée' });
    }
    
    const complaint = complaintDoc.data();
    
    // Vérifier que c'est le propriétaire
    if (complaint.submittedBy !== req.user.uid) {
      return res.status(403).json({ error: 'Permission insuffisante' });
    }
    
    // Vérifier que c'est bien un brouillon
    if (!complaint.isDraft) {
      return res.status(400).json({ error: 'Cette plainte n\'est pas un brouillon' });
    }
    
    // Validation finale avant finalisation
    if (!complaint.location?.latitude || !complaint.location?.longitude) {
      return res.status(400).json({ error: 'Localisation GPS requise pour finaliser' });
    }
    
    if (!complaint.submissionTypes || complaint.submissionTypes.length === 0) {
      return res.status(400).json({ error: 'Au moins un type de soumission requis' });
    }
    
    const updateData = {
      isDraft: false,
      updatedAt: new Date().toISOString(),
      history: [
        ...complaint.history,
        {
          action: 'DRAFT_FINALIZED',
          userId: req.user.uid,
          timestamp: new Date().toISOString(),
          changes: { isDraft: false }
        }
      ]
    };
    
    await db.collection('complaints').doc(id).update(updateData);
    
    res.json({
      success: true,
      message: 'Brouillon finalisé avec succès',
      data: updateData
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation du brouillon:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/complaints/types:
 *   get:
 *     summary: Obtenir les types de plaintes disponibles
 *     tags: [Plaintes]
 *     responses:
 *       200:
 *         description: Liste des types de plaintes
 */
export const getComplaintTypes = async (req, res) => {
  try {
    res.json({
      success: true,
      complaintTypes: Object.values(ComplaintTypes),
      targetTypes: Object.values(TargetTypes),
      submissionTypes: Object.values(SubmissionTypes)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des types:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/complaints/{id}/status:
 *   put:
 *     summary: Modifier le statut d'une plainte
 *     tags: [Plaintes]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [en-attente, en-traitement, resolue, rejetee]
 *               comment:
 *                 type: string
 *                 description: Commentaire sur le changement de statut
 *               assignedTo:
 *                 type: string
 *                 description: UID de l'agent assigné
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
 *       403:
 *         description: Permission insuffisante
 *       404:
 *         description: Plainte non trouvée
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, assignedTo } = req.body;
    
    if (!hasPermission(req.user, UserPermissions.MANAGE_COMPLAINTS)) {
      return res.status(403).json({ 
        error: 'Permission insuffisante pour modifier le statut des plaintes' 
      });
    }
    
    const complaintDoc = await db.collection('complaints').doc(id).get();
    if (!complaintDoc.exists) {
      return res.status(404).json({ error: 'Plainte non trouvée' });
    }
    
    const complaint = complaintDoc.data();
    
    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid
    };
    
    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }
    
    if (status === ComplaintStatus.RESOLVED || status === ComplaintStatus.REJECTED) {
      updateData.resolvedAt = new Date().toISOString();
    }
    
    // Ajouter un commentaire si fourni
    if (comment) {
      const newComment = {
        id: `comment_${Date.now()}`,
        text: comment,
        authorId: req.user.uid,
        authorName: req.user.displayName || req.user.email,
        createdAt: new Date().toISOString(),
        isInternal: true
      };
      
      updateData.comments = [...(complaint.comments || []), newComment];
    }
    
    // Ajouter à l'historique
    updateData.history = [
      ...(complaint.history || []),
      {
        action: 'STATUS_CHANGED',
        userId: req.user.uid,
        timestamp: new Date().toISOString(),
        changes: { status, assignedTo, comment }
      }
    ];
    
    await db.collection('complaints').doc(id).update(updateData);
    
    res.json({
      success: true,
      message: 'Statut de la plainte mis à jour avec succès',
      data: updateData
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * @swagger
 * /api/complaints/{id}/comments:
 *   post:
 *     summary: Ajouter un commentaire à une plainte
 *     tags: [Plaintes]
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
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *               isInternal:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Commentaire ajouté avec succès
 */
export const addComplaintComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, isInternal = false } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Le texte du commentaire est requis' 
      });
    }
    
    const complaintDoc = await db.collection('complaints').doc(id).get();
    if (!complaintDoc.exists) {
      return res.status(404).json({ error: 'Plainte non trouvée' });
    }
    
    const complaint = complaintDoc.data();
    
    // Vérifier les permissions
    const canComment = hasPermission(req.user, UserPermissions.MANAGE_COMPLAINTS) || 
                      complaint.submittedBy === req.user.uid;
    
    if (!canComment) {
      return res.status(403).json({ 
        error: 'Permission insuffisante pour commenter cette plainte' 
      });
    }
    
    const newComment = {
      id: `comment_${Date.now()}`,
      text: text.trim(),
      authorId: req.user.uid,
      authorName: req.user.displayName || req.user.email,
      createdAt: new Date().toISOString(),
      isInternal: isInternal && hasPermission(req.user, UserPermissions.MANAGE_COMPLAINTS)
    };
    
    const updatedComments = [...(complaint.comments || []), newComment];
    const updatedHistory = [
      ...(complaint.history || []),
      {
        action: 'COMMENT_ADDED',
        userId: req.user.uid,
        timestamp: new Date().toISOString(),
        changes: { commentId: newComment.id, isInternal }
      }
    ];
    
    await db.collection('complaints').doc(id).update({
      comments: updatedComments,
      history: updatedHistory,
      updatedAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      comment: newComment
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}; 