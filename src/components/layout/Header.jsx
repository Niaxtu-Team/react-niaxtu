import React, { useRef, useEffect } from 'react';

const Header = ({ 
  title = "Tableau de bord",
  isScrolled,
  showNotifications,
  showProfileMenu,
  onToggleNotifications,
  onToggleProfileMenu,
  onLogout
}) => {
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const notifications = [
    { text: 'Nouvelle plainte reçue', time: 'Il y a 5 min', read: false },
    { text: '2 réponses en attente', time: 'Il y a 1h', read: true },
    { text: 'Nouvel utilisateur inscrit', time: 'Il y a 2h', read: true },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        onToggleNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        onToggleProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onToggleNotifications, onToggleProfileMenu]);

  return (
    <header
      className={`bg-white shadow-sm px-6 py-2 flex items-center justify-between sticky top-0 z-20 transition-all duration-300 ${
        isScrolled ? 'shadow-md bg-opacity-90 backdrop-blur-sm' : ''
      }`}
    >
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800 hidden md:block">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        {/* Barre de recherche */}
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

        {/* Notifications */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => onToggleNotifications(!showNotifications)}
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

        {/* Menu profil */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => onToggleProfileMenu(!showProfileMenu)}
            className="flex items-center focus:outline-none group"
            aria-label="Menu profil"
            aria-haspopup="true"
            aria-expanded={showProfileMenu}
          >
            <div className="relative">
              <img
                src="/4e00cfd7749b398faba7f21425b3b833.jpg"
                alt="User avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all duration-300"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <span className="ml-2 hidden md:inline-flex items-center">
              <span className="text-gray-700 font-medium mr-1">Admin</span>
              <i className="fas fa-chevron-down text-xs text-gray-500"></i>
            </span>
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
                    onClick={onLogout}
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
  );
};

export default Header; 
