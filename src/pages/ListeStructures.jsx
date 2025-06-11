import { useState } from 'react';
import { Landmark } from 'lucide-react';

const STRUCTURES_INIT = [
  { id: 1, nom: 'Gare centrale', secteur: 'Transport', description: 'Gare principale de la ville' },
  { id: 2, nom: 'Station de pompage', secteur: 'Eau', description: 'Station de traitement de l’eau' },
  { id: 3, nom: 'Centrale solaire', secteur: 'Énergie', description: 'Production d’énergie solaire' },
];

export default function ListeStructures() {
  const [structures, setStructures] = useState(STRUCTURES_INIT);
  const [search, setSearch] = useState('');

  const handleDelete = (id) => {
    setStructures(structures.filter(s => s.id !== id));
  };

  const filtres = structures.filter(s => s.nom.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl p-8 rounded-2xl shadow-xl bg-white border border-gray-100 animate-fade-in">
        <div className="flex items-center mb-6">
          <span className="bg-pink-100 p-3 rounded-xl shadow text-pink-500">
            <Landmark className="w-7 h-7" />
          </span>
          <h2 className="ml-4 text-3xl font-extrabold text-gray-800 tracking-tight">Liste des structures</h2>
        </div>
        <input
          type="text"
          placeholder="Rechercher une structure..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-6 w-full border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
        />
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Secteur</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtres.length === 0 && (
                <tr><td colSpan={4} className="text-center py-4 text-gray-400">Aucune structure trouvée.</td></tr>
              )}
              {filtres.map(s => (
                <tr key={s.id} className="hover:bg-pink-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{s.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{s.secteur}</td>
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