import { db } from '../config/firebase.js';

/**
 * Script pour peupler la base de données avec les structures administratives
 * Hiérarchie : Ministère > Direction > Service
 * Compatible avec le workflow mobile Flutter
 */

const ministeresData = [
  {
    nom: "Ministère de l'Éducation Nationale",
    code: "MEN",
    description: "Responsable du système éducatif national",
    contact: {
      telephone: "221338211234",
      email: "contact@education.gov.sn",
      adresse: "Rue Docteur Thèze, Dakar"
    },
    directions: [
      {
        nom: "Direction de l'Enseignement Élémentaire",
        code: "DEE",
        description: "Gestion de l'enseignement primaire",
        services: [
          {
            nom: "Service de la Planification",
            code: "SP",
            description: "Planification des infrastructures scolaires"
          },
          {
            nom: "Service des Ressources Humaines",
            code: "SRH",
            description: "Gestion du personnel enseignant"
          },
          {
            nom: "Service des Programmes",
            code: "SPG",
            description: "Développement des programmes scolaires"
          }
        ]
      },
      {
        nom: "Direction de l'Enseignement Moyen et Secondaire",
        code: "DEMS",
        description: "Gestion de l'enseignement secondaire",
        services: [
          {
            nom: "Service des Examens",
            code: "SE",
            description: "Organisation des examens nationaux"
          },
          {
            nom: "Service de l'Orientation",
            code: "SO",
            description: "Orientation scolaire et professionnelle"
          }
        ]
      }
    ]
  },
  {
    nom: "Ministère de la Santé et de l'Action Sociale",
    code: "MSAS",
    description: "Responsable de la politique sanitaire nationale",
    contact: {
      telephone: "221338229876",
      email: "contact@sante.gov.sn",
      adresse: "Fann Résidence, Dakar"
    },
    directions: [
      {
        nom: "Direction de la Prévention",
        code: "DP",
        description: "Prévention et promotion de la santé",
        services: [
          {
            nom: "Service de la Vaccination",
            code: "SV",
            description: "Programme national de vaccination"
          },
          {
            nom: "Service de l'Hygiène Publique",
            code: "SHP",
            description: "Contrôle de l'hygiène publique"
          }
        ]
      },
      {
        nom: "Direction des Établissements de Santé",
        code: "DES",
        description: "Gestion des hôpitaux et centres de santé",
        services: [
          {
            nom: "Service des Hôpitaux",
            code: "SH",
            description: "Gestion des hôpitaux régionaux"
          },
          {
            nom: "Service des Centres de Santé",
            code: "SCS",
            description: "Gestion des centres de santé communautaires"
          }
        ]
      }
    ]
  },
  {
    nom: "Ministère des Infrastructures et des Transports",
    code: "MIT",
    description: "Développement des infrastructures de transport",
    contact: {
      telephone: "221338215555",
      email: "contact@transport.gov.sn",
      adresse: "Building Administratif, Dakar"
    },
    directions: [
      {
        nom: "Direction des Routes",
        code: "DR",
        description: "Construction et entretien des routes",
        services: [
          {
            nom: "Service de la Construction",
            code: "SC",
            description: "Construction de nouvelles routes"
          },
          {
            nom: "Service de l'Entretien",
            code: "SE",
            description: "Entretien du réseau routier"
          }
        ]
      },
      {
        nom: "Direction des Transports",
        code: "DT",
        description: "Régulation des transports publics",
        services: [
          {
            nom: "Service du Transport Urbain",
            code: "STU",
            description: "Gestion du transport en commun urbain"
          },
          {
            nom: "Service du Transport Interurbain",
            code: "STI",
            description: "Régulation du transport entre villes"
          }
        ]
      }
    ]
  },
  {
    nom: "Ministère de l'Intérieur",
    code: "MI",
    description: "Sécurité intérieure et administration territoriale",
    contact: {
      telephone: "221338217777",
      email: "contact@interieur.gov.sn",
      adresse: "Place de l'Indépendance, Dakar"
    },
    directions: [
      {
        nom: "Direction de l'Administration Territoriale",
        code: "DAT",
        description: "Gestion de l'administration territoriale",
        services: [
          {
            nom: "Service des Collectivités Locales",
            code: "SCL",
            description: "Supervision des communes et départements"
          },
          {
            nom: "Service de l'État Civil",
            code: "SEC",
            description: "Gestion de l'état civil"
          }
        ]
      }
    ]
  },
  {
    nom: "Ministère de l'Économie et des Finances",
    code: "MEF",
    description: "Politique économique et financière",
    contact: {
      telephone: "221338218888",
      email: "contact@finances.gov.sn",
      adresse: "Rue René Ndiaye, Dakar"
    },
    directions: [
      {
        nom: "Direction du Budget",
        code: "DB",
        description: "Élaboration et exécution du budget de l'État",
        services: [
          {
            nom: "Service de la Prévision",
            code: "SP",
            description: "Prévisions budgétaires"
          },
          {
            nom: "Service du Contrôle",
            code: "SC",
            description: "Contrôle de l'exécution budgétaire"
          }
        ]
      },
      {
        nom: "Direction des Impôts et Domaines",
        code: "DID",
        description: "Collecte des impôts et gestion du domaine",
        services: [
          {
            nom: "Service des Impôts Directs",
            code: "SID",
            description: "Gestion des impôts directs"
          },
          {
            nom: "Service des Impôts Indirects",
            code: "SII",
            description: "Gestion des impôts indirects"
          }
        ]
      }
    ]
  }
];

