import { Link } from 'react-router-dom';

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <aside className={`bg-gray-800 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} h-screen sticky top-0`}>
      <div className="p-4 font-bold text-lg">{isOpen ? 'Niaxtu Admin' : 'NA'}</div>
      <nav className="flex flex-col space-y-2 p-2">
        <Link to="/admin" className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700">
          <i className="fas fa-tachometer-alt"></i>
          {isOpen && <span>Aperçu général</span>}
        </Link>
        <Link to="/admin/users" className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700">
          <i className="fas fa-users"></i>
          {isOpen && <span>Utilisateurs</span>}
        </Link>
        <Link to="/admin/complaints" className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700">
          <i className="fas fa-exclamation-circle"></i>
          {isOpen && <span>Plaintes</span>}
        </Link>
        <Link to="/admin/statistics" className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700">
          <i className="fas fa-chart-bar"></i>
          {isOpen && <span>Statistiques</span>}
        </Link>
        <Link to="/admin/settings" className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700">
          <i className="fas fa-cog"></i>
          {isOpen && <span>Paramètres</span>}
        </Link>
      </nav>
    </aside>
  );
} 