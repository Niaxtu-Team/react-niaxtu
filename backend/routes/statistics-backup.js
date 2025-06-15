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
 *         schematt:
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
    console.log('[STATS] Récupération statistiques avancées...');
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
    console.log(`[STATS] Période: ${period}, Date début: ${startDate.toISOString()}`);
    
    // Récupérer les plaintes de la période
    const complaintsSnapshot = await db.collection('complaints')
      .where('createdAt', '>=', startDate)
      .get();
    
    console.log(`[STATS] ${complaintsSnapshot.size} plaintes trouvées`);
    
    const complaints = [];
    complaintsSnapshot.forEach(doc => {
      const data = doc.data();
      complaints.push({ 
        id: doc.id, 
        ...data,
        // Conversion des timestamps Firestore
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : new Date(data.lastUpdated)
      });
    });
    
    // Récupérer les données de référence
    const [usersSnapshot, ministeresSnapshot, directionsSnapshot, servicesSnapshot] = await Promise.all([
      db.collection('admin').get(),
      db.collection('ministeres').get(),
      db.collection('directions').get(),
      db.collection('services').get()
    ]);
    
    const users = [];
    usersSnapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
    
    const ministeres = [];
    ministeresSnapshot.forEach(doc => ministeres.push({ id: doc.id, ...doc.data() }));
    
    const directions = [];
    directionsSnapshot.forEach(doc => directions.push({ id: doc.id, ...doc.data() }));
    
    const services = [];
    servicesSnapshot.forEach(doc => services.push({ id: doc.id, ...doc.data() }));
    
    console.log(`[STATS] Données de référence: ${ministeres.length} ministères, ${directions.length} directions, ${services.length} services`);
    
    // Calculer les statistiques
    const stats = {
      overview: calculateOverviewStats(complaints, users, ministeres, directions, services),
      timeline: includeTimeline === 'true' ? calculateTimelineStats(complaints, period) : null,
      distributions: calculateDistributionStats(complaints, ministeres, directions, services),
      performance: calculatePerformanceStats(complaints),
      trends: calculateTrendStats(complaints, period),
      comparisons: await calculateComparisonStats(complaints, period)
    };
    
    console.log('[STATS] Statistiques calculées avec succès');
    
    res.json({
      success: true,
      data: stats,
      period,
      generatedAt: new Date().toISOString(),
      meta: {
        totalComplaints: complaints.length,
        dataRange: {
          from: startDate.toISOString(),
          to: now.toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('[STATS] Erreur statistiques avancées:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des statistiques avancées',
      details: error.message
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
    
    // Données de la dernière heure (basées sur la vraie structure)
    const [recentComplaints, resolvedComplaints, urgentComplaints, activeAdmins] = await Promise.all([
      db.collection('complaints').where('createdAt', '>=', oneHourAgo).get(),
      db.collection('complaints').where('status', '==', 'resolved').where('lastUpdated', '>=', oneHourAgo).get(),
      db.collection('complaints').where('status', 'in', ['new', 'in_progress']).get(),
      db.collection('admin').where('lastActivity', '>=', oneDayAgo).where('isActive', '==', true).get()
    ]);
    
    const realTimeData = {
      newComplaints: recentComplaints.size,
      resolvedComplaints: resolvedComplaints.size,
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

// === FONCTIONS UTILITAIRES ADAPTÉES À LA VRAIE STRUCTURE ===

function calculateOverviewStats(complaints, users, ministeres, directions, services) {
  console.log('[STATS] Calcul overview stats pour', complaints.length, 'plaintes');
  
  const totalComplaints = complaints.length;
  const newComplaints = complaints.filter(c => c.status === 'new').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
  const rejectedComplaints = complaints.filter(c => c.status === 'rejected').length;
  
  return {
    complaints: {
      total: totalComplaints,
      new: newComplaints,
      pending: newComplaints,
      inProgress: inProgressComplaints,
      resolved: resolvedComplaints,
      rejected: rejectedComplaints,
      resolutionRate: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0
    },
    users: {
      total: users.length,
      active: users.filter(u => u.isActive !== false).length,
      admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length
    },
    structures: {
      ministeres: ministeres.length,
      directions: directions.length,
      services: services.length
    },
    geography: {
      withLocation: complaints.filter(c => c.latitude && c.longitude).length,
      withoutLocation: complaints.filter(c => !c.latitude || !c.longitude).length
    }
  };
}

function calculateTimelineStats(complaints, period) {
  const timeline = [];
  const now = new Date();
  const periodDays = { '7d': 7, '30d': 30, '90d': 90, '6m': 180, '1y': 365 };
  const days = periodDays[period] || 30;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayComplaints = complaints.filter(c => {
      const complaintDate = new Date(c.createdAt.toDate ? c.createdAt.toDate() : c.createdAt);
      return complaintDate.toISOString().split('T')[0] === dateStr;
    });
    
    const dayResolutions = complaints.filter(c => {
      if (c.status !== 'resolved') return false;
      const resolvedDate = new Date(c.lastUpdated.toDate ? c.lastUpdated.toDate() : c.lastUpdated);
      return resolvedDate.toISOString().split('T')[0] === dateStr;
    });
    
    timeline.push({
      date: dateStr,
      complaints: dayComplaints.length,
      resolutions: dayResolutions.length,
      pending: dayComplaints.filter(c => c.status === 'new').length,
      inProgress: dayComplaints.filter(c => c.status === 'in_progress').length
    });
  }
  
  return timeline;
}

function calculateDistributionStats(complaints, ministeres, directions, services) {
  // Distribution par statut
  const statusDistribution = {
    new: complaints.filter(c => c.status === 'new').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length
  };
  
  // Distribution par ministère
  const ministereDistribution = {};
  complaints.forEach(c => {
    const ministere = ministeres.find(m => m.id === c.ministere);
    const ministereName = ministere ? ministere.name : 'Non spécifié';
    ministereDistribution[ministereName] = (ministereDistribution[ministereName] || 0) + 1;
  });
  
  // Distribution par direction
  const directionDistribution = {};
  complaints.forEach(c => {
    const direction = directions.find(d => d.id === c.direction);
    const directionName = direction ? direction.name : 'Non spécifiée';
    directionDistribution[directionName] = (directionDistribution[directionName] || 0) + 1;
  });
  
  // Distribution par typologie
  const typologyDistribution = {};
  complaints.forEach(c => {
    if (c.typologies && Array.isArray(c.typologies)) {
      c.typologies.forEach(typo => {
        typologyDistribution[typo] = (typologyDistribution[typo] || 0) + 1;
      });
    }
  });
  
  // Distribution géographique (par région basée sur les coordonnées)
  const geographicDistribution = {};
  complaints.forEach(c => {
    if (c.latitude && c.longitude) {
      // Simplification : regroupement par zone géographique approximative
      const lat = Math.floor(c.latitude);
      const lng = Math.floor(c.longitude);
      const zone = `Zone ${lat},${lng}`;
      geographicDistribution[zone] = (geographicDistribution[zone] || 0) + 1;
    }
  });
  
  return {
    byStatus: statusDistribution,
    byMinistere: ministereDistribution,
    byDirection: directionDistribution,
    byTypology: typologyDistribution,
    byGeography: geographicDistribution
  };
}

function calculatePerformanceStats(complaints) {
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
  
  if (resolvedComplaints.length === 0) {
    return {
      averageResolutionTime: 0,
      resolutionRate: 0,
      satisfactionScore: 0,
      efficiency: 0
    };
  }
  
  // Calcul du temps de résolution moyen
  const resolutionTimes = resolvedComplaints.map(c => {
    const created = new Date(c.createdAt.toDate ? c.createdAt.toDate() : c.createdAt);
    const resolved = new Date(c.lastUpdated.toDate ? c.lastUpdated.toDate() : c.lastUpdated);
    return Math.floor((resolved - created) / (1000 * 60 * 60 * 24)); // en jours
  });
  
  const averageResolutionTime = resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length;
  const resolutionRate = (resolvedComplaints.length / complaints.length) * 100;
  
  return {
    averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
    resolutionRate: Math.round(resolutionRate),
    satisfactionScore: 85, // Score fictif - à adapter selon vos données
    efficiency: Math.round(100 - (averageResolutionTime * 2)) // Score d'efficacité basé sur le temps
  };
}

function calculateTrendStats(complaints, period) {
  const now = new Date();
  const periodDays = { '7d': 7, '30d': 30, '90d': 90, '6m': 180, '1y': 365 };
  const days = periodDays[period] || 30;
  const halfPeriod = Math.floor(days / 2);
  
  const firstHalf = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  const secondHalf = new Date(now.getTime() - (halfPeriod * 24 * 60 * 60 * 1000));
  
  const firstHalfComplaints = complaints.filter(c => {
    const date = new Date(c.createdAt.toDate ? c.createdAt.toDate() : c.createdAt);
    return date >= firstHalf && date < secondHalf;
  });
  
  const secondHalfComplaints = complaints.filter(c => {
    const date = new Date(c.createdAt.toDate ? c.createdAt.toDate() : c.createdAt);
    return date >= secondHalf;
  });
  
  const growth = firstHalfComplaints.length > 0 
    ? ((secondHalfComplaints.length - firstHalfComplaints.length) / firstHalfComplaints.length) * 100
    : 0;
  
  return {
    growth: Math.round(growth),
    trending: {
      increasing: growth > 5,
      stable: growth >= -5 && growth <= 5,
      decreasing: growth < -5
    },
    hotspots: Object.entries(calculateDistributionStats(complaints, [], [], []).byTypology)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  };
}

async function calculateComparisonStats(complaints, period) {
  // Comparaison avec la période précédente
  const now = new Date();
  const periodDays = { '7d': 7, '30d': 30, '90d': 90, '6m': 180, '1y': 365 };
  const days = periodDays[period] || 30;
  
  const previousPeriodStart = new Date(now.getTime() - (days * 2 * 24 * 60 * 60 * 1000));
  const previousPeriodEnd = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  
  try {
    const previousComplaints = await db.collection('complaints')
      .where('createdAt', '>=', previousPeriodStart)
      .where('createdAt', '<', previousPeriodEnd)
      .get();
    
    const previousCount = previousComplaints.size;
    const currentCount = complaints.length;
    
    const change = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0;
    
    return {
      previousPeriod: {
        complaints: previousCount,
        period: `${period} précédent`
      },
      currentPeriod: {
        complaints: currentCount,
        period: `${period} actuel`
      },
      change: Math.round(change),
      trend: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable'
    };
  } catch (error) {
    console.error('Erreur comparaison:', error);
    return {
      previousPeriod: { complaints: 0 },
      currentPeriod: { complaints: complaints.length },
      change: 0,
      trend: 'stable'
    };
  }
}

// Fonctions d'export simplifiées
function generateCSVExport(stats) {
  const csvData = [
    ['Statistiques Niaxtu'],
    [''],
    ['Vue d\'ensemble'],
    ['Total plaintes', stats.overview.complaints.total],
    ['Nouvelles', stats.overview.complaints.new],
    ['En cours', stats.overview.complaints.inProgress],
    ['Résolues', stats.overview.complaints.resolved],
    ['Rejetées', stats.overview.complaints.rejected],
    ['Taux de résolution (%)', stats.overview.complaints.resolutionRate]
  ];
  
  return csvData.map(row => row.join(',')).join('\n');
}

function generateExcelExport(stats) {
  // Implémentation Excel simplifiée
  return generateCSVExport(stats);
}

async function generatePDFExport(stats, includeCharts) {
  // Implémentation PDF simplifiée
  return generateCSVExport(stats);
}

async function getAdvancedStats(period) {
  // Récupérer les statistiques pour l'export
  const now = new Date();
  const periodDays = { '7d': 7, '30d': 30, '90d': 90, '6m': 180, '1y': 365 };
  const startDate = new Date(now.getTime() - (periodDays[period] * 24 * 60 * 60 * 1000));
  
  const complaintsSnapshot = await db.collection('complaints').where('createdAt', '>=', startDate).get();
  const complaints = [];
  complaintsSnapshot.forEach(doc => complaints.push({ id: doc.id, ...doc.data() }));
  
  return {
    overview: calculateOverviewStats(complaints, [], [], [], []),
    period
  };
}

export default router;