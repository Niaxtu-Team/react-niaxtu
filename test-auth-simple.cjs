// Test simple du système d'authentification
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'niaxtu-super-secret-key-2024';
const API_BASE_URL = 'http://localhost:3001/api';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Générer un token de test
const generateTestToken = () => {
  const testUser = {
    id: 'test-admin-123',
    email: 'admin@niaxtu.com',
    role: 'admin',
    permissions: ['VIEW_USERS', 'MANAGE_COMPLAINTS', 'CREATE_ADMIN']
  };

  return jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });
};

// Afficher les tests
const displayTests = () => {
  log('🚀 TESTS D\'AUTHENTIFICATION NIAXTU', 'blue');
  log('=====================================', 'blue');

  // Générer un token de test
  const testToken = generateTestToken();
  
  log('\n✅ Token JWT généré avec succès:', 'green');
  log(`   ${testToken}`, 'cyan');

  // Vérifier le token
  try {
    const decoded = jwt.verify(testToken, JWT_SECRET);
    log('\n✅ Token décodé avec succès:', 'green');
    log(`   ID: ${decoded.id}`, 'green');
    log(`   Email: ${decoded.email}`, 'green');
    log(`   Rôle: ${decoded.role}`, 'green');
    log(`   Permissions: ${decoded.permissions.join(', ')}`, 'green');
  } catch (error) {
    log('\n❌ Erreur de décodage du token:', 'red');
    log(`   ${error.message}`, 'red');
  }

  log('\n🧪 COMMANDES DE TEST CURL:', 'blue');
  log('============================', 'blue');

  // Test 1: Login
  log('\n1️⃣  Test de Login:', 'yellow');
  log('curl -X POST \\', 'cyan');
  log('  -H "Content-Type: application/json" \\', 'cyan');
  log('  -d \'{"email":"admin@niaxtu.com","password":"admin123"}\' \\', 'cyan');
  log(`  ${API_BASE_URL}/auth/login`, 'cyan');

  // Test 2: Profil utilisateur
  log('\n2️⃣  Test du Profil Utilisateur:', 'yellow');
  log('curl -X GET \\', 'cyan');
  log(`  -H "Authorization: Bearer ${testToken}" \\`, 'cyan');
  log(`  ${API_BASE_URL}/users/profile`, 'cyan');

  // Test 3: Liste des utilisateurs
  log('\n3️⃣  Test de la Liste des Utilisateurs:', 'yellow');
  log('curl -X GET \\', 'cyan');
  log(`  -H "Authorization: Bearer ${testToken}" \\`, 'cyan');
  log(`  ${API_BASE_URL}/users/all`, 'cyan');

  // Test 4: Liste des plaintes
  log('\n4️⃣  Test de la Liste des Plaintes:', 'yellow');
  log('curl -X GET \\', 'cyan');
  log(`  -H "Authorization: Bearer ${testToken}" \\`, 'cyan');
  log(`  "${API_BASE_URL}/complaints?page=1&limit=5"`, 'cyan');

  // Test 5: Structures/Ministères
  log('\n5️⃣  Test des Ministères:', 'yellow');
  log('curl -X GET \\', 'cyan');
  log(`  -H "Authorization: Bearer ${testToken}" \\`, 'cyan');
  log(`  ${API_BASE_URL}/structures/ministeres`, 'cyan');

  // Test 6: Statistiques admin
  log('\n6️⃣  Test des Statistiques Admin:', 'yellow');
  log('curl -X GET \\', 'cyan');
  log(`  -H "Authorization: Bearer ${testToken}" \\`, 'cyan');
  log(`  ${API_BASE_URL}/admin/stats`, 'cyan');

  // Test 7: Création d'admin
  log('\n7️⃣  Test de Création d\'Admin:', 'yellow');
  log('curl -X POST \\', 'cyan');
  log('  -H "Content-Type: application/json" \\', 'cyan');
  log(`  -H "Authorization: Bearer ${testToken}" \\`, 'cyan');
  log('  -d \'{"email":"test@test.com","displayName":"Test Admin","role":"moderator","isActive":true}\' \\', 'cyan');
  log(`  ${API_BASE_URL}/admin`, 'cyan');

  // Test 8: Token invalide
  log('\n8️⃣  Test avec Token Invalide:', 'yellow');
  log('curl -X GET \\', 'cyan');
  log('  -H "Authorization: Bearer invalid-token" \\', 'cyan');
  log(`  ${API_BASE_URL}/users/profile`, 'cyan');

  log('\n📋 RÉSULTATS ATTENDUS:', 'blue');
  log('======================', 'blue');
  log('✅ Tests 1-7: Status 200 (succès)', 'green');
  log('❌ Test 8: Status 401 (non autorisé)', 'red');

  log('\n🔍 VÉRIFICATIONS:', 'blue');
  log('==================', 'blue');
  log('1. Le serveur backend doit être démarré sur le port 3001', 'yellow');
  log('2. Un admin avec email "admin@niaxtu.com" et password "admin123" doit exister', 'yellow');
  log('3. Les routes doivent utiliser le middleware authenticateToken', 'yellow');
  log('4. La collection "admin" doit contenir les données utilisateur', 'yellow');

  log('\n💡 CONSEILS DE DÉBOGAGE:', 'blue');
  log('=========================', 'blue');
  log('• Si erreur 401: Vérifier le middleware d\'authentification', 'yellow');
  log('• Si erreur 500: Vérifier les logs du serveur backend', 'yellow');
  log('• Si erreur de connexion: Vérifier que le serveur est démarré', 'yellow');
  log('• Si token invalide: Vérifier la clé JWT_SECRET', 'yellow');

  log('\n🎯 TOKEN POUR TESTS MANUELS:', 'green');
  log('==============================', 'green');
  log(testToken, 'cyan');
  log('\nCopiez ce token pour vos tests manuels dans Postman ou autres outils', 'green');
};

// Exécuter les tests
displayTests(); 