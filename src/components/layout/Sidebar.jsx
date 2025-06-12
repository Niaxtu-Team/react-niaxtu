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
  X
} from 'lucide-react';

const sidebarItems = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
    color: 'text-blue-400'
  },
  {
    id: 'complaints',
    label: 'Plaintes',
    icon: AlertTriangle,
    color: 'text-red-400',
    children: [
      { label: 'Toutes les plaintes', href: '/admin/plaintes', icon: List },
      { label: 'En attente', href: '/admin/plaintes/en-attente', badge: '12' },
      { label: 'En traitement', href: '/admin/plaintes/en-traitement', badge: '8' },
      { label: 'Résolues', href: '/admin/plaintes/resolues' },
      { label: 'Rejetées', href: '/admin/plaintes/rejetees' }
    ]
  },
  {
    id: 'config',
    label: 'Configuration',
    icon: Settings,
    color: 'text-purple-400',
    children: [
      {
        label: 'Types de plaintes',
        icon: Tag,
        children: [
          { label: 'Nouveau type', href: '/admin/plaintes/types/nouveau', icon: Plus },
          { label: 'Liste des types', href: '/admin/plaintes/types', icon: List }
        ]
      },
      {
        label: 'Types de cibles',
        icon: Target,
        children: [
          { label: 'Nouveau type', href: '/admin/cibles/types/nouveau', icon: Plus },
          { label: 'Liste des types', href: '/admin/cibles/types', icon: List }
        ]
      },
      {
        label: 'Secteurs',
        icon: Building,
        children: [
          { label: 'Nouveau secteur', href: '/admin/secteurs/nouveau', icon: Plus },
          { label: 'Liste des secteurs', href: '/admin/secteurs', icon: List },
          { label: 'Sous-secteurs', href: '/admin/sous-secteurs', icon: List },
          { label: 'Nouveau sous-secteur', href: '/admin/sous-secteurs/nouveau', icon: Plus }
        ]
      },
      {
        label: 'Structures',
        icon: Building,
        children: [
          { label: 'Nouvelle structure', href: '/admin/structures/nouveau', icon: Plus },
          { label: 'Liste des structures', href: '/admin/structures', icon: List }
        ]
      }
    ]
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: Users,
    href: '/admin/utilisateurs',
    color: 'text-green-400'
  },
  {
    id: 'admins',
    label: 'Administration',
    icon: Shield,
    color: 'text-orange-400',
    children: [
      { label: 'Liste des admins', href: '/admin/gestion-admins', icon: List },
      { label: 'Nouvel admin', href: '/admin/gestion-admins/nouveau', icon: Plus },
      { label: 'Permissions', href: '/admin/gestion-admins/permissions', icon: Shield },
      { label: 'Historique', href: '/admin/gestion-admins/historique', icon: BarChart3 }
    ]
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: BarChart3,
    color: 'text-indigo-400',
    children: [
      { label: 'Statistiques', href: '/admin/rapports/statistiques', icon: BarChart3 },
      { label: 'Exporter données', href: '/admin/rapports/export', icon: Plus }
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
    const isOpen = openMenus[item.id];
    const active = isParentActive(item);
    const directActive = item.href && isActive(item.href);

    return (
      <div key={item.id || item.label} className="mb-1">
        <button
          onClick={() => handleItemClick(item)}
          className={`
            flex items-center w-full px-3 py-2.5 text-left rounded-lg transition-all duration-200 group
            ${directActive 
              ? 'bg-gray-700 text-white shadow-lg' 
              : active 
                ? 'bg-gray-700/50 text-gray-100' 
                : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
            }
            ${collapsed ? 'justify-center' : ''}
            ${level > 0 ? `ml-${level * 4}` : ''}
          `}
        >
          {/* Icône */}
          <div className={`
            flex items-center justify-center w-5 h-5 
            ${item.color || 'text-gray-400'}
            ${directActive ? 'text-white' : ''}
          `}>
            {item.icon && <item.icon size={18} />}
          </div>

          {!collapsed && (
            <>
              {/* Label */}
              <span className="ml-3 flex-1 font-medium text-sm">
                {item.label}
              </span>

              {/* Badge */}
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}

              {/* Chevron pour les sous-menus */}
              {hasChildren && (
                <div className={`
                  ml-2 transition-transform duration-200
                  ${isOpen ? 'rotate-90' : ''}
                `}>
                  <ChevronRight size={14} />
                </div>
              )}
            </>
          )}
        </button>

        {/* Sous-menu */}
        {hasChildren && isOpen && !collapsed && (
          <div className="mt-1 ml-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {item.children.map((child) => renderMenuItem(child, level + 1))}
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
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Niaxtu</h1>
              <p className="text-xs text-gray-400">Administration</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">N</span>
          </div>
        )}

        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors duration-200"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => renderMenuItem(item))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <Users size={16} className="text-gray-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-gray-400">En ligne</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar; 