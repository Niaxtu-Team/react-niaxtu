import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Importer les routes
import userRoutes from './routes/users.js';
import dataRoutes from './routes/data.js';
import adminRoutes from './routes/admin.js';
import complaintRoutes from './routes/complaints.js';
import sectorRoutes from './routes/sectors.js';
import structureRoutes from './routes/structures.js';
import typeRoutes from './routes/types.js';
import setupRoutes from './routes/setup.js';
import authRoutes from './routes/auth.js';
import organizationRoutes from './routes/organization.js';
import plaignantRoutes from './routes/plaignant.js';
import plainteRoutes from './routes/plainte.js';
import testTokenRoutes from './routes/test-token.js';
import statisticsRoutes from './routes/statistics.js';

// Importer Firebase pour tester la connexion
import { db } from './config/firebase.js';

// Importer Swagger
import { swaggerUi, specs } from './swagger/swagger.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité avec configuration pour Swagger
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3001", "https://api.niaxtu.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:"]
    }
  }
}));

// Configuration CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000'  // Create React App
  ],
  credentials: true
}));

// Limitation du taux de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // maximum 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use(limiter);

// Middleware de logging
app.use(morgan('combined'));

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur Niaxtu backend en cours d\'exécution',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route d'aide pour l'utilisation des tokens
app.get('/api/help/tokens', (req, res) => {
  res.json({
    title: '🔐 Guide d\'utilisation des Tokens de Test',
    description: 'Comment utiliser les tokens de test avec Swagger UI',
    steps: [
      {
        step: 1,
        title: 'Générer un token',
        description: 'Utilisez POST /api/test-token pour générer un token',
        example: {
          url: 'POST /api/test-token',
          body: { role: 'plaignant' },
          response: 'Copiez le "token" de la réponse'
        }
      },
      {
        step: 2,
        title: 'Autoriser dans Swagger',
        description: 'Cliquez sur le bouton "Authorize" 🔒 en haut de la page Swagger',
        location: 'En haut à droite de la documentation Swagger'
      },
      {
        step: 3,
        title: 'Saisir le token',
        description: 'Dans le champ "Value", saisissez: Bearer [VOTRE_TOKEN]',
        example: 'Bearer eyJ1aWQiOiJ0ZXN0LXVzZXItMTczNDU2Nzg5MCIsInJvbGUi...'
      },
      {
        step: 4,
        title: 'Tester les routes',
        description: 'Maintenant vous pouvez tester toutes les routes protégées',
        routes: ['/api/plaignant', '/api/plainte', '/api/admin']
      }
    ],
    troubleshooting: {
      'Pas de bouton Authorize': 'Actualisez la page /api-docs',
      'Token invalide': 'Générez un nouveau token avec POST /api/test-token',
      'Token expiré': 'Les tokens expirent après 24h, générez-en un nouveau'
    },
    links: {
      swagger: 'http://localhost:3001/api-docs',
      generateToken: 'http://localhost:3001/api-docs#/Test%20Tokens/post_api_test_token',
      testRoute: 'http://localhost:3001/api-docs#/Plaignant/get_api_plaignant'
    }
  });
});

// Route pour servir les specs JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(specs);
});

// Documentation Swagger avec configuration CSP
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .auth-wrapper { margin-bottom: 20px; }
    .swagger-ui .btn.authorize { 
      background-color: #4CAF50; 
      border-color: #4CAF50; 
      color: white;
      font-weight: bold;
    }
    .swagger-ui .btn.authorize:hover { 
      background-color: #45a049; 
      border-color: #45a049; 
    }
  `,
  customSiteTitle: 'Niaxtu API Documentation',
  customfavIcon: '/favicon.ico',
  explorer: true,
  swaggerOptions: {
    url: `/api-docs.json`,
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    requestInterceptor: (request) => {
      request.headers['Access-Control-Allow-Origin'] = '*';
      return request;
    },
    responseInterceptor: (response) => {
      return response;
    },
    onComplete: () => {
      console.log('Swagger UI chargé avec succès');
    }
  }
}));

// Routes API
app.use('/api/users', userRoutes); // Routes utilisateurs avec profil
app.use('/api/data', dataRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/sectors', sectorRoutes);
app.use('/api/structures', structureRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/plaignant', plaignantRoutes);
app.use('/api/plainte', plainteRoutes);
app.use('/api/test-token', testTokenRoutes);
app.use('/api/statistics', statisticsRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API Niaxtu',
    version: '1.0.0',
    description: 'API REST pour la gestion des plaintes et l\'administration',
    endpoints: {
      health: '/health',
      documentation: '/api-docs',
      help: '/api/help/tokens'
    },
    features: [
      'Gestion des plaintes',
      'Administration des utilisateurs',
      'Système de permissions',
      'Authentification JWT',
      'Documentation Swagger',
      'Tests automatisés'
    ]
  });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Consultez la documentation API à /api-docs'
  });
});

// Test de connexion à Firestore au démarrage
const testFirestoreConnection = async () => {
  try {
    console.log('🔥 Test de connexion à Firestore...');
    
    // Test simple de lecture
    const testDoc = await db.collection('test').limit(1).get();
    console.log('✅ Connexion à Firestore réussie');
    
    // Afficher quelques statistiques
    const collections = ['admin', 'complaints', 'sectors', 'structures'];
    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).limit(1).get();
        console.log(`📊 Collection '${collectionName}': accessible`);
      } catch (error) {
        console.log(`⚠️  Collection '${collectionName}': ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion à Firestore:', error.message);
    console.log('🔧 Vérifiez votre configuration Firebase dans .env');
  }
};

// Démarrer le serveur
app.listen(PORT, async () => {
  console.log(`🚀 Serveur Niaxtu démarré sur le port ${PORT}`);
  console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Guide tokens: http://localhost:${PORT}/api/help/tokens`);
  
  // Tester la connexion à Firestore
  await testFirestoreConnection();
  
  console.log('✨ Serveur prêt à recevoir des requêtes');
});

export default app; 