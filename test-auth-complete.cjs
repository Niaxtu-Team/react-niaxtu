// Test complet du système d'authentification (CommonJS)
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';
const JWT_SECRET = 'niaxtu-super-secret-key-2024';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Fonction pour faire des requêtes API
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, error: error.message };
  }
};

// Test 1: Créer un token JWT valide
const testJWTGeneration = () => {
  log('\n=== TEST 1: Génération de Token JWT ===', 'blue');
  
  const testUser = {
    id: 'test-admin-123',
    email: 'admin@niaxtu.com',
    role: 'admin',
    permissions: ['VIEW_USERS', 'MANAGE_COMPLAINTS']
  };

  const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    log('✅ Token JWT généré et vérifié avec succès', 'green');
    log(`   Email: ${decoded.email}`, 'green');
    log(`   Rôle: ${decoded.role}`, 'green');
    log(`   Permissions: ${decoded.permissions.join(', ')}`, 'green');
    return token;
  } catch (error) {
    log('❌ Erreur de génération/vérification JWT:', 'red');
    log(`   ${error.message}`, 'red');
    return null;
  }
};

// Test 2: Test de login avec email/password
const testLogin = async () => {
  log('\n=== TEST 2: Test de Login ===', 'blue');
  
  const loginData = {
    email: 'admin@niaxtu.com',
    password: 'admin123'
  };

  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData)
  });

  if (result.status === 200 && result.data.success) {
    log('✅ Login réussi', 'green');
    log(`   Token reçu: ${result.data.token ? 'Oui' : 'Non'}`, 'green');
    log(`   Utilisateur: ${result.data.user?.email}`, 'green');
    log(`   Rôle: ${result.data.user?.role}`, 'green');
    return result.data.token;
  } else {
    log('❌ Échec du login:', 'red');
    log(`   Status: ${result.status}`, 'red');
    log(`   Message: ${result.data?.message || result.error}`, 'red');
    return null;
  }
};

// Test 3: Test d'accès aux routes protégées
const testProtectedRoutes = async (token) => {
  log('\n=== TEST 3: Test des Routes Protégées ===', 'blue');
  
  if (!token) {
    log('❌ Pas de token disponible pour les tests', 'red');
    return;
  }

  const routes = [
    { endpoint: '/users/profile', name: 'Profil Utilisateur' },
    { endpoint: '/users/all', name: 'Liste des Utilisateurs' },
    { endpoint: '/complaints?page=1&limit=5', name: 'Liste des Plaintes' },
    { endpoint: '/structures/ministeres', name: 'Liste des Ministères' },
    { endpoint: '/admin/stats', name: 'Statistiques Admin' }
  ];

  for (const route of routes) {
    const result = await apiRequest(route.endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (result.status === 200) {
      log(`✅ ${route.name}: Accès autorisé`, 'green');
    } else if (result.status === 401) {
      log(`❌ ${route.name}: Non autorisé (401)`, 'red');
      log(`   Message: ${result.data?.message || result.data?.error}`, 'red');
    } else if (result.status === 403) {
      log(`⚠️  ${route.name}: Permission insuffisante (403)`, 'yellow');
    } else {
      log(`❌ ${route.name}: Erreur ${result.status}`, 'red');
      log(`   Message: ${result.data?.message || result.error}`, 'red');
    }
  }
};

// Test 4: Test avec token invalide
const testInvalidToken = async () => {
  log('\n=== TEST 4: Test avec Token Invalide ===', 'blue');
  
  const invalidTokens = [
    { token: 'invalid-token', name: 'Token complètement invalide' },
    { token: 'Bearer invalid-token', name: 'Token avec Bearer invalide' },
    { token: jwt.sign({ id: 'fake' }, 'wrong-secret'), name: 'Token avec mauvaise clé' }
  ];

  for (const test of invalidTokens) {
    const result = await apiRequest('/users/profile', {
      headers: {
        'Authorization': `Bearer ${test.token}`
      }
    });

    if (result.status === 401) {
      log(`✅ ${test.name}: Correctement rejeté (401)`, 'green');
    } else {
      log(`❌ ${test.name}: Devrait être rejeté mais status ${result.status}`, 'red');
    }
  }
};

// Test 5: Test de token expiré
const testExpiredToken = async () => {
  log('\n=== TEST 5: Test avec Token Expiré ===', 'blue');
  
  const expiredToken = jwt.sign(
    { id: 'test', email: 'test@test.com', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '-1h' } // Token expiré depuis 1 heure
  );

  const result = await apiRequest('/users/profile', {
    headers: {
      'Authorization': `Bearer ${expiredToken}`
    }
  });

  if (result.status === 401) {
    log('✅ Token expiré correctement rejeté (401)', 'green');
  } else {
    log(`❌ Token expiré devrait être rejeté mais status ${result.status}`, 'red');
  }
};

// Test 6: Test de création d'admin (nécessite permissions)
const testCreateAdmin = async (token) => {
  log('\n=== TEST 6: Test de Création d\'Admin ===', 'blue');
  
  if (!token) {
    log('❌ Pas de token disponible', 'red');
    return;
  }

  const newAdmin = {
    email: 'nouvel.admin@test.com',
    displayName: 'Nouvel Admin Test',
    role: 'moderator',
    permissions: ['VIEW_USERS'],
    isActive: true
  };

  const result = await apiRequest('/admin', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(newAdmin)
  });

  if (result.status === 200 || result.status === 201) {
    log('✅ Création d\'admin réussie', 'green');
  } else if (result.status === 403) {
    log('⚠️  Permission insuffisante pour créer un admin (403)', 'yellow');
  } else if (result.status === 401) {
    log('❌ Non autorisé pour créer un admin (401)', 'red');
  } else {
    log(`❌ Erreur lors de la création d'admin: ${result.status}`, 'red');
    log(`   Message: ${result.data?.message || result.error}`, 'red');
  }
};

