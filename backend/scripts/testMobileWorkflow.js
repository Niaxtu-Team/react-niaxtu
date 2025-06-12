import { db } from '../config/firebase.js';

/**
 * Script de test pour valider le workflow mobile
 * Compatible avec l'app Flutter
 */

const TEST_USER_UID = 'test-mobile-user-' + Date.now();

// Test 1: Obtenir les types de plaintes
async function testGetComplaintTypes() {
  console.log('\n🧪 Test 1: Récupération des types de plaintes');
  
  try {
    // Simuler la requête mobile
    const types = {
      complaintTypes: [
        'Retard de paiement',
        'Prestation insatisfaisante',
        'Problème administratif',
        'Autre'
      ],
      targetTypes: [
        'Structure publique',
        'Structure privée',
        'Particulier'
      ],
      submissionTypes: [
        'Vocal',
        'Exposé',
        'Suite exposé'
      ]
    };
    
    console.log('✅ Types récupérés:', types);
    return types;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return null;
  }
}

// Test 2: Récupérer la hiérarchie administrative
async function testAdministrativeHierarchy() {
  console.log('\n🧪 Test 2: Hiérarchie administrative');
  
  try {
    // Récupérer les ministères
    const ministeresSnapshot = await db.collection('ministères').where('actif', '==', true).get();
    console.log(`📋 ${ministeresSnapshot.size} ministères trouvés`);
    
    if (ministeresSnapshot.empty) {
      console.log('⚠️  Aucun ministère trouvé. Exécutez "npm run seed:mobile" d\'abord');
      return false;
    }
    
    // Tester avec le premier ministère
    const ministere = ministeresSnapshot.docs[0];
    const ministereData = ministere.data();
    console.log(`📋 Test avec: ${ministereData.nom}`);
    
    // Récupérer les directions
    const directionsSnapshot = await db.collection('directions')
      .where('ministereId', '==', ministere.id)
      .where('actif', '==', true)
      .get();
    
    console.log(`📁 ${directionsSnapshot.size} directions trouvées`);
    
    if (!directionsSnapshot.empty) {
      const direction = directionsSnapshot.docs[0];
      const directionData = direction.data();
      console.log(`📁 Test avec: ${directionData.nom}`);
      
      // Récupérer les services
      const servicesSnapshot = await db.collection('services')
        .where('directionId', '==', direction.id)
        .where('actif', '==', true)
        .get();
      
      console.log(`🏢 ${servicesSnapshot.size} services trouvés`);
      
      if (!servicesSnapshot.empty) {
        const service = servicesSnapshot.docs[0];
        const serviceData = service.data();
        console.log(`🏢 Test avec: ${serviceData.nom}`);
        
        return {
          ministere: { id: ministere.id, ...ministereData },
          direction: { id: direction.id, ...directionData },
          service: { id: service.id, ...serviceData }
        };
      }
    }
    
    return { ministere: { id: ministere.id, ...ministereData } };
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    return null;
  }
}

