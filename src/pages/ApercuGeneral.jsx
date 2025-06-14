import { Line, Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ApercuGeneral() {
  const navigate = useNavigate();
  // Statistiques globales fictives
  const stats = [
    { label: 'Total plaintes', value: 1287, color: 'blue', icon: 'fa-file-alt' },
    { label: 'Plaintes résolues', value: 824, color: 'green', icon: 'fa-check-circle' },
    { label: 'Utilisateurs', value: 326, color: 'indigo', icon: 'fa-users' },
    { label: 'Plaintes en attente', value: 156, color: 'amber', icon: 'fa-clock' },
  ];

  // Données graphiques fictives
  const lineData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Nouvelles plaintes',
        data: [12, 19, 15, 27, 22, 18, 10],
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.08)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#7c3aed',
      },
      {
        label: 'Plaintes résolues',
        data: [8, 12, 10, 18, 15, 12, 7],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#10b981',
      },
    ],
  };

  const doughnutData = {
    labels: ['Résolues', 'En traitement', 'En attente', 'Rejetées'],
    datasets: [
      {
        data: [824, 265, 156, 42],
        backgroundColor: ['#10b981', '#7c3aed', '#f59e0b', '#ef4444'],
        borderWidth: 2,
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
          'rgba(124, 58, 237, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(51, 65, 85, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(249, 115, 22, 0.7)',
        ],
        borderWidth: 2,
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
      case 'En traitement': return 'bg-indigo-100 text-indigo-800';
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
    <div className="min-h-screen bg-white">
      <style>{`
        .glass {
          background: rgba(255,255,255,0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
          backdrop-filter: blur(8px);
          border-radius: 1.5rem;
          border: 1px solid rgba(255,255,255,0.18);
          transition: box-shadow 0.3s, transform 0.3s, border 0.4s;
        }
        .glass:hover {
          box-shadow: 0 12px 40px 0 rgba(124, 58, 237, 0.18);
          transform: translateY(-4px) scale(1.03);
          border: 3px solid;
          border-image: linear-gradient(90deg, #7c3aed, #818cf8, #10b981) 1;
          animation: borderAnim 1.2s linear infinite;
        }
        @keyframes borderAnim {
          0% { border-image-source: linear-gradient(90deg, #7c3aed, #818cf8, #10b981); }
          50% { border-image-source: linear-gradient(270deg, #10b981, #818cf8, #7c3aed); }
          100% { border-image-source: linear-gradient(90deg, #7c3aed, #818cf8, #10b981); }
        }
        .stat-icon {
          font-size: 2rem;
          filter: drop-shadow(0 2px 8px rgba(124,58,237,0.12));
          transition: color 0.3s, transform 0.3s;
        }
        .stat-card:hover .stat-icon {
          color: #7c3aed;
          transform: scale(1.15) rotate(-8deg);
        }
        .stat-value {
          font-size: 2.2rem;
          font-weight: bold;
          background: linear-gradient(90deg, #7c3aed, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .table-header-sticky th {
          position: sticky;
          top: 0;
          background: rgba(243,232,255,0.95);
          z-index: 1;
        }
        .table-row-pop {
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .table-row-pop:hover {
          box-shadow: 0 4px 24px 0 rgba(124, 58, 237, 0.10);
          transform: scale(1.01);
          background: #f3e8ff;
        }
      `}</style>
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((card, index) => (
          <div key={index} className="glass stat-card p-6 flex flex-col items-center text-center cursor-pointer group transition-all">
            <span className={`stat-icon mb-2 text-${card.color}-500`}>
              <i className={`fas ${card.icon}`}></i>
            </span>
            <span className="stat-value group-hover:scale-110 transition-transform duration-300">{card.value}</span>
            <span className="mt-2 text-gray-600 font-medium text-base">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass p-6">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-[#7c3aed] to-[#818cf8] bg-clip-text text-transparent">Plaintes reçues vs résolues</h2>
          <div className="h-80">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="glass p-6">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-[#10b981] to-[#7c3aed] bg-clip-text text-transparent">État des plaintes</h2>
          <div className="h-80 flex items-center justify-center">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="glass p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-[#818cf8] to-[#f59e0b] bg-clip-text text-transparent">Plaintes par secteur</h2>
          <div className="h-80">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Tableau des dernières plaintes */}
      <div className="glass p-6 transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#818cf8] bg-clip-text text-transparent">Dernières plaintes</h2>
          <button
            className="text-sm font-semibold bg-[#7c3aed] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#5b21b6] transition-all duration-200 flex items-center"
            onClick={() => navigate('/admin/plaintes')}
          >
            Voir toutes les plaintes
            <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="table-header-sticky">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Secteur</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Priorité</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentComplaints.map((complaint, index) => (
                <tr key={index} className="table-row-pop">
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