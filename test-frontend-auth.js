// test-frontend-auth.js
// Script de test pour vérifier la connexion frontend -> backend

const testAuth = async () => {
  console.log('🧪 Test de connexion Frontend -> Backend');
  console.log('=====================================');

  const baseURL = 'http://localhost:3001/api';
  
  // Test 1: Vérifier que le serveur répond
  console.log('\n1. Test de connectivité serveur...');
  try {
    const response = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'wrongpassword'
      })
    });

    const data = await response.json();
    console.log('✅ Serveur accessible');
    console.log('📝 Réponse:', data);
    
    if (data.message === 'Identifiants incorrects') {
      console.log('✅ Route d\'authentification fonctionne');
    }
  } catch (error) {
    console.error('❌ Erreur de connectivité:', error.message);
    return;
  }

  // Test 2: Tester avec des identifiants valides (si disponibles)
  console.log('\n2. Test avec identifiants de test...');
  
  const testCredentials = [
    { email: 'admin@niaxtu.com', password: 'admin123' },
    { email: 'super@niaxtu.com', password: 'super123' },
    { email: 'test@niaxtu.com', password: 'test123' }
  ];

  for (const creds of testCredentials) {
    try {
      console.log(`   Tentative: ${creds.email}`);
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(creds)
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ Connexion réussie avec ${creds.email}`);
        console.log(`   👤 Utilisateur: ${data.user.email}`);
        console.log(`   🔑 Rôle: ${data.user.role}`);
        console.log(`   🎫 Token reçu: ${data.token ? 'Oui' : 'Non'}`);
        
        // Test de vérification du token
        if (data.token) {
          console.log('\n3. Test de vérification du token...');
          const verifyResponse = await fetch(`${baseURL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });
          
          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            console.log('   ✅ Token valide');
            console.log('   📝 Données utilisateur vérifiées');
          } else {
            console.log('   ❌ Token invalide');
          }
        }
        
        return; // Arrêter après la première connexion réussie
      } else {
        console.log(`   ❌ ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
  }

  console.log('\n📋 Résumé:');
  console.log('- Serveur backend accessible ✅');
  console.log('- Route d\'authentification fonctionnelle ✅');
  console.log('- Besoin d\'identifiants valides pour tester complètement');
  console.log('\n💡 Pour créer un compte de test, utilisez:');
  console.log('   node test-auth-complete.cjs');
};

// Exécuter le test
testAuth().catch(console.error); 