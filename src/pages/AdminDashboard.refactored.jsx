import React, { useState, useEffect } from 'react';
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

import { 
  Card, 
  Button, 
  Badge 
} from '../components/ui';
import { 
  StatCard 
} from '../components/dashboard';
import { 
  ChartContainer 
} from '../components/charts';
import { 
  DataTable, 
  StatusBadge, 
  ActionButtons 
} from '../components/tables';

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
  const [isHoveringCard, setIsHoveringCard] = useState(null);
  const [stats, setStats] = useState({
    totalComplaints: 1247,
    pendingComplaints: 89,
    resolvedComplaints: 1058,
    totalUsers: 3456
  });

  // Données pour les graphiques
  const complaintsChartData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Plaintes reçues',
        data: [12, 19, 8, 15, 22, 18, 25],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const statusDistributionData = {
    labels: ['En attente', 'En traitement', 'Résolues', 'Rejetées'],
    datasets: [
      {
        data: [89, 156, 1058, 44],
        backgroundColor: [
          '#f59e0b',
          '#3b82f6',
          '#10b981',
          '#ef4444',
        ],
        borderWidth: 0,
      },
    ],
  };

  const monthlyTrendsData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Plaintes',
        data: [65, 78, 90, 81, 95, 102],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Résolutions',
        data: [58, 72, 85, 79, 88, 96],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  };

  // Données pour le tableau des plaintes récentes
  const recentComplaints = [
    {
      id: 'PL-2024-001',
      title: 'Problème de facturation',
      user: 'Jean Dupont',
      status: 'En attente',
      priority: 'High',
      date: '2024-01-15',
      category: 'Facturation'
    },
    {
      id: 'PL-2024-002',
      title: 'Service client défaillant',
      user: 'Marie Martin',
      status: 'En traitement',
      priority: 'Medium',
      date: '2024-01-14',
      category: 'Service'
    },
    {
      id: 'PL-2024-003',
      title: 'Retard de livraison',
      user: 'Pierre Durand',
      status: 'Résolue',
      priority: 'Low',
      date: '2024-01-13',
      category: 'Livraison'
    }
  ];

  // Colonnes pour le tableau des plaintes
  const complaintsColumns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (value) => (
        <span className="font-mono text-sm text-gray-600">{value}</span>
      )
    },
    {
      header: 'Plainte',
      accessor: 'title',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">par {row.user}</div>
        </div>
      )
    },
    {
      header: 'Catégorie',
      accessor: 'category',
      render: (value) => (
        <Badge variant="default">{value}</Badge>
      )
    },
    {
      header: 'Statut',
      accessor: 'status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString('fr-FR')}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <ActionButtons
          onView={() => console.log('Voir:', row)}
          onEdit={() => console.log('Modifier:', row)}
          row={row}
        />
      )
    }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="fa-exclamation-circle"
          color="blue"
          title="Total des plaintes"
          value={stats.totalComplaints.toLocaleString()}
          trend="up"
          change="+12%"
          isHovering={isHoveringCard === 'total'}
          onMouseEnter={() => setIsHoveringCard('total')}
          onMouseLeave={() => setIsHoveringCard(null)}
        />
        
        <StatCard
          icon="fa-clock"
          color="yellow"
          title="En attente"
          value={stats.pendingComplaints}
          trend="down"
          change="-5%"
          isHovering={isHoveringCard === 'pending'}
          onMouseEnter={() => setIsHoveringCard('pending')}
          onMouseLeave={() => setIsHoveringCard(null)}
        />
        
        <StatCard
          icon="fa-check-circle"
          color="green"
          title="Résolues"
          value={stats.resolvedComplaints.toLocaleString()}
          trend="up"
          change="+8%"
          isHovering={isHoveringCard === 'resolved'}
          onMouseEnter={() => setIsHoveringCard('resolved')}
          onMouseLeave={() => setIsHoveringCard(null)}
        />
        
        <StatCard
          icon="fa-users"
          color="purple"
          title="Utilisateurs"
          value={stats.totalUsers.toLocaleString()}
          trend="up"
          change="+15%"
          isHovering={isHoveringCard === 'users'}
          onMouseEnter={() => setIsHoveringCard('users')}
          onMouseLeave={() => setIsHoveringCard(null)}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer 
          title="Évolution des plaintes"
          actions={
            <Button variant="outline" size="sm">
              <i className="fas fa-download mr-2"></i>
              Exporter
            </Button>
          }
        >
          <Line data={complaintsChartData} options={chartOptions} />
        </ChartContainer>

        <ChartContainer title="Répartition par statut">
          <Doughnut data={statusDistributionData} options={doughnutOptions} />
        </ChartContainer>
      </div>

      {/* Tendances mensuelles */}
      <ChartContainer 
        title="Tendances mensuelles"
        className="col-span-full"
        height="h-96"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              6 mois
            </Button>
            <Button variant="outline" size="sm">
              1 an
            </Button>
          </div>
        }
      >
        <Bar data={monthlyTrendsData} options={chartOptions} />
      </ChartContainer>

      {/* Tableau des plaintes récentes */}
      <DataTable
        title="Plaintes récentes"
        columns={complaintsColumns}
        data={recentComplaints}
        actions={
          <Button size="sm">
            <i className="fas fa-plus mr-2"></i>
            Nouvelle plainte
          </Button>
        }
      />

      {/* Activité récente */}
      <Card>
        <Card.Header>
          <Card.Title>Activité récente</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {[
              { action: 'Nouvelle plainte créée', user: 'Jean Dupont', time: 'Il y a 5 min', icon: 'fa-plus', color: 'text-blue-500' },
              { action: 'Plainte résolue', user: 'Admin', time: 'Il y a 15 min', icon: 'fa-check', color: 'text-green-500' },
              { action: 'Utilisateur inscrit', user: 'Marie Martin', time: 'Il y a 1h', icon: 'fa-user-plus', color: 'text-purple-500' },
              { action: 'Plainte mise à jour', user: 'Admin', time: 'Il y a 2h', icon: 'fa-edit', color: 'text-yellow-500' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${activity.color}`}>
                  <i className={`fas ${activity.icon} text-sm`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">par {activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
} 