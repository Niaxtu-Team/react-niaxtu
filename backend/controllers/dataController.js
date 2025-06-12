import { db } from '../config/firebase.js';

// Créer un document dans une collection
export const createDocument = async (req, res) => {
  try {
    const { collection } = req.params;
    const data = req.body;
    
    // Ajouter metadata
    const documentData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user?.uid || null
    };
    
    const docRef = await db.collection(collection).add(documentData);
    
    res.status(201).json({
      success: true,
      message: 'Document créé avec succès',
      id: docRef.id,
      data: documentData
    });
  } catch (error) {
    console.error('Erreur lors de la création du document:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Obtenir tous les documents d'une collection
export const getDocuments = async (req, res) => {
  try {
    const { collection } = req.params;
    const { limit = 50, orderBy = 'createdAt', order = 'desc' } = req.query;
    
    let query = db.collection(collection);
    
    // Appliquer l'ordre
    query = query.orderBy(orderBy, order);
    
    // Appliquer la limite
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    const documents = [];
    
    snapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({
      success: true,
      documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Obtenir un document spécifique
export const getDocument = async (req, res) => {
  try {
    const { collection, id } = req.params;
    
    const doc = await db.collection(collection).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    
    res.json({
      success: true,
      document: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour un document
export const updateDocument = async (req, res) => {
  try {
    const { collection, id } = req.params;
    const updates = req.body;
    
    // Ajouter timestamp de mise à jour
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.uid || null
    };
    
    await db.collection(collection).doc(id).update(updateData);
    
    res.json({
      success: true,
      message: 'Document mis à jour avec succès',
      data: updateData
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Supprimer un document
export const deleteDocument = async (req, res) => {
  try {
    const { collection, id } = req.params;
    
    await db.collection(collection).doc(id).delete();
    
    res.json({
      success: true,
      message: 'Document supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Rechercher dans une collection
export const searchDocuments = async (req, res) => {
  try {
    const { collection } = req.params;
    const { field, value, operator = '==', limit = 20 } = req.query;
    
    if (!field || !value) {
      return res.status(400).json({ 
        error: 'Les paramètres field et value sont requis' 
      });
    }
    
    const snapshot = await db.collection(collection)
      .where(field, operator, value)
      .limit(parseInt(limit))
      .get();
    
    const documents = [];
    snapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({
      success: true,
      documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}; 