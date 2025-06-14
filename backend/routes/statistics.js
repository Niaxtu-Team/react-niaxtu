import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { UserPermissions } from '../models/User.js';
import { db } from '../config/firebase.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/statistics/advanced:
 *   get:
 *     summary: Statistiques avancées complètes
 *     tags: [Statistiques]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 6m, 1y]
 *         description: Période d'analyse
 *       - in: query
 *         name: includeTimeline
 *         schema:
 *           type: boolean
 *         description: Inclure les données temporelles
 *     responses:
 *       200:
 *         description: Statistiques avancées récupérées
 */
router.get('/advanced', requirePermission(UserPermissions.VIEW_REPORTS), async (req, res) => {
  try {
    const { period = '30d', includeTimeline = 'true' } = req.query;
    
    // Calculer les dates selon la période
    const now = new Date();
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '6m': 180,
      '1y': 365
    };
    
    const startDate = new Date(now.getTime() - (periodDays[period] * 24 * 60 * 60 * 1000));
    
    // Récupérer toutes les données nécessaires
    const [complaintsSnapshot, usersSnapshot, sectorsSnapshot, structuresSnapshot] = await Promise.all([
      db.collection('complaints').where('createdAt', '>=', startDate).get(),
      db.collection('admin').get(),
      db.collection('sectors').get(),
      db.collection('structures').get()
    ]);
    
    const complaints = [];
    complaintsSnapshot.forEach(doc => complaints.push({ id: doc.id, ...doc.data() }));
    
    const users = [];
    usersSnapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
    
    const sectors = [];
    sectorsSnapshot.forEach(doc => sectors.push({ id: doc.id, ...doc.data() }));
    
    const structures = [];
    structuresSnapshot.forEach(doc => structures.push({ id: doc.id, ...doc.data() }));
    
    // Calculer les statistiques avancées
    const stats = {
      overview: calculateOverviewStats(complaints, users, sectors, structures),
      timeline: includeTimeline === 'true' ? calculateTimelineStats(complaints, period) : null,
      distributions: calculateDistributionStats(complaints, users),
      performance: calculatePerformanceStats(complaints),
      trends: calculateTrendStats(complaints, period),
      comparisons: await calculateComparisonStats(complaints, period)
    };
    
    res.json({
      success: true,
      data: stats,
      period,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur statistiques avancées:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des statistiques avancées' 
    });
  }
});

/**
 * @swagger
 * /api/statistics/realtime:
 *   get:
 *     summary: Données en temps réel
 *     tags: [Statistiques]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Données temps réel récupérées
 */
router.get('/realtime', requirePermission(UserPermissions.VIEW_REPORTS), async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    // Données de la dernière heure
    const [recentComplaints, recentResolutions, urgentComplaints, activeAdmins] = await Promise.all([
      db.collection('complaints').where('createdAt', '>=', oneHourAgo).get(),
      db.collection('complaints').where('status', '==', 'resolue').where('resolvedAt', '>=', oneHourAgo).get(),
      db.collection('complaints').where('priority', 'in', ['urgente', 'critique']).where('status', '!=', 'resolue').get(),
      db.collection('admin').where('lastActivity', '>=', oneDayAgo).where('isActive', '==', true).get()
    ]);
    
    const realTimeData = {
      newComplaints: recentComplaints.size,
      resolvedComplaints: recentResolutions.size,
      urgentComplaints: urgentComplaints.size,
      activeAdmins: activeAdmins.size,
      timestamp: now.toISOString()
    };
    
    res.json({
      success: true,
      data: realTimeData
    });
    
  } catch (error) {
    console.error('Erreur données temps réel:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des données temps réel' 
    });
  }
});

/**
 * @swagger
 * /api/statistics/export:
 *   post:
 *     summary: Exporter les statistiques
 *     tags: [Statistiques]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [csv, excel, pdf]
 *               period:
 *                 type: string
 *               includeCharts:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Export généré avec succès
 */
router.post('/export', requirePermission(UserPermissions.EXPORT_DATA), async (req, res) => {
  try {
    const { format = 'csv', period = '30d', includeCharts = false } = req.body;
    
    // Récupérer les données pour l'export
    const stats = await getAdvancedStats(period);
    
    // Générer le fichier selon le format
    let exportData;
    let contentType;
    let filename;
    
    switch (format) {
      case 'csv':
        exportData = generateCSVExport(stats);
        contentType = 'text/csv';
        filename = `statistiques-${period}-${Date.now()}.csv`;
        break;
      case 'excel':
        exportData = generateExcelExport(stats);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `statistiques-${period}-${Date.now()}.xlsx`;
        break;
      case 'pdf':
        exportData = await generatePDFExport(stats, includeCharts);
        contentType = 'application/pdf';
        filename = `statistiques-${period}-${Date.now()}.pdf`;
        break;
      default:
        throw new Error('Format d\'export non supporté');
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
    
  } catch (error) {
    console.error('Erreur export statistiques:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de l\'export des statistiques' 
    });
  }
});

