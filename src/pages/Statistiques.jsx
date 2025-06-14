import { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
import { CalendarDays, TrendingUp, Users, AlertTriangle } from 'lucide-react';

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

const stats = [
  { icon: <TrendingUp className="w-7 h-7 text-blue-500" />, label: 'Plaintes reçues', value: 1287, color: 'from-blue-400 to-blue-600' },
  { icon: <Users className="w-7 h-7 text-green-500" />, label: 'Utilisateurs', value: 326, color: 'from-green-400 to-green-600' },
  { icon: <AlertTriangle className="w-7 h-7 text-amber-500" />, label: 'Plaintes en attente', value: 156, color: 'from-amber-400 to-amber-600' },
  { icon: <CalendarDays className="w-7 h-7 text-purple-500" />, label: 'Plaintes résolues', value: 824, color: 'from-purple-400 to-purple-600' },
];

const lineDataSets = {
  '7j': {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Plaintes reçues',
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
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
    ],
  },
  '30j': {
    labels: Array.from({ length: 30 }, (_, i) => `J${i + 1}`),
    datasets: [
      {
        label: 'Plaintes reçues',
        data: [12, 19, 15, 27, 22, 18, 10, 14, 20, 18, 16, 19, 21, 23, 25, 22, 20, 18, 17, 19, 21, 23, 25, 22, 20, 18, 17, 19, 21, 23],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
      {
        label: 'Plaintes résolues',
        data: [8, 12, 10, 18, 15, 12, 7, 10, 13, 12, 11, 13, 15, 16, 18, 17, 15, 13, 12, 13, 15, 16, 18, 17, 15, 13, 12, 13, 15, 16],
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
    ],
  },
  'mois': {
    labels: Array.from({ length: 31 }, (_, i) => `${i + 1}`),
    datasets: [
      {
        label: 'Plaintes reçues',
        data: [10, 12, 14, 13, 15, 16, 18, 20, 19, 18, 17, 16, 15, 14, 13, 12, 14, 16, 18, 20, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
      {
        label: 'Plaintes résolues',
        data: [7, 9, 10, 11, 12, 13, 14, 15, 16, 15, 14, 13, 12, 11, 10, 9, 10, 11, 12, 13, 14, 13, 12, 11, 10, 9, 8, 7, 8, 9, 10],
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
    ],
  },
  'annee': {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Plaintes reçues',
        data: [120, 190, 170, 220, 210, 250, 300, 280, 260, 240, 230, 220],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
      {
        label: 'Plaintes résolues',
        data: [80, 120, 110, 180, 160, 200, 250, 230, 210, 200, 190, 180],
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
    ],
  },
};

const barData = {
  labels: ['Transport', 'Eau', 'Énergie', 'Santé', 'Éducation', 'Environnement'],
  datasets: [
    {
      label: 'Plaintes par secteur',
      data: [245, 198, 176, 132, 115, 98],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(51, 65, 85, 0.7)',
        'rgba(234, 179, 8, 0.7)',
        'rgba(249, 115, 22, 0.7)',
      ],
      borderRadius: 8,
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

const timeFilters = [
  { label: '7 jours', value: '7j' },
  { label: '30 jours', value: '30j' },
  { label: 'Mois en cours', value: 'mois' },
  { label: 'Année en cours', value: 'annee' },
];

// Calculs des taux à partir des données fictives
const totalPlaintes = 1287;
const plaintesResolues = 824;
const plaintesEnAttente = 156;
const plaintesRejetees = 42;

const tauxResolution = ((plaintesResolues / totalPlaintes) * 100).toFixed(1);
const tauxAttente = ((plaintesEnAttente / totalPlaintes) * 100).toFixed(1);
const tauxRejet = ((plaintesRejetees / totalPlaintes) * 100).toFixed(1);

export default function Statistiques() {
  const [selectedTime, setSelectedTime] = useState('30j');

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-white animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">Statistiques</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${s.color} rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-white relative overflow-hidden group transition-all duration-300 hover:scale-105`}
          >
            <div className="absolute right-2 top-2 opacity-10 text-7xl group-hover:opacity-20 transition-all duration-300">
              {s.icon}
            </div>
            <div className="z-10 flex flex-col items-center">
              <div className="mb-2">{s.icon}</div>
              <div className="text-3xl font-bold animate-bounce-in">{s.value}</div>
              <div className="text-lg font-semibold mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Taux pertinents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow flex flex-col items-center p-6 border-t-4 border-green-400 animate-fade-in">
          <span className="text-4xl font-bold text-green-500">{tauxResolution}%</span>
          <span className="mt-2 text-gray-700 font-semibold">Taux de résolution</span>
          <span className="text-xs text-gray-400">Plaintes résolues / reçues</span>
        </div>
        <div className="bg-white rounded-2xl shadow flex flex-col items-center p-6 border-t-4 border-amber-400 animate-fade-in">
          <span className="text-4xl font-bold text-amber-500">{tauxAttente}%</span>
          <span className="mt-2 text-gray-700 font-semibold">Taux en attente</span>
          <span className="text-xs text-gray-400">Plaintes en attente / reçues</span>
        </div>
        <div className="bg-white rounded-2xl shadow flex flex-col items-center p-6 border-t-4 border-red-400 animate-fade-in">
          <span className="text-4xl font-bold text-red-500">{tauxRejet}%</span>
          <span className="mt-2 text-gray-700 font-semibold">Taux de rejet</span>
          <span className="text-xs text-gray-400">Plaintes rejetées / reçues</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Évolution des plaintes</h2>
          <Line data={lineDataSets[selectedTime]} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          <div className="flex gap-2 justify-center mt-6">
            {timeFilters.map(f => (
              <button
                key={f.value}
                onClick={() => setSelectedTime(f.value)}
                className={`px-4 py-2 rounded-full font-semibold border transition-all duration-200 ${selectedTime === f.value ? 'bg-blue-500 text-white border-blue-500 shadow' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Répartition par statut</h2>
          <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Plaintes par secteur</h2>
        <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,2,.6,1) both; }
        .animate-bounce-in { animation: bounce-in 0.7s cubic-bezier(.4,2,.6,1) both; }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.7); }
          60% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
} 