async function seedMinisteres() {
  console.log('🌱 Début du peuplement des ministères...');
  
  try {
    for (const ministereData of ministeresData) {
      console.log(`\n📋 Création du ministère: ${ministereData.nom}`);
      
      // Créer le ministère
      const ministereDoc = {
        nom: ministereData.nom,
        code: ministereData.code,
        description: ministereData.description,
        actif: true,
        contact: ministereData.contact,
        statistiques: {
          nombreDirections: ministereData.directions.length,
          nombreServices: ministereData.directions.reduce((total, dir) => total + dir.services.length, 0),
          nombrePlaintes: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      };
      
      const ministereRef = await db.collection('ministeres').add(ministereDoc);
      console.log(`✅ Ministère créé avec ID: ${ministereRef.id}`);
      
      // Créer les directions
      for (const directionData of ministereData.directions) {
        console.log(`  📁 Création de la direction: ${directionData.nom}`);
        
        const directionDoc = {
          nom: directionData.nom,
          code: directionData.code,
          description: directionData.description,
          ministereId: ministereRef.id,
          ministereName: ministereData.nom,
          actif: true,
          responsable: {},
          statistiques: {
            nombreServices: directionData.services.length,
            nombrePlaintes: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        };
        
        const directionRef = await db.collection('directions').add(directionDoc);
        console.log(`    ✅ Direction créée avec ID: ${directionRef.id}`);
        
        // Créer les services
        for (const serviceData of directionData.services) {
          console.log(`    🏢 Création du service: ${serviceData.nom}`);
          
          const serviceDoc = {
            nom: serviceData.nom,
            code: serviceData.code,
            description: serviceData.description,
            ministereId: ministereRef.id,
            directionId: directionRef.id,
            ministereName: ministereData.nom,
            directionName: directionData.nom,
            actif: true,
            responsable: {},
            localisation: {},
            statistiques: {
              nombrePlaintes: 0,
              nombrePlaintesResolues: 0,
              tempsReponseResolute: 0
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system'
          };
          
          const serviceRef = await db.collection('services').add(serviceDoc);
          console.log(`      ✅ Service créé avec ID: ${serviceRef.id}`);
        }
      }
    }
    
    console.log('\n🎉 Peuplement terminé avec succès !');
    console.log(`📊 Résumé:`);
    console.log(`   - ${ministeresData.length} ministères créés`);
    console.log(`   - ${ministeresData.reduce((total, m) => total + m.directions.length, 0)} directions créées`);
    console.log(`   - ${ministeresData.reduce((total, m) => total + m.directions.reduce((total2, d) => total2 + d.services.length, 0), 0)} services créés`);
    
  } catch (error) {
    console.error('❌ Erreur lors du peuplement:', error);
  }
}

// Fonction pour nettoyer les collections
async function cleanCollections() {
  console.log('🧹 Nettoyage des collections...');
  
  const collections = ['services', 'directions', 'ministeres'];
  
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ Collection ${collectionName} nettoyée (${snapshot.size} documents supprimés)`);
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--clean')) {
    await cleanCollections();
  }
  
  await seedMinisteres();
  
  process.exit(0);
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { seedMinisteres, cleanCollections }; 