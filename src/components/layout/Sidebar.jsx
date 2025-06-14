import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  Shield, 
  BarChart3, 
  Settings,
  Building,
  Target,
  Tag,
  Plus,
  List,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Home,
  User,
  FileText,
  Download,
  History,
  UserPlus,
  Building2,
  Layers,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

const sidebarItems = [
  {
    id: 'home',
    label: 'Accueil',
    icon: Home,
    href: '/admin',
    color: 'text-blue-400'
  },
  {
    id: 'dashboard',
    label: 'Tableaux de bord',
    icon: LayoutDashboard,
    color: 'text-blue-400',
    children: [
      { label: 'Dashboard Principal', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Aperçu Général', href: '/admin/apercu-general', icon: Eye }
    ]
  },
  {
    id: 'complaints',
    label: 'Gestion des Plaintes',
    icon: AlertTriangle,
    color: 'text-red-400',
    children: [
      { label: 'Toutes les plaintes', href: '/admin/plaintes', icon: List },
      { label: 'En attente', href: '/admin/plaintes/en-attente', icon: AlertTriangle, badge: '12' },
      { label: 'En traitement', href: '/admin/plaintes/en-traitement', icon: Settings, badge: '8' },
      { label: 'Résolues', href: '/admin/plaintes/resolues', icon: CheckCircle },
      { label: 'Rejetées', href: '/admin/plaintes/rejetees', icon: XCircle }
    ]
  },
  {
    id: 'users',
    label: 'Gestion Utilisateurs',
    icon: Users,
    color: 'text-green-400',
    children: [
      { label: 'Tous les utilisateurs', href: '/admin/utilisateurs', icon: Users },
      { label: 'Profil', href: '/admin/profil', icon: User },
      { label: 'Paramètres', href: '/admin/parametres', icon: Settings }
    ]
  },
  {
    id: 'admins',
    label: 'Administration',
    icon: Shield,
    color: 'text-orange-400',
    children: [
      { label: 'Gestion des Admins', href: '/admin/gestion-admins', icon: Shield },
      { label: 'Nouvel Admin', href: '/admin/gestion-admins/nouveau', icon: UserPlus },
      { label: 'Permissions', href: '/admin/gestion-admins/permissions', icon: Shield },
      { label: 'Historique Admin', href: '/admin/gestion-admins/historique', icon: History }
    ]
  },
  {
    id: 'structures',
    label: 'Structures & Organisation',
    icon: Building2,
    color: 'text-purple-400',
    children: [
      { label: 'Gestion des Structures', href: '/admin/structures', icon: Building2 },
      { label: 'Nouvelle Structure', href: '/admin/structures/nouveau', icon: Plus },
      {
        label: 'Secteurs',
        icon: Layers,
        children: [
          { label: 'Liste des Secteurs', href: '/admin/secteurs', icon: List },
          { label: 'Nouveau Secteur', href: '/admin/secteurs/nouveau', icon: Plus },
          { label: 'Sous-secteurs', href: '/admin/sous-secteurs', icon: Layers },
          { label: 'Nouveau Sous-secteur', href: '/admin/sous-secteurs/nouveau', icon: Plus }
        ]
      }
    ]
  },
  {
    id: 'config',
    label: 'Configuration',
    icon: Settings,
    color: 'text-purple-400',
    children: [
      {
        label: 'Types de Plaintes',
        icon: Tag,
        children: [
          { label: 'Liste des Types', href: '/admin/plaintes/types', icon: List },
          { label: 'Nouveau Type', href: '/admin/plaintes/types/nouveau', icon: Plus }
        ]
      },
      {
        label: 'Types de Cibles',
        icon: Target,
        children: [
          { label: 'Liste des Types', href: '/admin/cibles/types', icon: List },
          { label: 'Nouveau Type', href: '/admin/cibles/types/nouveau', icon: Plus }
        ]
      }
    ]
  },
  {
    id: 'reports',
    label: 'Rapports & Analytics',
    icon: BarChart3,
    color: 'text-indigo-400',
    children: [
      { label: 'Statistiques', href: '/admin/rapports/statistiques', icon: BarChart3 },
      { label: 'Statistiques Complètes', href: '/admin/rapports/statistiques-completes', icon: BarChart3 },
      { label: 'Exporter Données', href: '/admin/rapports/export', icon: Download },
      { label: 'Page 2 (Test)', href: '/admin/page2', icon: FileText }
    ]
  }
];

const Sidebar = ({ collapsed, onToggle, openMenus, onToggleMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href) => {
    return location.pathname === href;
  };

  const isParentActive = (item) => {
    if (item.href && isActive(item.href)) return true;
    if (item.children) {
      return item.children.some(child => {
        if (child.href && isActive(child.href)) return true;
        if (child.children) {
          return child.children.some(subChild => subChild.href && isActive(subChild.href));
        }
        return false;
      });
    }
    return false;
  };

  const handleItemClick = (item) => {
    if (item.href) {
      navigate(item.href);
    } else if (item.children) {
      onToggleMenu(item.id);
    }
  };

  const renderMenuItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.id || item.label];
    const active = isParentActive(item);
    const directActive = item.href && isActive(item.href);

    const handleClick = () => {
      if (item.href) {
        navigate(item.href);
      } else if (hasChildren) {
        onToggleMenu(item.id || item.label);
      }
    };

    return (
      <div key={item.id || item.label} className="mb-1">
        <button
          onClick={handleClick}
          className={`
            flex items-center w-full px-3 py-2.5 text-left rounded-lg transition-all duration-200 group
            ${directActive 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
              : active 
                ? 'bg-gray-700/50 text-gray-100' 
                : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
            }
            ${collapsed ? 'justify-center' : ''}
            ${level === 1 ? 'ml-4' : level === 2 ? 'ml-8' : ''}
            ${level > 0 ? 'text-sm' : ''}
          `}
        >
          {/* Icône */}
          <div className={`
            flex items-center justify-center w-5 h-5 
            ${item.color || (level > 0 ? 'text-gray-400' : 'text-gray-400')}
            ${directActive ? 'text-white' : ''}
          `}>
            {item.icon && <item.icon size={level > 0 ? 16 : 18} />}
          </div>

          {!collapsed && (
            <>
              {/* Label */}
              <span className={`ml-3 flex-1 font-medium ${level > 0 ? 'text-sm' : 'text-sm'}`}>
                {item.label}
              </span>

              {/* Badge */}
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-semibold">
                  {item.badge}
                </span>
              )}

              {/* Chevron pour les sous-menus */}
              {hasChildren && (
                <div className={`
                  ml-2 transition-transform duration-200
                  ${isOpen ? 'rotate-90' : ''}
                `}>
                  <ChevronRight size={12} />
                </div>
              )}
            </>
          )}
        </button>

        {/* Sous-menu */}
        {hasChildren && isOpen && !collapsed && (
          <div className={`mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200 ${level === 0 ? 'ml-2' : ''}`}>
            {item.children.map((child, index) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`
      bg-gradient-to-b from-gray-800 to-gray-900 text-white transition-all duration-300 h-full 
      flex flex-col shadow-xl border-r border-gray-700
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Niaxtu</h1>
              <p className="text-xs text-blue-300 font-medium">Panel d'Administration</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
            <span className="text-white font-bold text-lg">N</span>
          </div>
        )}

        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-600 transition-all duration-200 text-gray-300 hover:text-white"
          title={collapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => renderMenuItem(item))}
        
        {/* Séparateur et info version */}
        {!collapsed && (
          <div className="pt-4 mt-4 border-t border-gray-700">
            <div className="px-3 py-2 text-xs text-gray-500 flex items-center justify-between">
              <span>Version 2.1.0</span>
              <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                LIVE
              </span>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Administrateur</p>
              <div className="text-xs text-green-300 font-medium flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                En ligne
              </div>
            </div>
            <button 
              className="p-1.5 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-gray-400 hover:text-white"
              title="Paramètres du profil"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar; 
