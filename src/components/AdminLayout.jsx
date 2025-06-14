import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BowArrow, List, Plus, PlusIcon } from 'lucide-react';

const sidebarItems = [
  {
    header: 'Tableau de bord',
    items: [{ icon: BowArrow, label: 'Aperçu général', href: '/admin/dashboard' }],
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

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const mainRef = useRef(null);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showProfileMenu) setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    navigate('/');
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    const handleScroll = () => {
      if (mainRef.current.scrollTop > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    mainRef.current.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      if (mainRef.current) {
        mainRef.current.removeEventListener('scroll', handleScroll);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const notifications = [
    { text: 'Nouvelle plainte reçue', time: 'Il y a 5 min', read: false },
    { text: '2 réponses en attente', time: 'Il y a 1h', read: true },
    { text: 'Nouvel utilisateur inscrit', time: 'Il y a 2h', read: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Styles globaux pour les animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delay-1 { animation: float 3s ease-in-out infinite 0.5s; }
        .animate-float-delay-2 { animation: float 3s ease-in-out infinite 1s; }
        .animate-float-delay-3 { animation: float 3s ease-in-out infinite 1.5s; }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {/* Modal de confirmation de déconnexion */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full transform transition-all duration-300 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <i className="fas fa-sign-out-alt text-red-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-800 mb-2">Confirmer la déconnexion</h3>
            <p className="text-gray-600 text-center mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={cancelLogout}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmLogout}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar avec animations */}
      <aside
        className={`bg-gradient-to-b from-gray-800 to-gray-900 text-white transition-all duration-300 h-full overflow-y-auto ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-700">
          <button className={`font-bold text-xl transition-all duration-300 `}
           onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
           { !sidebarCollapsed ? ( <span className="text-blue-400">Niaxtu Admin</span>):     <img 
  src="/WhatsApp Image 2025-06-02 à 11.52.43_4d53f2ff.jpg" 
  alt="Niaxtu" 
  className="w-[100px] h-auto mb-0"
/> }
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
                        
                          {sub.icon && <sub.icon  className={`fas ${item.icon} text-lg ${
                        item.submenu ? 'text-purple-300' : 'text-blue-300'
                      }`} />}
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

      {/* Main content avec animations */}
      <main className="flex-1 overflow-y-auto relative" ref={mainRef}>
        <header
          className={`bg-white shadow-sm px-6 py-2 flex items-center justify-between sticky top-0 z-20 transition-all duration-300 ${
            isScrolled ? 'shadow-md bg-opacity-90 backdrop-blur-sm' : ''
          }`}
        >
          <div className="flex items-center">
            <h1 className="text-xl font-bold  text-gray-800 hidden md:block" >
              Tableau de bord
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 w-64 focus:w-72"
              />
            </div>

            <div ref={notificationsRef} className="relative">
              <button
                onClick={toggleNotifications}
                className="relative text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                aria-label="Notifications"
                aria-haspopup="true"
                aria-expanded={showNotifications}
              >
                <div className="relative">
                  <i className="fas fa-bell text-xl"></i>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse-slow">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </div>
              </button>
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 text-gray-700 z-30 animate-in fade-in-0 zoom-in-95"
                  role="menu"
                  aria-label="Notifications"
                >
                  <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      Tout marquer comme lu
                    </button>
                  </div>
                  <ul className="max-h-96 overflow-y-auto">
                    {notifications.map((note, i) => (
                      <li
                        key={i}
                        className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-none transition-colors duration-150 flex ${
                          !note.read ? 'bg-blue-50' : ''
                        }`}
                        role="menuitem"
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          !note.read ? 'bg-blue-500' : 'bg-transparent'
                        }`}></div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{note.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{note.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-2 border-t border-gray-200 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div ref={profileRef} className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center focus:outline-none group"
                aria-label="Menu profil"
                aria-haspopup="true"
                aria-expanded={showProfileMenu}
              >
                <div className="relative">
                  <img
                    src= "/4e00cfd7749b398faba7f21425b3b833.jpg"
                    alt="User avatar"
                    className="w-9 h-9 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all duration-300"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                {!sidebarCollapsed && (
                  <span className="ml-2 hidden md:inline-flex items-center">
                    <span className="text-gray-700 font-medium mr-1">Admin</span>
                    <i className="fas fa-chevron-down text-xs text-gray-500"></i>
                  </span>
                )}
              </button>
              
              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 text-gray-700 z-30 animate-in fade-in-0 zoom-in-95"
                  role="menu"
                  aria-label="Menu profil"
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-800">Admin User</p>
                    <p className="text-xs text-gray-500">administrateur@gmail.com</p>
                  </div>
                  <ul>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center"
                        role="menuitem"
                      >
                        <i className="fas fa-user-circle text-gray-500 mr-3 w-5 text-center"></i>
                        Mon profil
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center"
                        role="menuitem"
                      >
                        <i className="fas fa-cog text-gray-500 mr-3 w-5 text-center"></i>
                        Paramètres
                      </a>
                    </li>
                    <li className="border-t border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-red-600 transition-colors duration-150 flex items-center"
                        role="menuitem"
                      >
                        <i className="fas fa-sign-out-alt text-red-500 mr-3 w-5 text-center"></i>
                        Déconnexion
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <section className="p-6">
          {children}
        </section>
      </main>
    </div>
  );
} 
