 import { useState, useEffect } from 'react';
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
  Legend
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

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

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const complaintsChartData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Nouvelles plaintes',
        data: [12, 19, 15, 27, 22, 18, 10],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Plaintes résolues',
        data: [8, 12, 10, 18, 15, 12, 7],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const statusChartData = {
    labels: ['Résolues', 'En traitement', 'En attente', 'Rejetées'],
    datasets: [
      {
        data: [824, 265, 156, 42],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
        borderWidth: 1
      }
    ]
  };

  const sectorChartData = {
    labels: ['Transport', 'Eau', 'Énergie', 'Santé', 'Éducation', 'Environnement'],
    datasets: [
      {
        label: 'Nombre de plaintes',
        data: [245, 198, 176, 132, 115, 98],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#8b5cf6',
          '#334155',
          '#eab308',
          '#f97316'
        ]
      }
    ]
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} h-screen sticky top-0`}> 
        <div className="p-4 font-bold text-lg">{sidebarOpen ? 'Niaxtu Admin' : 'NA'}</div>
        <nav className="flex flex-col space-y-2 p-2">
          <a href="#" className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700">
            <i className="fas fa-tachometer-alt"></i>
            {sidebarOpen && <span>Aperçu général</span>}
          </a>
          <a href="#" className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700">
            <i className="fas fa-users"></i>
            {sidebarOpen && <span>Utilisateurs</span>}
          </a>
          <a href="#" className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700">
            <i className="fas fa-chart-bar"></i>
            {sidebarOpen && <span>Statistiques</span>}
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Navbar */}
        <header className="bg-white shadow flex items-center justify-between px-4 py-3 sticky top-0 z-10">
          <button onClick={toggleSidebar} className="text-gray-700 text-xl">
            <i className="fas fa-bars"></i>
          </button>
          <div className="text-gray-700 font-bold text-lg">Tableau de bord</div>
          <div className="flex items-center space-x-4">
            <i className="fas fa-bell text-gray-500 relative">
              <span className="absolute -top-1 -right-2 text-xs bg-red-500 text-white rounded-full px-1">3</span>
            </i>
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
          </div>
        </header>

        <main className="p-4 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { title: 'Plaintes totales', number: 1245, icon: 'fa-exclamation-circle', color: 'text-blue-500' },
              { title: 'Plaintes résolues', number: 824, icon: 'fa-check-circle', color: 'text-green-500' },
              { title: 'En attente', number: 156, icon: 'fa-clock', color: 'text-yellow-500' },
              { title: 'Utilisateurs', number: 2890, icon: 'fa-users', color: 'text-teal-500' }
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 uppercase font-bold">{card.title}</div>
                  <div className="text-2xl font-bold">{card.number}</div>
                </div>
                <i className={`fas ${card.icon} text-3xl ${card.color}`}></i>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
              <h2 className="font-bold mb-2">Activité des plaintes</h2>
              <Line data={complaintsChartData} />
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-bold mb-2">Statut des plaintes</h2>
              <Doughnut data={statusChartData} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-bold mb-2">Activité récente</h2>
              <ul className="divide-y divide-gray-200">
                <li className="py-2">
                  <strong>Nouvelle plainte</strong> soumise par John Doe
                  <div className="text-sm text-gray-500">Il y a 5 min</div>
                </li>
                <li className="py-2">
                  Plainte <strong>#1245</strong> résolue
                  <div className="text-sm text-gray-500">Il y a 1 heure</div>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-bold mb-2">Secteurs les plus actifs</h2>
              <Bar data={sectorChartData} />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold mb-4">Plaintes récentes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-200 text-gray-600">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Titre</th>
                    <th className="p-2">Secteur</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Statut</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: '#1256', title: 'Route dégradée', sector: 'Transport', date: '15/06/2023', status: 'En attente', statusColor: 'bg-yellow-100 text-yellow-800' },
                    { id: '#1255', title: "Panne d'électricité", sector: 'Énergie', date: '14/06/2023', status: 'En traitement', statusColor: 'bg-blue-100 text-blue-800' },
                    { id: '#1254', title: 'Déchets non collectés', sector: 'Environnement', date: '14/06/2023', status: 'Résolu', statusColor: 'bg-green-100 text-green-800' },
                    { id: '#1253', title: ".eau potable", sector: 'Eau', date: '13/06/2023', status: 'Rejeté', statusColor: 'bg-red-100 text-red-800' }
                  ].map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 font-medium">{row.id}</td>
                      <td className="p-2">{row.title}</td>
                      <td className="p-2">{row.sector}</td>
                      <td className="p-2">{row.date}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.statusColor}`}>{row.status}</span>
                      </td>
                      <td className="p-2 space-x-2">
                        <button className="text-blue-500"><i className="fas fa-eye"></i></button>
                        <button className="text-green-500"><i className="fas fa-check"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
