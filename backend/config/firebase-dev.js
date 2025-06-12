// Configuration Firebase simplifiée pour le développement
// Cette version utilise des mocks/simulateurs pour permettre le développement sans credentials

import dotenv from 'dotenv';
dotenv.config();

// Mock des services Firebase pour le développement
class MockFirestore {
  constructor() {
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MockCollection(name));
    }
    return this.collections.get(name);
  }

  async settings() {
    return { timestampsInSnapshots: true };
  }
}

class MockCollection {
  constructor(name) {
    this.name = name;
    this.documents = new Map();
  }

  doc(id) {
    return new MockDocument(this, id);
  }

  async add(data) {
    const id = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const doc = new MockDocument(this, id);
    doc.data = { ...data, id };
    this.documents.set(id, doc);
    return { id };
  }

  where(field, operator, value) {
    return new MockQuery(this, { field, operator, value });
  }

  async get() {
    const docs = Array.from(this.documents.values()).map(doc => ({
      id: doc.id,
      data: () => doc.data,
      exists: true
    }));
    
    return {
      empty: docs.length === 0,
      docs,
      forEach: (callback) => docs.forEach(callback)
    };
  }
}

class MockDocument {
  constructor(collection, id) {
    this.collection = collection;
    this.id = id;
    this.data = null;
  }

  async set(data) {
    this.data = { ...data, id: this.id };
    this.collection.documents.set(this.id, this);
    console.log(`📝 MOCK: Document ${this.id} créé dans ${this.collection.name}`);
    return true;
  }

  async get() {
    return {
      exists: this.data !== null,
      id: this.id,
      data: () => this.data
    };
  }

  async update(data) {
    if (this.data) {
      this.data = { ...this.data, ...data };
      console.log(`✏️ MOCK: Document ${this.id} mis à jour dans ${this.collection.name}`);
    }
    return true;
  }
}

class MockQuery {
  constructor(collection, condition) {
    this.collection = collection;
    this.condition = condition;
    this._limit = null;
  }

  limit(count) {
    this._limit = count;
    return this;
  }

  async get() {
    let docs = Array.from(this.collection.documents.values());
    
    // Appliquer le filtre
    if (this.condition) {
      const { field, operator, value } = this.condition;
      docs = docs.filter(doc => {
        if (!doc.data) return false;
        const fieldValue = this.getNestedValue(doc.data, field);
        
        switch (operator) {
          case '==':
            return fieldValue === value;
          case '!=':
            return fieldValue !== value;
          case '>':
            return fieldValue > value;
          case '>=':
            return fieldValue >= value;
          case '<':
            return fieldValue < value;
          case '<=':
            return fieldValue <= value;
          default:
            return false;
        }
      });
    }
    
    // Appliquer la limite
    if (this._limit) {
      docs = docs.slice(0, this._limit);
    }
    
    const mappedDocs = docs.map(doc => ({
      id: doc.id,
      data: () => doc.data,
      exists: true
    }));
    
    return {
      empty: mappedDocs.length === 0,
      docs: mappedDocs,
      forEach: (callback) => mappedDocs.forEach(callback)
    };
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

class MockAuth {
  async verifyIdToken(token) {
    // Mock de vérification de token pour le développement
    console.log(`🔐 MOCK: Vérification du token ${token.substring(0, 20)}...`);
    
    // Simuler un token valide
    return {
      uid: 'mock_user_123',
      email: 'test@niaxtu.com',
      name: 'Utilisateur Test',
      email_verified: true,
      picture: null
    };
  }
}

// Initialiser les services mock
const db = new MockFirestore();
const auth = new MockAuth();

// Configuration Firebase pour référence
const firebaseConfig = {
  apiKey: "AIzaSyA68yKSkqNaSAIKO4_Vneq0htMUHVMqVDs",
  authDomain: "niaxtu-8e0dd.firebaseapp.com",
  projectId: "niaxtu-8e0dd",
  storageBucket: "niaxtu-8e0dd.firebasestorage.app",
  messagingSenderId: "765265055722",
  appId: "1:765265055722:web:5ecb5fe1fbb839729cac93"
};

console.log('🔧 MODE DÉVELOPPEMENT: Utilisation des services Firebase simulés');
console.log('📋 Projet ID:', firebaseConfig.projectId);
console.log('⚠️ ATTENTION: Les données ne sont pas persistées (mode mock)');
console.log('💡 Pour la production, configurez les vraies credentials Firebase');

// Exporter les services mock
export { db, auth, firebaseConfig }; 