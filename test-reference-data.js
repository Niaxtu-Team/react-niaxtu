// Test pour vérifier la récupération des données de référence
const API_BASE_URL = 'http://localhost:5000/api';

async function testReferenceData() {
  try {
    console.log('🧪 Test des données de référence...');
    
    // Token de test (remplacez par un vrai token)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbjEiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3MzQ5NzE0NzIsImV4cCI6MTczNTA1Nzg3Mn0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
    
    // Test 1: Récupérer les ministères
    console.log('\n📋 Test 1: Ministères');
    const ministeresRes = await fetch(`${API_BASE_URL}/structures/ministeres?withStats=false`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (ministeresRes.ok) {
      const ministeresData = await ministeresRes.json();
      console.log(`✅ ${ministeresData.data?.length || 0} ministères trouvés`);
      if (ministeresData.data?.length > 0) {
        console.log('Premier ministère:', ministeresData.data[0].nom);
      }
    } else {
      console.log('❌ Erreur ministères:', ministeresRes.status);
    }
    
    // Test 2: Récupérer les directions
    console.log('\n📁 Test 2: Directions');
    const directionsRes = await fetch(`${API_BASE_URL}/structures/directions?withStats=false`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (directionsRes.ok) {
      const directionsData = await directionsRes.json();
      console.log(`✅ ${directionsData.data?.length || 0} directions trouvées`);
      if (directionsData.data?.length > 0) {
        console.log('Première direction:', directionsData.data[0].nom);
      }
    } else {
      console.log('❌ Erreur directions:', directionsRes.status);
    }
    
    // Test 3: Récupérer les services
    console.log('\n🏢 Test 3: Services');
    const servicesRes = await fetch(`${API_BASE_URL}/structures/services?withStats=false`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (servicesRes.ok) {
      const servicesData = await servicesRes.json();
      console.log(`✅ ${servicesData.data?.length || 0} services trouvés`);
      if (servicesData.data?.length > 0) {
        console.log('Premier service:', servicesData.data[0].nom);
      }
    } else {
      console.log('❌ Erreur services:', servicesRes.status);
    }
    
    // Test 4: Test des statistiques
    console.log('\n📊 Test 4: Statistiques avancées');
    const statsRes = await fetch(`${API_BASE_URL}/statistics/advanced?period=30d`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      console.log('✅ Statistiques récupérées');
      console.log('Distributions:', Object.keys(statsData.data?.distributions || {}));
    } else {
      console.log('❌ Erreur statistiques:', statsRes.status);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test si le serveur est accessible
fetch('http://localhost:5000/health')
  .then(() => {
    console.log('🚀 Serveur backend accessible, lancement des tests...');
    testReferenceData();
  })
  .catch(() => {
    console.log('⚠️  Serveur backend non accessible. Démarrez le serveur avec "cd backend && npm start"');
  }); 