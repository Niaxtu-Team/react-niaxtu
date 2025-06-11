import { useState } from 'react';
import { Rows3 } from 'lucide-react';

const SOUS_SECTEURS_INIT = [
  { id: 1, nom: 'Bus', description: 'Transports urbains' },
  { id: 2, nom: 'Canalisations', description: "Réseaux d'eau" },
  { id: 3, nom: 'Centrale', description: "Production d'énergie" },
];

export default function ListeSousSecteurs() {
  const [sousSecteurs, setSousSecteurs] = useState(SOUS_SECTEURS_INIT);
  const [search, setSearch] = useState('');

  const handleDelete = (id) => {
    setSousSecteurs(sousSecteurs.filter(s => s.id !== id));
  };

  const filtres = sousSecteurs.filter(s => s.nom.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl p-8 rounded-2xl shadow-xl bg-white border border-gray-100 animate-fade-in">
        <div className="flex items-center mb-6">
          <span className="bg-purple-100 p-3 rounded-xl shadow text-purple-500">
            <Rows3 className="w-7 h-7" />
          </span>
          <h2 className="ml-4 text-3xl font-extrabold text-gray-800 tracking-tight">Liste des sous-secteurs</h2>
        </div>
        <input
          type="text"
          placeholder="Rechercher un sous-secteur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-6 w-full border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
        />
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtres.length === 0 && (
                <tr><td colSpan={3} className="text-center py-4 text-gray-400">Aucun sous-secteur trouvé.</td></tr>
              )}
              {filtres.map(s => (
                <tr key={s.id} className="hover:bg-purple-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{s.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{s.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 font-semibold transition">Supprimer</button>
                  </td>
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