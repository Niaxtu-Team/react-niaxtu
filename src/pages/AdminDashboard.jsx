import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ArrowDownToDotIcon, BowArrow, List, Plus, PlusIcon } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
      {
        icon: 'fa-user-shield',
        label: 'Administrateurs',
        submenu: [
          { icon: PlusIcon, label: 'Nouvel administrateur', href: '/admin/gestion-admins/nouveau' },
          { icon: List, label: 'Liste des admins', href: '/admin/gestion-admins' },
          { icon: 'fa-key', label: 'Permissions', href: '/admin/gestion-admins/permissions' },
          { icon: 'fa-history', label: 'Historique', href: '/admin/gestion-admins/historique' },
        ],
      },
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(null);
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

  const complaintsChartData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Nouvelles plaintes',
        data: [12, 19, 15, 27, 22, 18, 10],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
      {
        label: 'Plaintes résolues',
        data: [8, 12, 10, 18, 15, 12, 7],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  const statusChartData = {
    labels: ['Résolues', 'En traitement', 'En attente', 'Rejetées'],
    datasets: [
      {
        data: [824, 265, 156, 42],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  const sectorChartData = {
    labels: ['Transport', 'Eau', 'Énergie', 'Santé', 'Éducation', 'Environnement'],
    datasets: [
      {
        label: 'Nombre de plaintes',
        data: [245, 198, 176, 132, 115, 98],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(51, 65, 85, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(249, 115, 22, 0.7)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(51, 65, 85, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(249, 115, 22, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const statCards = [
    {
      icon: 'fa-file-alt',
      color: 'blue',
      title: 'Total plaintes',
      value: '1,287',
      trend: 'up',
      change: '12%',
    },
    {
      icon: 'fa-check-circle',
      color: 'green',
      title: 'Plaintes résolues',
      value: '824',
      trend: 'up',
      change: '8%',
    },
    {
      icon: 'fa-users',
      color: 'indigo',
      title: 'Utilisateurs',
      value: '326',
      trend: 'up',
      change: '5%',
    },
    {
      icon: 'fa-clock',
      color: 'amber',
      title: 'Plaintes en attente',
      value: '156',
      trend: 'down',
      change: '3%',
    },
  ];

  const recentComplaints = [
    { id: '#1254', type: 'Retard', sector: 'Transport', status: 'Résolue', date: '2025-05-25', priority: 'low' },
    { id: '#1253', type: 'Fuite', sector: 'Eau', status: 'En traitement', date: '2025-05-24', priority: 'medium' },
    { id: '#1252', type: 'Panne', sector: 'Énergie', status: 'En attente', date: '2025-05-23', priority: 'high' },
    { id: '#1251', type: 'Propreté', sector: 'Environnement', status: 'Résolue', date: '2025-05-22', priority: 'low' },
    { id: '#1250', type: 'Accès', sector: 'Santé', status: 'Rejetée', date: '2025-05-21', priority: 'medium' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Résolue': return 'bg-green-100 text-green-800';
      case 'En traitement': return 'bg-blue-100 text-blue-800';
      case 'En attente': return 'bg-amber-100 text-amber-800';
      case 'Rejetée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Styles globaux pour les animations */}
      <style>{`
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
                    onClick={() => item.submenu ? toggleMenu(item.label) : navigate(item.href)}
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
                          <button
                            onClick={() => navigate(sub.href)}
                            className="block px-3 py-2 text-sm hover:text-white text-gray-300 rounded-lg transition-colors duration-150 hover:bg-gray-600 text-left w-full"
                            role="menuitem"
                          >
                            
                            {sub.label}
                          </button>
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

        <section className="p-6 space-y-6">
          {/* Cartes de statistiques avec animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <div 
                key={index}
                className={`bg-white rounded-xl shadow-sm p-5 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${
                  isHoveringCard === index ? 'ring-2 ring-blue-500' : ''
                }`}
                onMouseEnter={() => setIsHoveringCard(index)}
                onMouseLeave={() => setIsHoveringCard(null)}
              >
                <div className="flex justify-between">
                  <div className={`bg-${card.color}-100 w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <i className={`fas ${card.icon} text-${card.color}-500 text-xl`}></i>
                  </div>
                  <div className={`text-xs font-medium ${
                    card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change} {card.trend === 'up' ? '↑' : '↓'}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Graphiques avec animations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-5 transition-all duration-300 hover:shadow-md">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-800">Plaintes reçues vs résolues</h2>
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Cette semaine</option>
                  <option>Ce mois</option>
                  <option>Cette année</option>
                </select>
              </div>
              <div className="h-80">
                <Line 
                  data={complaintsChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 1500,
                      easing: 'easeInOutQuart'
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          font: {
                            size: 13
                          },
                          usePointStyle: true,
                        }
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          drawBorder: false,
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 transition-all duration-300 hover:shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">État des plaintes</h2>
              <div className="h-80 flex items-center justify-center">
                <Doughnut 
                  data={statusChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 1500,
                      easing: 'easeInOutQuart'
                    },
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          font: {
                            size: 13
                          },
                          usePointStyle: true,
                          padding: 20
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    },
                    cutout: '70%',
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 transition-all duration-300 hover:shadow-md lg:col-span-2">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-800">Plaintes par secteur</h2>
                <div className="flex space-x-2">
                  <button className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                    Export
                  </button>
                  <button className="text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    Voir tout
                  </button>
                </div>
              </div>
              <div className="h-80">
                <Bar 
                  data={sectorChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 1500,
                      easing: 'easeInOutQuart'
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          drawBorder: false,
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tableau des dernières plaintes avec animation */}
          <div className="bg-white rounded-xl shadow-sm p-5 transition-all duration-300 hover:shadow-md">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-800">Dernières plaintes</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors duration-200">
                Voir toutes les plaintes
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Secteur
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentComplaints.map((complaint, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {complaint.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complaint.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complaint.sector}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complaint.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full ${getPriorityColor(complaint.priority)} mr-2`}></span>
                          <span className="text-sm text-gray-500 capitalize">{complaint.priority}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3 transition-colors duration-200">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}