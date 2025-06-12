import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Configuration Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Niaxtu Backend API',
      version: '1.0.0',
      description: 'API REST complète pour la plateforme Niaxtu - Gestion des plaintes et administration',
      contact: {
        name: 'Équipe Niaxtu',
        email: 'support@niaxtu.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.niaxtu.com',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token Firebase JWT'
        },
        TestTokenAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Base64',
          description: 'Token de test pour développement (généré via POST /api/test-token)'
        }
      },
      schemas: {
        // Modèle Administrateur
        Admin: {
          type: 'object',
          required: ['uid', 'email', 'role'],
          properties: {
            uid: {
              type: 'string',
              description: 'Identifiant unique de l\'administrateur',
              example: 'admin_1749675455099_mx7hrs83e'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'administrateur',
              example: 'admin@niaxtu.com'
            },
            displayName: {
              type: 'string',
              description: 'Nom d\'affichage',
              example: 'Super Administrateur'
            },
            photoURL: {
              type: 'string',
              format: 'uri',
              description: 'URL photo de profil'
            },
            role: {
              type: 'string',
              enum: ['analyst', 'moderator', 'structure_manager', 'sector_manager', 'admin', 'super_admin'],
              description: 'Rôle administrateur',
              example: 'super_admin'
            },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Permissions spécifiques',
              example: ['MANAGE_USERS', 'VIEW_REPORTS']
            },
            isActive: {
              type: 'boolean',
              description: 'Administrateur actif',
              example: true
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Dernière connexion'
            },
            profile: {
              type: 'object',
              properties: {
                firstName: { type: 'string', example: 'Super' },
                lastName: { type: 'string', example: 'Administrateur' },
                phone: { type: 'string', example: '+221 77 123 45 67' },
                organization: { type: 'string', example: 'Niaxtu Administration' },
                position: { type: 'string', example: 'Super Administrateur Système' },
                bio: { type: 'string', example: 'Compte super administrateur du système Niaxtu' }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de mise à jour'
            }
          }
        },

        // Modèle Utilisateur (pour référence)
        User: {
          type: 'object',
          required: ['uid', 'email', 'role'],
          properties: {
            uid: {
              type: 'string',
              description: 'Firebase UID',
              example: 'abc123def456'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email utilisateur',
              example: 'user@niaxtu.com'
            },
            displayName: {
              type: 'string',
              description: 'Nom d\'affichage',
              example: 'Jean Dupont'
            },
            role: {
              type: 'string',
              enum: ['user'],
              description: 'Rôle utilisateur (seuls les admins sont gérés dans cette API)',
              example: 'user'
            }
          }
        },

        // Modèle Plainte
        Complaint: {
          type: 'object',
          required: ['title', 'description', 'type', 'sector'],
          properties: {
            id: { type: 'string', example: 'complaint_123' },
            title: { type: 'string', example: 'Route dégradée avenue Victor Hugo' },
            description: { 
              type: 'string', 
              example: 'Nids de poule importants rendant la circulation dangereuse' 
            },
            type: { type: 'string', example: 'Infrastructure' },
            sector: { type: 'string', example: 'Transport' },
            subSector: { type: 'string', example: 'Voirie' },
            structure: { type: 'string', example: 'Mairie du 15ème' },
            status: {
              type: 'string',
              enum: ['en-attente', 'en-traitement', 'resolue', 'rejetee'],
              example: 'en-attente'
            },
            priority: {
              type: 'string',
              enum: ['faible', 'moyenne', 'elevee', 'urgente'],
              example: 'elevee'
            },
            location: {
              type: 'object',
              properties: {
                address: { type: 'string', example: '123 Avenue Victor Hugo' },
                city: { type: 'string', example: 'Paris' },
                coordinates: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number', example: 48.8566 },
                    lng: { type: 'number', example: 2.3522 }
                  }
                }
              }
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  size: { type: 'number' }
                }
              }
            },
            submittedBy: { type: 'string', example: 'user_123' },
            assignedTo: { type: 'string', example: 'admin_456' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            resolvedAt: { type: 'string', format: 'date-time' },
            comments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  text: { type: 'string' },
                  authorId: { type: 'string' },
                  authorName: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  isInternal: { type: 'boolean' }
                }
              }
            },
            tags: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },

        // Modèle Secteur
        Sector: {
          type: 'object',
          required: ['name'],
          properties: {
            id: { type: 'string', example: 'sector_123' },
            name: { type: 'string', example: 'Transport' },
            description: { type: 'string', example: 'Secteur des transports publics et voirie' },
            icon: { type: 'string', example: 'fa-bus' },
            color: { type: 'string', example: '#3b82f6' },
            isActive: { type: 'boolean', example: true },
            order: { type: 'number', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            createdBy: { type: 'string', example: 'admin_123' }
          }
        },

        // Modèle Sous-secteur
        SubSector: {
          type: 'object',
          required: ['name', 'sectorId'],
          properties: {
            id: { type: 'string', example: 'subsector_123' },
            name: { type: 'string', example: 'Voirie' },
            description: { type: 'string', example: 'Gestion des routes et trottoirs' },
            sectorId: { type: 'string', example: 'sector_123' },
            icon: { type: 'string', example: 'fa-road' },
            isActive: { type: 'boolean', example: true },
            order: { type: 'number', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            createdBy: { type: 'string', example: 'admin_123' }
          }
        },

        // Modèle Structure
        Structure: {
          type: 'object',
          required: ['name', 'sectorId'],
          properties: {
            id: { type: 'string', example: 'structure_123' },
            name: { type: 'string', example: 'Gare Centrale' },
            description: { type: 'string', example: 'Gare principale de la ville' },
            sectorId: { type: 'string', example: 'sector_123' },
            subSectorId: { type: 'string', example: 'subsector_123' },
            type: { type: 'string', example: 'Infrastructure' },
            location: {
              type: 'object',
              properties: {
                address: { type: 'string', example: '1 Place de la Gare' },
                city: { type: 'string', example: 'Paris' },
                zipCode: { type: 'string', example: '75001' },
                coordinates: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number', example: 48.8566 },
                    lng: { type: 'number', example: 2.3522 }
                  }
                }
              }
            },
            contact: {
              type: 'object',
              properties: {
                phone: { type: 'string', example: '+33123456789' },
                email: { type: 'string', example: 'contact@gare.fr' },
                website: { type: 'string', example: 'https://gare.fr' },
                manager: { type: 'string', example: 'Jean Dupont' }
              }
            },
            isActive: { type: 'boolean', example: true },
            capacity: { type: 'number', example: 1000 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            createdBy: { type: 'string', example: 'admin_123' }
          }
        },

        // ==================== STRUCTURE ORGANISATIONNELLE ====================

        // Modèle Ministère
        Ministere: {
          type: 'object',
          required: ['nom', 'code'],
          properties: {
            id: { type: 'string', example: 'ministere_123' },
            nom: { type: 'string', example: "Ministère de l'Intérieur" },
            code: { type: 'string', example: 'MIN_INT' },
            description: { type: 'string', example: 'Ministère chargé de la sécurité intérieure' },
            ministre: { type: 'string', example: 'Jean Dupont' },
            adresse: {
              type: 'object',
              properties: {
                rue: { type: 'string', example: '1 Place Beauvau' },
                ville: { type: 'string', example: 'Paris' },
                codePostal: { type: 'string', example: '75008' },
                pays: { type: 'string', example: 'France' }
              }
            },
            contact: {
              type: 'object',
              properties: {
                telephone: { type: 'string', example: '+33 1 49 27 49 27' },
                email: { type: 'string', example: 'contact@interieur.gouv.fr' },
                siteWeb: { type: 'string', example: 'https://www.interieur.gouv.fr' }
              }
            },
            logo: { type: 'string', example: 'https://example.com/logo.png' },
            couleur: { type: 'string', example: '#dc2626' },
            isActif: { type: 'boolean', example: true },
            dateCreation: { type: 'string', format: 'date-time' },
            dateMiseAJour: { type: 'string', format: 'date-time' },
            creePar: { type: 'string', example: 'admin_123' }
          }
        },

        // Modèle Direction
        Direction: {
          type: 'object',
          required: ['nom', 'code', 'ministereId'],
          properties: {
            id: { type: 'string', example: 'direction_456' },
            nom: { type: 'string', example: 'Direction Générale de la Sécurité Publique' },
            code: { type: 'string', example: 'DGSP' },
            description: { type: 'string', example: 'Direction chargée de la sécurité publique' },
            ministereId: { type: 'string', example: 'ministere_123' },
            directeur: { type: 'string', example: 'Marie Martin' },
            typeDirection: { 
              type: 'string', 
              enum: ['Générale', 'Régionale', 'Départementale'],
              example: 'Générale' 
            },
            isActif: { type: 'boolean', example: true },
            dateCreation: { type: 'string', format: 'date-time' },
            dateMiseAJour: { type: 'string', format: 'date-time' },
            creepar: { type: 'string', example: 'admin_123' }
          }
        },

        // Modèle Service
        Service: {
          type: 'object',
          required: ['nom', 'code', 'directionId'],
          properties: {
            id: { type: 'string', example: 'service_789' },
            nom: { type: 'string', example: 'Service de Police Municipale' },
            code: { type: 'string', example: 'SPM' },
            description: { type: 'string', example: 'Service de police de proximité' },
            directionId: { type: 'string', example: 'direction_456' },
            ministereId: { type: 'string', example: 'ministere_123' },
            chefService: { type: 'string', example: 'Pierre Durand' },
            typeService: { 
              type: 'string', 
              enum: ['Opérationnel', 'Support', 'Administratif'],
              example: 'Opérationnel' 
            },
            isActif: { type: 'boolean', example: true },
            dateCreation: { type: 'string', format: 'date-time' },
            dateMiseAJour: { type: 'string', format: 'date-time' },
            creepar: { type: 'string', example: 'admin_123' }
          }
        },

        // Modèle Bureau
        Bureau: {
          type: 'object',
          required: ['nom', 'code', 'serviceId'],
          properties: {
            id: { type: 'string', example: 'bureau_012' },
            nom: { type: 'string', example: 'Bureau des Permis de Conduire' },
            code: { type: 'string', example: 'BPC' },
            description: { type: 'string', example: 'Bureau de délivrance des permis' },
            serviceId: { type: 'string', example: 'service_789' },
            directionId: { type: 'string', example: 'direction_456' },
            ministereId: { type: 'string', example: 'ministere_123' },
            responsable: { type: 'string', example: 'Sophie Leblanc' },
            typeBureau: { 
              type: 'string', 
              enum: ['Accueil', 'Traitement', 'Contrôle'],
              example: 'Accueil' 
            },
            isActif: { type: 'boolean', example: true },
            dateCreation: { type: 'string', format: 'date-time' },
            dateMiseAJour: { type: 'string', format: 'date-time' },
            creepar: { type: 'string', example: 'admin_123' }
          }
        },

        // Modèle Pagination
        Pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', example: 1 },
            totalPages: { type: 'integer', example: 5 },
            totalItems: { type: 'integer', example: 100 },
            itemsPerPage: { type: 'integer', example: 20 }
          }
        },

        // Réponses d'erreur
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Message d\'erreur'
            },
            code: {
              type: 'string',
              description: 'Code d\'erreur'
            },
            details: {
              type: 'object',
              description: 'Détails supplémentaires'
            }
          }
        },

        // Réponse de succès
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Message de succès'
            },
            data: {
              type: 'object',
              description: 'Données de réponse'
            }
          }
        },

        // ==================== TOKENS DE TEST ====================

        // Demande de génération de token de test
        TestTokenRequest: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['plaignant', 'admin'],
              description: 'Rôle pour le token de test',
              example: 'plaignant'
            },
            uid: {
              type: 'string',
              description: 'UID personnalisé (optionnel, généré automatiquement si non fourni)',
              example: 'test-user-123'
            }
          }
        },

        // Réponse de génération de token de test
        TestTokenResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Token de test généré avec succès'
            },
            token: {
              type: 'string',
              description: 'Token de test encodé en base64',
              example: 'eyJ1aWQiOiJ0ZXN0LXVzZXItMTczNDU2Nzg5MCIsInJvbGUiOiJwbGFpZ25hbnQiLCJlbWFpbCI6InRlc3QtdXNlci0xNzM0NTY3ODkwQHRlc3QuY29tIiwiZXhwIjoxNzM0NjU0MjkwLCJpYXQiOjE3MzQ1Njc4OTAsInRlc3QiOnRydWV9'
            },
            user: {
              type: 'object',
              properties: {
                uid: {
                  type: 'string',
                  example: 'test-user-1734567890'
                },
                role: {
                  type: 'string',
                  example: 'plaignant'
                },
                email: {
                  type: 'string',
                  example: 'test-user-1734567890@test.com'
                }
              }
            },
            usage: {
              type: 'object',
              properties: {
                header: {
                  type: 'string',
                  example: 'Authorization'
                },
                value: {
                  type: 'string',
                  example: 'Bearer eyJ1aWQiOiJ0ZXN0LXVzZXItMTczNDU2Nzg5MCIsInJvbGUiOiJwbGFpZ25hbnQiLCJlbWFpbCI6InRlc3QtdXNlci0xNzM0NTY3ODkwQHRlc3QuY29tIiwiZXhwIjoxNzM0NjU0MjkwLCJpYXQiOjE3MzQ1Njc4OTAsInRlc3QiOnRydWV9'
                },
                example: {
                  type: 'string',
                  example: 'curl -H "Authorization: Bearer [TOKEN]" http://localhost:3001/api/plaignant'
                }
              }
            },
            warning: {
              type: 'string',
              example: '⚠️ Ce token est uniquement pour les tests de développement'
            }
          }
        },

        // Informations sur un token de test
        TestTokenInfo: {
          type: 'object',
          properties: {
            valid: {
              type: 'boolean',
              example: true
            },
            user: {
              type: 'object',
              properties: {
                uid: {
                  type: 'string',
                  example: 'test-user-1734567890'
                },
                role: {
                  type: 'string',
                  example: 'plaignant'
                },
                email: {
                  type: 'string',
                  example: 'test-user-1734567890@test.com'
                }
              }
            },
            expires: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'expiration du token',
              example: '2024-12-20T10:30:00.000Z'
            },
            issued: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création du token',
              example: '2024-12-19T10:30:00.000Z'
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js'] // chemins vers les fichiers contenant les annotations JSDoc
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs }; 