import { useState } from 'react';
import { Clock } from 'lucide-react';

const PLAINTES_INIT = [
  { id: '#1252', type: 'Panne', secteur: 'Énergie', statut: 'En attente', date: '2025-05-23', priorite: 'Élevée' },
  { id: '#1249', type: 'Incident', secteur: 'Transport', statut: 'En attente', date: '2025-05-20', priorite: 'Moyenne' },
];

export default function PlaintesEnAttente() {
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
          <span className="bg-yellow-100 p-3 rounded-xl shadow text-yellow-600">
            <Clock className="w-7 h-7" />
          </span>
          <h2 className="ml-4 text-3xl font-extrabold text-gray-800 tracking-tight">Plaintes en attente</h2>
        </div>
        <input
          type="text"
          placeholder="Rechercher par type ou secteur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-6 w-full border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
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
                <tr><td colSpan={6} className="text-center py-4 text-gray-400">Aucune plainte en attente.</td></tr>
              )}
              {plaintesFiltrees.map((p, i) => (
                <tr key={i} className="hover:bg-yellow-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{p.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{p.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{p.secteur}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">En attente</span>
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