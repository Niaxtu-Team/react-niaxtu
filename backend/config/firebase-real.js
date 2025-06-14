/* global process */
// Configuration Firebase RÉELLE
// Remplacez toutes les valeurs par vos vraies informations Firebase via les variables d'environnement

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();


// 🔒 SÉCURISÉ: Configuration Firebase via variables d'environnement

// Configuration côté client (frontend)
const clientConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN, 
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Service Account pour le backend (Firebase Admin SDK)
const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Conversion des \n
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
  "universe_domain": "googleapis.com"
};

// Configuration Firebase
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientConfig: clientConfig
};

let app;
let db;
let auth;

try {
  console.log('🔥 Initialisation Firebase avec variables d\'environnement...');
  
  // Vérifier que les variables critiques sont présentes
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
  }
  
  // Initialiser l'app Firebase Admin
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });

  // Initialiser les services
  db = getFirestore(app);
  auth = getAuth(app);
  
  // Configuration Firestore pour éviter l'erreur settings
  db.settings({
    ignoreUndefinedProperties: true
  });
  
  console.log('✅ FIREBASE RÉEL initialisé avec succès !');
  console.log(`📋 Projet ID: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log('🔗 Base de données RÉELLE connectée - Collection: admin');
  console.log('🎯 Les super admins seront créés dans votre vraie Firestore !');
  
} catch (error) {
  console.error('❌ ERREUR Firebase:', error.message);
  throw error;
}

export { db, auth, firebaseConfig, FieldValue }; 