// Fonctions utilitaires
function calculateOverviewStats(complaints, users, sectors, structures) {
  return {
    complaints: {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'en-attente').length,
      inProgress: complaints.filter(c => c.status === 'en-traitement').length,
      resolved: complaints.filter(c => c.status === 'resolue').length,
      rejected: complaints.filter(c => c.status === 'rejetee').length
    },
    users: {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      admins: users.length
    },
    structures: {
      ministries: structures.filter(s => s.type === 'ministere').length,
      directions: structures.filter(s => s.type === 'direction').length,
      services: structures.filter(s => s.type === 'service').length
    },
    sectors: {
      total: sectors.length,
      active: sectors.filter(s => s.isActive).length
    }
  };
}

function calculateTimelineStats(complaints, period) {
  const timeline = {};
  const now = new Date();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 180;
  
  // Initialiser les dates
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    timeline[key] = { complaints: 0, resolutions: 0 };
  }
  
  // Compter les plaintes par date
  complaints.forEach(complaint => {
    const createdDate = new Date(complaint.createdAt).toISOString().split('T')[0];
    if (timeline[createdDate]) {
      timeline[createdDate].complaints++;
    }
    
    if (complaint.status === 'resolue' && complaint.resolvedAt) {
      const resolvedDate = new Date(complaint.resolvedAt).toISOString().split('T')[0];
      if (timeline[resolvedDate]) {
        timeline[resolvedDate].resolutions++;
      }
    }
  });
  
  return {
    complaints: Object.entries(timeline).map(([date, data]) => ({ date, count: data.complaints })),
    resolutions: Object.entries(timeline).map(([date, data]) => ({ date, count: data.resolutions }))
  };
}

function calculateDistributionStats(complaints, users) {
  // Répartition par type
  const typeDistribution = {};
  complaints.forEach(c => {
    const type = c.complaintType || 'Non spécifié';
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
  });
  
  // Répartition par secteur
  const sectorDistribution = {};
  complaints.forEach(c => {
    const sector = c.targetType || 'Non spécifié';
    sectorDistribution[sector] = (sectorDistribution[sector] || 0) + 1;
  });
  
  // Répartition par priorité
  const priorityDistribution = {};
  complaints.forEach(c => {
    const priority = c.priority || 'Non spécifiée';
    priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
  });
  
  // Répartition par statut
  const statusDistribution = {};
  complaints.forEach(c => {
    const status = c.status || 'Non spécifié';
    statusDistribution[status] = (statusDistribution[status] || 0) + 1;
  });
  
  // Répartition des utilisateurs par rôle
  const roleDistribution = {};
  users.forEach(u => {
    const role = u.role || 'Non spécifié';
    roleDistribution[role] = (roleDistribution[role] || 0) + 1;
  });
  
  return {
    complaintsByType: Object.entries(typeDistribution).map(([label, count]) => ({ label, count })),
    complaintsBySector: Object.entries(sectorDistribution).map(([label, count]) => ({ label, count })),
    complaintsByPriority: Object.entries(priorityDistribution).map(([label, count]) => ({ label, count })),
    complaintsByStatus: Object.entries(statusDistribution).map(([label, count]) => ({ label, count })),
    usersByRole: Object.entries(roleDistribution).map(([label, count]) => ({ label, count }))
  };
}

function calculatePerformanceStats(complaints) {
  const resolvedComplaints = complaints.filter(c => c.status === 'resolue' && c.resolvedAt);
  
  // Temps de résolution moyen
  let averageResolutionTime = 0;
  if (resolvedComplaints.length > 0) {
    const totalDays = resolvedComplaints.reduce((sum, complaint) => {
      const created = new Date(complaint.createdAt);
      const resolved = new Date(complaint.resolvedAt);
      return sum + Math.floor((resolved - created) / (1000 * 60 * 60 * 24));
    }, 0);
    averageResolutionTime = Math.round(totalDays / resolvedComplaints.length);
  }
  
  // Taux de résolution
  const resolutionRate = complaints.length > 0 
    ? (resolvedComplaints.length / complaints.length) * 100 
    : 0;
  
  return {
    averageResolutionTime,
    resolutionRate,
    satisfactionRate: 85, // À calculer depuis les données réelles
    responseTime: 2.5 // À calculer depuis les données réelles
  };
}