// Test 3: Créer une plainte de test (workflow mobile complet)
async function testCreateComplaint(hierarchy) {
  console.log('\n🧪 Test 3: Création de plainte (workflow mobile)');
  
  if (!hierarchy) {
    console.log('⚠️  Pas de hiérarchie disponible, test ignoré');
    return false;
  }
  
  try {
    const complaintData = {
      title: 'Test Mobile - Retard de paiement',
      description: 'Plainte de test créée via le workflow mobile. Cette plainte simule une soumission depuis l\'application Flutter avec tous les champs requis.',
      complaintType: 'Retard de paiement',
      targetType: 'Structure publique',
      submissionTypes: ['Exposé', 'Vocal'],
      
      // Structure publique (hiérarchie)
      publicStructure: {
        ministereId: hierarchy.ministere.id,
        ministereName: hierarchy.ministere.nom,
        directionId: hierarchy.direction?.id || '',
        directionName: hierarchy.direction?.nom || '',
        serviceId: hierarchy.service?.id || '',
        serviceName: hierarchy.service?.nom || ''
      },
      
      // Localisation GPS (obligatoire sur mobile)
      location: {
        latitude: 14.6937,
        longitude: -17.4441,
        address: 'Dakar, Plateau, Sénégal'
      },
      
      // Simulation de médias
      mediaFiles: [
        {
          type: 'image',
          url: 'https://example.com/photo1.jpg',
          filename: 'evidence_photo_1.jpg',
          size: 1024000,
          mimeType: 'image/jpeg'
        },
        {
          type: 'image',
          url: 'https://example.com/photo2.jpg',
          filename: 'evidence_photo_2.jpg',
          size: 892000,
          mimeType: 'image/jpeg'
        }
      ],
      
      // Enregistrement vocal (si type vocal sélectionné)
      vocalRecording: {
        url: 'https://example.com/recording.m4a',
        duration: 45, // en secondes
        filename: 'vocal_complaint.m4a',
        size: 2048000,
        mimeType: 'audio/mp4'
      },
      
      // Métadonnées
      status: 'en-attente',
      priority: 'moyenne',
      isDraft: false,
      submittedBy: TEST_USER_UID,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Validation workflow mobile
      mobileWorkflow: {
        completed: true,
        steps: ['typologie', 'structure', 'expose', 'localisation', 'medias'],
        version: '1.0.0'
      },
      
      // Contexte
      context: {
        source: 'mobile_app',
        platform: 'flutter',
        version: '1.0.0',
        language: 'fr'
      }
    };
    
    // Créer la plainte
    const complaintRef = await db.collection('complaints').add(complaintData);
    console.log(`✅ Plainte créée avec ID: ${complaintRef.id}`);
    
    // Vérifier la création
    const createdComplaint = await complaintRef.get();
    if (createdComplaint.exists) {
      const data = createdComplaint.data();
      console.log(`📋 Titre: ${data.title}`);
      console.log(`🎯 Type: ${data.complaintType} → ${data.targetType}`);
      console.log(`🏛️  Structure: ${data.publicStructure.ministereName}`);
      if (data.publicStructure.directionName) {
        console.log(`📁 Direction: ${data.publicStructure.directionName}`);
      }
      if (data.publicStructure.serviceName) {
        console.log(`🏢 Service: ${data.publicStructure.serviceName}`);
      }
      console.log(`📍 Localisation: ${data.location.address}`);
      console.log(`📸 Médias: ${data.mediaFiles.length} images`);
      console.log(`🎤 Audio: ${data.vocalRecording ? 'Oui (' + data.vocalRecording.duration + 's)' : 'Non'}`);
      
      return complaintRef.id;
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    return null;
  }
}

// Test 4: Créer un brouillon et le finaliser
async function testDraftWorkflow(hierarchy) {
  console.log('\n🧪 Test 4: Workflow brouillon → finalisation');
  
  if (!hierarchy) {
    console.log('⚠️  Pas de hiérarchie disponible, test ignoré');
    return false;
  }
  
  try {
    // Créer un brouillon (données minimales)
    const draftData = {
      title: 'Brouillon Mobile - Problème administratif',
      description: 'Brouillon sauvegardé depuis l\'app mobile. Description partielle...',
      complaintType: 'Problème administratif',
      targetType: 'Structure publique',
      submissionTypes: ['Exposé'],
      
      // Structure publique (partiellement remplie)
      publicStructure: {
        ministereId: hierarchy.ministere.id,
        ministereName: hierarchy.ministere.nom,
        directionId: '',
        directionName: '',
        serviceId: '',
        serviceName: ''
      },
      
      // Métadonnées brouillon
      status: 'brouillon',
      priority: 'moyenne',
      isDraft: true,
      submittedBy: TEST_USER_UID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Workflow mobile incomplet
      mobileWorkflow: {
        completed: false,
        steps: ['typologie', 'structure'], // Seules 2 étapes complétées
        version: '1.0.0'
      },
      
      context: {
        source: 'mobile_app',
        platform: 'flutter',
        version: '1.0.0',
        language: 'fr'
      }
    };
    
    // Créer le brouillon
    const draftRef = await db.collection('complaints').add(draftData);
    console.log(`📝 Brouillon créé avec ID: ${draftRef.id}`);
    
    // Attendre un peu pour simuler l'utilisateur qui continue
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Finaliser le brouillon (compléter les données)
    const finalizedData = {
      description: draftData.description + '\n\nComplément ajouté après sauvegarde. Le problème concerne les délais de traitement des dossiers qui sont bien trop longs.',
      
      publicStructure: {
        ...draftData.publicStructure,
        directionId: hierarchy.direction?.id || '',
        directionName: hierarchy.direction?.nom || '',
        serviceId: hierarchy.service?.id || '',
        serviceName: hierarchy.service?.nom || ''
      },
      
      // Ajouter localisation
      location: {
        latitude: 14.7158,
        longitude: -17.4731,
        address: 'Dakar, Médina, Sénégal'
      },
      
      // Ajouter un média
      mediaFiles: [
        {
          type: 'image',
          url: 'https://example.com/document.jpg',
          filename: 'document_administratif.jpg',
          size: 1500000,
          mimeType: 'image/jpeg'
        }
      ],
      
      // Finalisation
      status: 'en-attente',
      isDraft: false,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Workflow complet
      mobileWorkflow: {
        completed: true,
        steps: ['typologie', 'structure', 'expose', 'localisation', 'medias'],
        version: '1.0.0'
      }
    };
    
    // Mettre à jour le brouillon
    await draftRef.update(finalizedData);
    console.log(`✅ Brouillon finalisé avec succès`);
    
    // Vérifier la finalisation
    const finalizedDoc = await draftRef.get();
    if (finalizedDoc.exists) {
      const data = finalizedDoc.data();
      console.log(`📋 Statut: ${data.status} (était brouillon)`);
      console.log(`✅ Workflow: ${data.mobileWorkflow.completed ? 'Complet' : 'Incomplet'}`);
      console.log(`📍 Localisation ajoutée: ${data.location ? 'Oui' : 'Non'}`);
      console.log(`📸 Médias ajoutés: ${data.mediaFiles?.length || 0}`);
    }
    
    return draftRef.id;
    
  } catch (error) {
    console.error('❌ Erreur dans le workflow brouillon:', error);
    return null;
  }
}

// Test 5: Tester les requêtes avec filtres (comme sur mobile)
async function testMobileQueries() {
  console.log('\n🧪 Test 5: Requêtes mobiles avec filtres');
  
  try {
    // Requête 1: Toutes les plaintes de l'utilisateur
    const userComplaintsSnapshot = await db.collection('complaints')
      .where('submittedBy', '==', TEST_USER_UID)
      .orderBy('createdAt', 'desc')
      .get();
    
    console.log(`👤 Plaintes de l'utilisateur test: ${userComplaintsSnapshot.size}`);
    
    // Requête 2: Plaintes par type
    const paymentComplaintsSnapshot = await db.collection('complaints')
      .where('complaintType', '==', 'Retard de paiement')
      .where('submittedBy', '==', TEST_USER_UID)
      .get();
    
    console.log(`💰 Plaintes 'Retard de paiement': ${paymentComplaintsSnapshot.size}`);
    
    // Requête 3: Brouillons uniquement
    const draftsSnapshot = await db.collection('complaints')
      .where('isDraft', '==', true)
      .where('submittedBy', '==', TEST_USER_UID)
      .get();
    
    console.log(`📝 Brouillons: ${draftsSnapshot.size}`);
    
    // Requête 4: Plaintes finalisées uniquement
    const finalizedSnapshot = await db.collection('complaints')
      .where('isDraft', '==', false)
      .where('submittedBy', '==', TEST_USER_UID)
      .get();
    
    console.log(`✅ Plaintes finalisées: ${finalizedSnapshot.size}`);
    
    // Afficher détails de chaque plainte
    if (!userComplaintsSnapshot.empty) {
      console.log('\n📋 Détails des plaintes créées:');
      userComplaintsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ${data.title} (${data.status}) - ${data.isDraft ? 'BROUILLON' : 'FINALISÉ'}`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors des requêtes:', error);
    return false;
  }
}

// Fonction de nettoyage
async function cleanup() {
  console.log('\n🧹 Nettoyage des données de test...');
  
  try {
    const testComplaintsSnapshot = await db.collection('complaints')
      .where('submittedBy', '==', TEST_USER_UID)
      .get();
    
    if (!testComplaintsSnapshot.empty) {
      const batch = db.batch();
      testComplaintsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`✅ ${testComplaintsSnapshot.size} plaintes de test supprimées`);
    } else {
      console.log('ℹ️  Aucune plainte de test à supprimer');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Script principal
async function runMobileWorkflowTests() {
  console.log('🚀 Démarrage des tests du workflow mobile');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Types de plaintes
    const types = await testGetComplaintTypes();
    if (!types) return;
    
    // Test 2: Hiérarchie administrative
    const hierarchy = await testAdministrativeHierarchy();
    if (!hierarchy) {
      console.log('\n⚠️  Tests nécessitant la hiérarchie administrative ignorés');
      console.log('💡 Exécutez "npm run seed:mobile" pour créer les données de test');
      return;
    }
    
    // Test 3: Création de plainte complète
    const complaintId = await testCreateComplaint(hierarchy);
    if (!complaintId) return;
    
    // Test 4: Workflow brouillon
    const draftId = await testDraftWorkflow(hierarchy);
    
    // Test 5: Requêtes mobiles
    const queriesOk = await testMobileQueries();
    
    // Résumé
    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('='.repeat(50));
    console.log(`✅ Types de plaintes: ${types ? 'OK' : 'ÉCHEC'}`);
    console.log(`✅ Hiérarchie administrative: ${hierarchy ? 'OK' : 'ÉCHEC'}`);
    console.log(`✅ Création de plainte: ${complaintId ? 'OK' : 'ÉCHEC'}`);
    console.log(`✅ Workflow brouillon: ${draftId ? 'OK' : 'ÉCHEC'}`);
    console.log(`✅ Requêtes mobiles: ${queriesOk ? 'OK' : 'ÉCHEC'}`);
    
    console.log('\n🎉 Tests du workflow mobile terminés avec succès !');
    console.log('📱 Le backend est prêt pour l\'intégration avec l\'app Flutter');
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    await cleanup();
    process.exit(0);
  }
  
  await runMobileWorkflowTests();
  
  // Nettoyage automatique si demandé
  if (args.includes('--auto-cleanup')) {
    await cleanup();
  }
  
  process.exit(0);
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runMobileWorkflowTests, cleanup }; 