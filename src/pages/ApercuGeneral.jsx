import { Line, Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function ApercuGeneral() {
  // Statistiques globales fictives
  const stats = [
    { label: 'Total plaintes', value: 1287, color: 'blue' },
    { label: 'Plaintes résolues', value: 824, color: 'green' },
    { label: 'Utilisateurs', value: 326, color: 'indigo' },
    { label: 'Plaintes en attente', value: 156, color: 'amber' },
  ];

  // Données graphiques fictives
  const lineData = {
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

  const doughnutData = {
    labels: ['Résolues', 'En traitement', 'En attente', 'Rejetées'],
    datasets: [
      {
        data: [824, 265, 156, 42],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
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
        borderWidth: 1,
      },
    ],
  };

  // Dernières plaintes fictives
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
    <div className="p-6 space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((card, index) => (
          <div key={index} className={`bg-white rounded-xl shadow-sm p-5`}>
            <div className={`bg-${card.color}-100 w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
              <span className={`text-${card.color}-500 text-xl font-bold`}>{card.value}</span>
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-medium text-gray-500">{card.label}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Plaintes reçues vs résolues</h2>
          <div className="h-80">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">État des plaintes</h2>
          <div className="h-80 flex items-center justify-center">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Plaintes par secteur</h2>
          <div className="h-80">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Tableau des dernières plaintes */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">Dernières plaintes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secteur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentComplaints.map((complaint, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.sector}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full ${getPriorityColor(complaint.priority)} mr-2`}></span>
                      <span className="text-sm text-gray-500 capitalize">{complaint.priority}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 