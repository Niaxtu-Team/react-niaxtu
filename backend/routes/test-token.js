import express from 'express';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Test Tokens
 *   description: Génération et gestion des tokens de test pour le développement
 */

/**
 * @swagger
 * /api/test-token:
 *   post:
 *     summary: Générer un token de test
 *     description: |
 *       Génère un token de test pour accéder aux routes protégées pendant le développement.
 *       
 *       **⚠️ ATTENTION**: Ces tokens sont uniquement pour les tests de développement et ne doivent jamais être utilisés en production.
 *       
 *       **Utilisation**:
 *       1. Générez un token avec cette route
 *       2. Copiez le token retourné
 *       3. Utilisez-le dans le header `Authorization: Bearer [TOKEN]`
 *       4. Testez vos routes protégées
 *       
 *       **Rôles disponibles**:
 *       - `plaignant`: Accès aux fonctionnalités de plaignant
 *       - `admin`: Accès aux fonctionnalités d'administration
 *     tags: [Test Tokens]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestTokenRequest'
 *           examples:
 *             plaignant:
 *               summary: Token pour plaignant
 *               value:
 *                 role: "plaignant"
 *             admin:
 *               summary: Token pour admin
 *               value:
 *                 role: "admin"
 *             custom:
 *               summary: Token avec UID personnalisé
 *               value:
 *                 role: "plaignant"
 *                 uid: "mon-test-user-123"
 *     responses:
 *       200:
 *         description: Token de test généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestTokenResponse'
 *             example:
 *               success: true
 *               message: "Token de test généré avec succès"
 *               token: "eyJ1aWQiOiJ0ZXN0LXVzZXItMTczNDU2Nzg5MCIsInJvbGUiOiJwbGFpZ25hbnQiLCJlbWFpbCI6InRlc3QtdXNlci0xNzM0NTY3ODkwQHRlc3QuY29tIiwiZXhwIjoxNzM0NjU0MjkwLCJpYXQiOjE3MzQ1Njc4OTAsInRlc3QiOnRydWV9"
 *               user:
 *                 uid: "test-user-1734567890"
 *                 role: "plaignant"
 *                 email: "test-user-1734567890@test.com"
 *               usage:
 *                 header: "Authorization"
 *                 value: "Bearer eyJ1aWQiOiJ0ZXN0LXVzZXItMTczNDU2Nzg5MCIsInJvbGUiOiJwbGFpZ25hbnQiLCJlbWFpbCI6InRlc3QtdXNlci0xNzM0NTY3ODkwQHRlc3QuY29tIiwiZXhwIjoxNzM0NjU0MjkwLCJpYXQiOjE3MzQ1Njc4OTAsInRlc3QiOnRydWV9"
 *                 example: "curl -H \"Authorization: Bearer [TOKEN]\" http://localhost:3001/api/plaignant"
 *               warning: "⚠️ Ce token est uniquement pour les tests de développement"
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Rôle invalide. Utilisez 'plaignant' ou 'admin'"
 */
router.post('/', (req, res) => {
  const { role = 'plaignant', uid = 'test-user-' + Date.now() } = req.body;
  
  // Validation du rôle
  if (!['plaignant', 'admin'].includes(role)) {
    return res.status(400).json({
      error: "Rôle invalide. Utilisez 'plaignant' ou 'admin'"
    });
  }
  
  // Créer un token de test simple (JWT-like mais pas sécurisé)
  const testToken = Buffer.from(JSON.stringify({
    uid: uid,
    role: role,
    email: `${uid}@test.com`,
    exp: Date.now() + (24 * 60 * 60 * 1000), // Expire dans 24h
    iat: Date.now(),
    test: true
  })).toString('base64');
  
  res.json({
    success: true,
    message: 'Token de test généré avec succès',
    token: testToken,
    user: {
      uid: uid,
      role: role,
      email: `${uid}@test.com`
    },
    usage: {
      header: 'Authorization',
      value: `Bearer ${testToken}`,
      example: `curl -H "Authorization: Bearer ${testToken}" http://localhost:3001/api/plaignant`
    },
    warning: '⚠️ Ce token est uniquement pour les tests de développement'
  });
});

/**
 * @swagger
 * /api/test-token/info:
 *   get:
 *     summary: Vérifier un token de test
 *     description: |
 *       Vérifie la validité d'un token de test et retourne les informations associées.
 *       
 *       **Utilisation**:
 *       - Ajoutez le token dans le header `Authorization: Bearer [TOKEN]`
 *       - Cette route vous indiquera si le token est valide, expiré ou invalide
 *       - Utile pour déboguer les problèmes d'authentification
 *     tags: [Test Tokens]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Informations sur le token de test
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestTokenInfo'
 *             example:
 *               valid: true
 *               user:
 *                 uid: "test-user-1734567890"
 *                 role: "plaignant"
 *                 email: "test-user-1734567890@test.com"
 *               expires: "2024-12-20T10:30:00.000Z"
 *               issued: "2024-12-19T10:30:00.000Z"
 *       401:
 *         description: Token manquant, invalide ou expiré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missing:
 *                 summary: Token manquant
 *                 value:
 *                   error: "Token manquant"
 *                   message: "Utilisez POST /api/test-token pour générer un token"
 *               invalid:
 *                 summary: Token invalide
 *                 value:
 *                   error: "Token invalide"
 *                   message: "Ce n'est pas un token de test valide"
 *               expired:
 *                 summary: Token expiré
 *                 value:
 *                   error: "Token expiré"
 *                   message: "Générez un nouveau token avec POST /api/test-token"
 */
router.get('/info', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token manquant',
      message: 'Utilisez POST /api/test-token pour générer un token'
    });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (!decoded.test) {
      return res.status(401).json({
        error: 'Token invalide',
        message: 'Ce n\'est pas un token de test valide'
      });
    }
    
    if (decoded.exp < Date.now()) {
      return res.status(401).json({
        error: 'Token expiré',
        message: 'Générez un nouveau token avec POST /api/test-token'
      });
    }
    
    res.json({
      valid: true,
      user: {
        uid: decoded.uid,
        role: decoded.role,
        email: decoded.email
      },
      expires: new Date(decoded.exp).toISOString(),
      issued: new Date(decoded.iat).toISOString()
    });
    
  } catch (error) {
    res.status(401).json({
      error: 'Token invalide',
      message: 'Impossible de décoder le token'
    });
  }
});

export default router; 