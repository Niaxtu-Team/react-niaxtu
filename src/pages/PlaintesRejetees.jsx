import { useState } from 'react';
import { Ban } from 'lucide-react';

const PLAINTES_INIT = [
  { id: '#1250', type: 'Accès', secteur: 'Santé', statut: 'Rejetée', date: '2025-05-21', priorite: 'Moyenne' },
  { id: '#1247', type: 'Erreur', secteur: 'Énergie', statut: 'Rejetée', date: '2025-05-18', priorite: 'Faible' },
];

export default function PlaintesRejetees() {
  const [plaintes, setPlaintes] = useState(PLAINTES_INIT);
  const [search, setSearch] = useState('');

  const plaintesFiltrees = plaintes.filter(p =>
    p.type.toLowerCase().includes(search.toLowerCase()) ||
    p.secteur.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-4xl p-8 rounded-2xl shadow-xl bg-white border border-gray-100 animate-fade-in">
        <div className="flex items-center mb-6">
          <span className="bg-red-100 p-3 rounded-xl shadow text-red-500">
            <Ban className="w-7 h-7" />
          </span>
          <h2 className="ml-4 text-3xl font-extrabold text-gray-800 tracking-tight">Plaintes rejetées</h2>
        </div>
        <input
          type="text"
          placeholder="Rechercher par type ou secteur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-6 w-full border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300 transition"
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
                <tr><td colSpan={6} className="text-center py-4 text-gray-400">Aucune plainte rejetée.</td></tr>
              )}
              {plaintesFiltrees.map((p, i) => (
                <tr key={i} className="hover:bg-red-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{p.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{p.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{p.secteur}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">Rejetée</span>
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