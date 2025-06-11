import { Line, Doughnut, Bar } from 'react-chartjs-2';

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

export default function Charts() {
  return (
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
  );
} 