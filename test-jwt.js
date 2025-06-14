// Script de test pour vérifier le token JWT
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'niaxtu-super-secret-key-2024';

// Créer un token de test
const testUser = {
  id: 'test-admin-id',
  email: 'admin@test.com',
  role: 'admin',
  permissions: ['VIEW_USERS', 'MANAGE_COMPLAINTS']
};

const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });

console.log('Token JWT généré:');
console.log(token);
console.log('\nDécodage du token:');

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log(decoded);
} catch (error) {
  console.error('Erreur de décodage:', error.message);
}

// Test avec curl
console.log('\nTest avec curl:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/users/profile`); 