import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const PLAINTES_INIT = [
  { id: '#1254', type: 'Retard', secteur: 'Transport', statut: 'Résolue', date: '2025-05-25', priorite: 'Faible' },
  { id: '#1253', type: 'Fuite', secteur: 'Eau', statut: 'En traitement', date: '2025-05-24', priorite: 'Moyenne' },
  { id: '#1252', type: 'Panne', secteur: 'Énergie', statut: 'En attente', date: '2025-05-23', priorite: 'Élevée' },
  { id: '#1251', type: 'Propreté', secteur: 'Environnement', statut: 'Résolue', date: '2025-05-22', priorite: 'Faible' },
  { id: '#1250', type: 'Accès', secteur: 'Santé', statut: 'Rejetée', date: '2025-05-21', priorite: 'Moyenne' },
];

const statutColor = {
  'Résolue': 'bg-green-100 text-green-700',
  'En traitement': 'bg-blue-100 text-blue-700',
  'En attente': 'bg-yellow-100 text-yellow-700',
  'Rejetée': 'bg-red-100 text-red-700',
};

export default function ToutesPlaintes() {
  const [plaintes, setPlaintes] = useState(PLAINTES_INIT);
  const [search, setSearch] = useState('');

  const plaintesFiltrees = plaintes.filter(p =>
    p.type.toLowerCase().includes(search.toLowerCase()) ||
    p.secteur.toLowerCase().includes(search.toLowerCase()) ||
    p.statut.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-5xl p-8 rounded-2xl shadow-xl bg-white border border-gray-100 animate-fade-in">
        <div className="flex items-center mb-6">
          <span className="bg-pink-100 p-3 rounded-xl shadow text-pink-500">
            <AlertTriangle className="w-7 h-7" />
          </span>
          <h2 className="ml-4 text-3xl font-extrabold text-gray-800 tracking-tight">Toutes les plaintes</h2>
        </div>
        <input
          type="text"
          placeholder="Rechercher par type, secteur ou statut..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-6 w-full border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
        />
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Secteur</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priorité</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {plaintesFiltrees.length === 0 && (
                <tr><td colSpan={6} className="text-center py-4 text-gray-400">Aucune plainte trouvée.</td></tr>
              )}
              {plaintesFiltrees.map((p, i) => (
                <tr key={i} className="hover:bg-pink-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{p.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{p.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{p.secteur}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statutColor[p.statut]}`}>{p.statut}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{p.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{p.priorite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,2,.6,1) both; }
        `}</style>
      </div>
    </div>
  );
} 