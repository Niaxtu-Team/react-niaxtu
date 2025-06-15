import { useState, useRef, useEffect } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
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
import { Sidebar } from '../components/layout';

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

// Sidebar moderne importée depuis les composants

// Liste des destinations pour la recherche universelle
const searchOptions = [
  { label: 'Aperçu général', path: '/admin' },
  { label: 'Nouveau secteur', path: '/admin/secteurs/nouveau' },
  { label: 'Liste des secteurs', path: '/admin/secteurs' },
  { label: 'Nouveau sous-secteur', path: '/admin/sous-secteurs/nouveau' },
  { label: 'Liste des sous-secteurs', path: '/admin/sous-secteurs' },
  { label: 'Nouvelle structure', path: '/admin/structures/nouveau' },
  { label: 'Liste des structures', path: '/admin/structures' },
  { label: 'Nouveau type de plainte', path: '/admin/plaintes/types/nouveau' },
  { label: 'Liste des types de plainte', path: '/admin/plaintes/types' },
  { label: 'Nouveau type de cible', path: '/admin/cibles/types/nouveau' },
  { label: 'Liste des types de cible', path: '/admin/cibles/types' },
  { label: 'Toutes les plaintes', path: '/admin/plaintes' },
  { label: 'Plaintes en attente', path: '/admin/plaintes/en-attente' },
  { label: 'Plaintes en traitement', path: '/admin/plaintes/en-traitement' },
  { label: 'Plaintes résolues', path: '/admin/plaintes/resolues' },
  { label: 'Plaintes rejetées', path: '/admin/plaintes/rejetees' },
  { label: 'Utilisateurs externes', path: '/admin/utilisateurs' },
  { label: 'Comptes admin', path: '/admin/utilisateurs?tab=admins' },
  { label: 'Statistiques', path: '/admin/rapports/statistiques' },
  { label: 'Exporter des données', path: '/admin/rapports/export' },
  { label: 'Mon profil', path: '/admin/profil' },
  { label: 'Paramètres', path: '/admin/parametres' },
];

export default function AdminDashboard() {
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
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  // Recherche universelle
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const results = searchOptions.filter(opt =>
      opt.label.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSearchSelect = (path) => {
    setSearchValue('');
    setShowSearchResults(false);
    navigate(path);
  };

  return (
    <div className="flex h-screen overflow-hidden">
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

      {/* Sidebar moderne */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        openMenus={openMenus}
        onToggleMenu={toggleMenu}
      />

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
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => searchValue && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
              />
              {showSearchResults && searchResults.length > 0 && (
                <ul className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto animate-in fade-in-0 zoom-in-95">
                  {searchResults.map((result, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 text-sm"
                      onMouseDown={() => handleSearchSelect(result.path)}
                    >
                      {result.label}
                    </li>
                  ))}
                </ul>
              )}
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
                      <Link
                        to="/admin/profil"
                        className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center"
                        role="menuitem"
                      >
                        <i className="fas fa-user-circle text-gray-500 mr-3 w-5 text-center"></i>
                        Mon profil
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/parametres"
                        className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center"
                        role="menuitem"
                      >
                        <i className="fas fa-cog text-gray-500 mr-3 w-5 text-center"></i>
                        Paramètres
                      </Link>
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
          <Outlet />
        </section>
      </main>
    </div>
  );
}
