import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

// Fonction pour générer un token de test
async function generateTestToken() {
  try {
    const response = await fetch(`${BASE_URL}/api/test-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'admin' })
    });
    
    const data = await response.json();
    if (data.success) {
      return data.token;
    } else {
      throw new Error('Impossible de générer le token de test');
    }
  } catch (error) {
    console.error('❌ Erreur génération token:', error.message);
    return null;
  }
}

// Fonction pour tester les routes de statistiques
async function testStatisticsRoutes() {
  console.log('🧪 Test des routes de statistiques...\n');
  
  // 1. Générer un token de test
  console.log('1️⃣ Génération du token de test...');
  const token = await generateTestToken();
  if (!token) {
    console.log('❌ Impossible de continuer sans token');
    return;
  }
  console.log('✅ Token généré avec succès\n');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // 2. Tester la route /api/statistics/advanced
  console.log('2️⃣ Test de /api/statistics/advanced...');
  try {
    const response = await fetch(`${BASE_URL}/api/statistics/advanced?period=30d&includeTimeline=true`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Route /api/statistics/advanced fonctionne');
      console.log('📊 Données reçues:', {
        success: data.success,
        period: data.period,
        hasOverview: !!data.data?.overview,
        hasTimeline: !!data.data?.timeline,
        hasDistributions: !!data.data?.distributions
      });
    } else {
      console.log('❌ Erreur route /api/statistics/advanced:', response.status);
      console.log('📝 Détails:', data);
    }
  } catch (error) {
    console.log('❌ Exception route /api/statistics/advanced:', error.message);
  }
  
  console.log('');
  
  // 3. Tester la route /api/statistics/realtime
  console.log('3️⃣ Test de /api/statistics/realtime...');
  try {
    const response = await fetch(`${BASE_URL}/api/statistics/realtime`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Route /api/statistics/realtime fonctionne');
      console.log('⏱️ Données temps réel:', {
        success: data.success,
        newComplaints: data.data?.newComplaints,
        resolvedComplaints: data.data?.resolvedComplaints,
        urgentComplaints: data.data?.urgentComplaints,
        activeAdmins: data.data?.activeAdmins
      });
    } else {
      console.log('❌ Erreur route /api/statistics/realtime:', response.status);
      console.log('📝 Détails:', data);
    }
  } catch (error) {
    console.log('❌ Exception route /api/statistics/realtime:', error.message);
  }
  
  console.log('');
  
  // 4. Tester la route de santé du serveur
  console.log('4️⃣ Test de la route de santé...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Serveur en bonne santé');
      console.log('🏥 Status:', data.status, '- Version:', data.version);
    } else {
      console.log('❌ Problème de santé du serveur');
    }
  } catch (error) {
    console.log('❌ Serveur inaccessible:', error.message);
    console.log('💡 Assurez-vous que le serveur backend est démarré sur le port 3001');
  }
}

// Exécuter les tests
testStatisticsRoutes().then(() => {
  console.log('\n🏁 Tests terminés');
}).catch(error => {
  console.error('\n💥 Erreur lors des tests:', error);
});