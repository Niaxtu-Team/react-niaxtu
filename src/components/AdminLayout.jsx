import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from './layout';
import { Modal } from './ui';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mainRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleNotifications = (value) => {
    setShowNotifications(typeof value === 'boolean' ? value : !showNotifications);
    if (showProfileMenu) setShowProfileMenu(false);
  };

  const toggleProfileMenu = (value) => {
    setShowProfileMenu(typeof value === 'boolean' ? value : !showProfileMenu);
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
    const handleScroll = () => {
      if (mainRef.current.scrollTop > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    if (mainRef.current) {
      mainRef.current.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (mainRef.current) {
        mainRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

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
      <Modal.Confirm
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        title="Confirmer la déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Déconnexion"
        cancelText="Annuler"
        variant="danger"
      />

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        openMenus={openMenus}
        onToggleMenu={toggleMenu}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative" ref={mainRef}>
        <Header
          title="Tableau de bord"
          isScrolled={isScrolled}
          showNotifications={showNotifications}
          showProfileMenu={showProfileMenu}
          onToggleNotifications={toggleNotifications}
          onToggleProfileMenu={toggleProfileMenu}
          onLogout={handleLogout}
        />

        {/* Contenu de la page */}
        <section className="p-6">
          {children}
        </section>
      </main>
    </div>
  );
} 