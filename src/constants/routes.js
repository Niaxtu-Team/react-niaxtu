export const ROUTES = {
  // Routes publiques
  HOME: '/',
  
  // Routes admin
  ADMIN: {
    DASHBOARD: '/AdminDashboard',
    OVERVIEW: '/admin/dashboard',
    USERS: '/admin/utilisateurs',
    ADMINS: '/admin/gestion-admins',
    
    // Plaintes
    COMPLAINTS: {
      ALL: '/admin/plaintes',
      PENDING: '/admin/plaintes/en-attente',
      IN_PROGRESS: '/admin/plaintes/en-traitement',
      RESOLVED: '/admin/plaintes/resolues',
      REJECTED: '/admin/plaintes/rejetees'
    },
    
    // Types
    TYPES: {
      COMPLAINTS: {
        LIST: '/admin/plaintes/types',
        NEW: '/admin/plaintes/types/nouveau'
      },
      TARGETS: {
        LIST: '/admin/cibles/types',
        NEW: '/admin/cibles/types/nouveau'
      }
    },
    
    // Secteurs
    SECTORS: {
      LIST: '/admin/secteurs',
      NEW: '/admin/secteurs/nouveau',
      SUB_SECTORS: {
        LIST: '/admin/sous-secteurs',
        NEW: '/admin/sous-secteurs/nouveau'
      }
    },
    
    // Structures
    STRUCTURES: {
      LIST: '/admin/structures',
      NEW: '/admin/structures/nouveau'
    },
    
    // Rapports
    REPORTS: {
      STATISTICS: '/admin/rapports/statistiques',
      EXPORT: '/admin/rapports/export'
    }
  }
};

export const NAVIGATION_ITEMS = [
  {
    label: 'Tableau de bord',
    path: ROUTES.ADMIN.OVERVIEW,
    icon: 'LayoutDashboard'
  },
  {
    label: 'Plaintes',
    icon: 'AlertTriangle',
    children: [
      { label: 'Toutes les plaintes', path: ROUTES.ADMIN.COMPLAINTS.ALL },
      { label: 'En attente', path: ROUTES.ADMIN.COMPLAINTS.PENDING },
      { label: 'En traitement', path: ROUTES.ADMIN.COMPLAINTS.IN_PROGRESS },
      { label: 'Résolues', path: ROUTES.ADMIN.COMPLAINTS.RESOLVED },
      { label: 'Rejetées', path: ROUTES.ADMIN.COMPLAINTS.REJECTED }
    ]
  },
  {
    label: 'Configuration',
    icon: 'Settings',
    children: [
      { label: 'Types de plaintes', path: ROUTES.ADMIN.TYPES.COMPLAINTS.LIST },
      { label: 'Types de cibles', path: ROUTES.ADMIN.TYPES.TARGETS.LIST },
      { label: 'Secteurs', path: ROUTES.ADMIN.SECTORS.LIST },
      { label: 'Structures', path: ROUTES.ADMIN.STRUCTURES.LIST }
    ]
  },
  {
    label: 'Utilisateurs',
    path: ROUTES.ADMIN.USERS,
    icon: 'Users'
  },
  {
    label: 'Administration',
    path: ROUTES.ADMIN.ADMINS,
    icon: 'Shield'
  },
  {
    label: 'Rapports',
    icon: 'BarChart3',
    children: [
      { label: 'Statistiques', path: ROUTES.ADMIN.REPORTS.STATISTICS },
      { label: 'Exporter données', path: ROUTES.ADMIN.REPORTS.EXPORT }
    ]
  }
]; 