// Test 7: Test de vérification du serveur
const testServerHealth = async () => {
  log('\n=== TEST 0: Vérification du Serveur ===', 'blue');
  
  try {
    const result = await apiRequest('/health');
    if (result.status === 200) {
      log('✅ Serveur accessible', 'green');
      return true;
    } else {
      log(`⚠️  Serveur répond avec status ${result.status}`, 'yellow');
      return true; // On continue même si pas de route health
    }
  } catch (error) {
    log('❌ Serveur non accessible', 'red');
    log(`   Erreur: ${error.message}`, 'red');
    return false;
  }
};

// Fonction principale de test
const runAllTests = async () => {
  log('🚀 DÉBUT DES TESTS D\'AUTHENTIFICATION', 'blue');
  log('==========================================', 'blue');

  // Vérifier que le serveur est accessible
  const serverOk = await testServerHealth();
  if (!serverOk) {
    log('\n💥 ARRÊT: Serveur non accessible', 'red');
    log('   Assurez-vous que le serveur backend est démarré sur le port 3001', 'red');
    return;
  }

  // Test de génération JWT
  const generatedToken = testJWTGeneration();

  // Test de login
  const loginToken = await testLogin();

  // Utiliser le token de login s'il existe, sinon le token généré
  const testToken = loginToken || generatedToken;

  // Tests avec token valide
  await testProtectedRoutes(testToken);

  // Tests avec tokens invalides
  await testInvalidToken();

  // Test avec token expiré
  await testExpiredToken();

  // Test de création d'admin
  await testCreateAdmin(testToken);

  log('\n==========================================', 'blue');
  log('🏁 TESTS TERMINÉS', 'blue');
  
  // Résumé
  log('\n📊 RÉSUMÉ:', 'blue');
  log('- Vérifiez les résultats ci-dessus', 'blue');
  log('- Les ✅ indiquent des succès', 'blue');
  log('- Les ❌ indiquent des problèmes à corriger', 'blue');
  log('- Les ⚠️  indiquent des comportements attendus', 'blue');
  
  if (loginToken) {
    log('\n🎯 TOKEN DE TEST VALIDE:', 'green');
    log(`Bearer ${loginToken}`, 'green');
    log('Vous pouvez utiliser ce token pour tester manuellement les APIs', 'green');
  }
};

// Exécuter les tests
runAllTests().catch(error => {
  log(`\n💥 ERREUR FATALE: ${error.message}`, 'red');
  console.error(error);
}); 