import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import process from 'process';
import { readFileSync } from 'fs';

// Charger les variables d'environnement
dotenv.config();

// Configuration Firebase pour production
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
};

let app;
let db;
let auth;

try {
  // Charger les credentials depuis le fichier de service
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './config/firebase-service-account.json';
  
  if (!serviceAccountPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS non défini dans les variables d\'environnement');
  }

  // Lire et parser les credentials
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  // Initialiser l'app Firebase Admin
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: firebaseConfig.projectId,
    databaseURL: firebaseConfig.databaseURL,
    storageBucket: firebaseConfig.storageBucket
  });

  // Initialiser les services
  db = getFirestore(app);
  auth = getAuth(app);
  
  console.log('🔥 FIREBASE PRODUCTION initialisé avec succès !');
  console.log(`📋 Projet ID: ${firebaseConfig.projectId}`);
  console.log('✅ Base de données RÉELLE configurée');
  
} catch (error) {
  console.error('❌ ERREUR CONFIGURATION FIREBASE PRODUCTION:', error.message);
  console.log('💡 Vérifiez :');
  console.log('   - Le fichier firebase-service-account.json existe');
  console.log('   - Les variables d\'environnement sont correctes');
  console.log('   - Votre projet Firebase est configuré');
  
  // Fallback vers le mode développement en cas d'erreur
  console.log('🔄 Basculement vers le mode développement...');
  const devConfig = await import('./firebase-dev.js');
  db = devConfig.db;
  auth = devConfig.auth;
}

export { db, auth, firebaseConfig }; 