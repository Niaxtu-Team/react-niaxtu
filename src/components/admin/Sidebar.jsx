import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, PlusIcon } from 'lucide-react';

const sidebarItems = [
  {
    header: 'Tableau de bord',
    items: [{ icon: 'fa-layer-group', label: 'Aperçu général', href: '/admin/dashboard' }],
  },
  {
    header: 'Gestion des contenus',
    items: [
      {
        icon: 'fa-layer-group',
        label: 'Secteurs',
        submenu: [
          { icon: Plus, label: 'Nouveau secteur', href: '/admin/secteurs/nouveau' },
          { icon: List, label: 'Liste des secteurs', href: '/admin/secteurs' },
        ],
      },
      {
        icon: 'fa-th-large',
        label: 'Sous-secteurs',
        submenu: [
          { icon: PlusIcon, label: 'Nouveau sous-secteur', href: '/admin/sous-secteurs/nouveau' },
          { icon: List, label: 'Liste des sous-secteurs', href: '/admin/sous-secteurs' },
        ],
      },
      {
        icon: 'fa-building',
        label: 'Structures',
        submenu: [
          { icon: PlusIcon, label: 'Nouvelle structure', href: '/admin/structures/nouveau' },
          { icon: List, label: 'Liste des structures', href: '/admin/structures' },
        ],
      },
    ],
  },
  {
    header: 'Gestion des plaintes',
    items: [
      {
        icon: 'fa-tags',
        label: 'Types de plaintes',
        submenu: [
          { icon: PlusIcon, label: 'Nouveau type', href: '/admin/plaintes/types/nouveau' },
          { icon: List, label: 'Liste des types', href: '/admin/plaintes/types' },
        ],
      },
      {
        icon: 'fa-bullseye',
        label: 'Types de cibles',
        submenu: [
          { icon: PlusIcon, label: 'Nouveau type', href: '/admin/cibles/types/nouveau' },
          { icon: List, label: 'Liste des types', href: '/admin/cibles/types' },
        ],
      },
      {
        icon: 'fa-exclamation-circle',
        label: 'Plaintes',
        submenu: [
          { label: 'Toutes les plaintes', href: '/admin/plaintes' },
          { label: 'En attente', href: '/admin/plaintes/en-attente' },
          { label: 'En traitement', href: '/admin/plaintes/en-traitement' },
          { label: 'Résolues', href: '/admin/plaintes/resolues' },
          { label: 'Rejetées', href: '/admin/plaintes/rejetees' },
        ],
      },
    ],
  },
  {
    header: 'Gestion des utilisateurs',
    items: [
      { icon: 'fa-users', label: 'Utilisateurs', href: '/admin/utilisateurs' },
    ],
  },
  {
    header: 'Rapports',
    items: [
      { icon: 'fa-chart-bar', label: 'Statistiques', href: '/admin/rapports/statistiques' },
      { icon: 'fa-file-export', label: 'Exporter des données', href: '/admin/rapports/export' },
    ],
  },
];

export default function Sidebar({ sidebarCollapsed, setSidebarCollapsed }) {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={`bg-gradient-to-b from-gray-800 to-gray-900 text-white transition-all duration-300 h-full overflow-y-auto ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-700">
        <button 
          className={`font-bold text-xl transition-all duration-300`}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {!sidebarCollapsed ? (
            <span className="text-blue-400">Niaxtu Admin</span>
          ) : (
            <img 
              src="/WhatsApp Image 2025-06-02 à 11.52.43_4d53f2ff.jpg" 
              alt="Niaxtu" 
              className="w-[100px] h-auto mb-0"
            />
          )}
        </button>
      </div>
      <nav className="p-2 space-y-1">
        {sidebarItems.map((section, index) => (
          <div key={index} className="mb-2">
            {!sidebarCollapsed && (
              <div className="text-blue-300 uppercase text-xs px-3 pt-4 pb-2 font-bold tracking-wider">
                {section.header}
              </div>
            )}
            {section.items.map((item, idx) => (
              <div key={idx}>
                <button
                  onClick={() => item.submenu && toggleMenu(item.label)}
                  className={`flex items-center w-full px-3 py-3 text-left rounded-lg transition-all duration-200 ${
                    openMenus[item.label] ? 'bg-gray-700' : 'hover:bg-gray-700'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  aria-expanded={!!openMenus[item.label]}
                  aria-controls={`${item.label}-submenu`}
                >
                  <i
                    className={`fas ${item.icon} text-lg ${
                      item.submenu ? 'text-purple-300' : 'text-blue-300'
                    }`}
                  ></i>
                  {!sidebarCollapsed && (
                    <span className="ml-3 flex-1 text-gray-200 font-medium">{item.label}</span>
                  )}
                  {item.submenu && !sidebarCollapsed && (
                    <i
                      className={`fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${
                        openMenus[item.label] ? 'transform rotate-180' : ''
                      }`}
                    ></i>
                  )}
                </button>
                {item.submenu && openMenus[item.label] && (
                  <ul
                    id={`${item.label}-submenu`}
                    className={`mt-1 space-y-1 animate-in fade-in-0 slide-in-from-top-2 ${
                      sidebarCollapsed ? 'hidden' : 'ml-9'
                    }`}
                    role="menu"
                  >
                    {item.submenu.map((sub, subIdx) => (
                      <li key={subIdx} role="none" className='flex'>
                        {sub.icon && <sub.icon className="w-4 h-4 text-purple-300 mr-2" />}
                        <a
                          href={sub.href}
                          className="block px-3 py-2 text-sm hover:text-white text-gray-300 rounded-lg transition-colors duration-150 hover:bg-gray-600"
                          role="menuitem"
                        >
                          {sub.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
} 