function calculateTrendStats(complaints, period) {
  // Calculer les tendances par rapport à la période précédente
  const now = new Date();
  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const currentPeriodStart = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
  const previousPeriodStart = new Date(now.getTime() - (2 * periodDays * 24 * 60 * 60 * 1000));
  
  const currentComplaints = complaints.filter(c => new Date(c.createdAt) >= currentPeriodStart);
  const previousComplaints = complaints.filter(c => {
    const date = new Date(c.createdAt);
    return date >= previousPeriodStart && date < currentPeriodStart;
  });
  
  const complaintsGrowth = previousComplaints.length > 0 
    ? Math.round(((currentComplaints.length - previousComplaints.length) / previousComplaints.length) * 100)
    : 0;
  
  // Secteurs populaires
  const sectorCounts = {};
  currentComplaints.forEach(c => {
    const sector = c.targetType || 'Non spécifié';
    sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
  });
  
  const popularSectors = Object.entries(sectorCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Zones critiques
  const urgentComplaints = currentComplaints.filter(c => 
    c.priority === 'urgente' || c.priority === 'critique'
  );
  
  const criticalSectorCounts = {};
  urgentComplaints.forEach(c => {
    const sector = c.targetType || 'Non spécifié';
    criticalSectorCounts[sector] = (criticalSectorCounts[sector] || 0) + 1;
  });
  
  const criticalAreas = Object.entries(criticalSectorCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  
  return {
    complaintsGrowth,
    popularSectors,
    criticalAreas
  };
}

async function calculateComparisonStats(complaints, period) {
  // Comparaisons avec la période précédente
  const now = new Date();
  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const currentPeriodStart = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
  const previousPeriodStart = new Date(now.getTime() - (2 * periodDays * 24 * 60 * 60 * 1000));
  
  const currentComplaints = complaints.filter(c => new Date(c.createdAt) >= currentPeriodStart);
  const previousComplaints = complaints.filter(c => {
    const date = new Date(c.createdAt);
    return date >= previousPeriodStart && date < currentPeriodStart;
  });
  
  const currentResolved = currentComplaints.filter(c => c.status === 'resolue').length;
  const previousResolved = previousComplaints.filter(c => c.status === 'resolue').length;
  
  return {
    currentVsPrevious: {
      complaints: {
        current: currentComplaints.length,
        previous: previousComplaints.length,
        change: previousComplaints.length > 0 
          ? Math.round(((currentComplaints.length - previousComplaints.length) / previousComplaints.length) * 100)
          : 0
      },
      resolutions: {
        current: currentResolved,
        previous: previousResolved,
        change: previousResolved > 0 
          ? Math.round(((currentResolved - previousResolved) / previousResolved) * 100)
          : 0
      }
    }
  };
}

function generateCSVExport(stats) {
  const csvData = [
    ['Métrique', 'Valeur'],
    ['Total Plaintes', stats.overview.complaints.total],
    ['Plaintes Résolues', stats.overview.complaints.resolved],
    ['Taux de Résolution (%)', stats.performance.resolutionRate.toFixed(1)],
    ['Temps Moyen de Résolution (jours)', stats.performance.averageResolutionTime],
    ['Utilisateurs Actifs', stats.overview.users.active],
    ['Secteurs Actifs', stats.overview.sectors.active]
  ];
  
  return csvData.map(row => row.join(',')).join('\n');
}

function generateExcelExport(stats) {
  // Implémentation simplifiée - dans un vrai projet, utiliser une librairie comme xlsx
  return generateCSVExport(stats);
}

async function generatePDFExport(stats, includeCharts) {
  // Implémentation simplifiée - dans un vrai projet, utiliser une librairie comme puppeteer ou jsPDF
  return `Rapport de Statistiques\n\nTotal Plaintes: ${stats.overview.complaints.total}\nTaux de Résolution: ${stats.performance.resolutionRate.toFixed(1)}%`;
}

async function getAdvancedStats(period) {
  // Fonction helper pour récupérer les stats pour l'export
  const now = new Date();
  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
  
  const complaintsSnapshot = await db.collection('complaints').where('createdAt', '>=', startDate).get();
  const complaints = [];
  complaintsSnapshot.forEach(doc => complaints.push({ id: doc.id, ...doc.data() }));
  
  return {
    overview: { complaints: { total: complaints.length, resolved: complaints.filter(c => c.status === 'resolue').length } },
    performance: { resolutionRate: complaints.length > 0 ? (complaints.filter(c => c.status === 'resolue').length / complaints.length) * 100 : 0 }
  };
}

export default router;