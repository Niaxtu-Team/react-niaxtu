import { useState } from 'react';
import { Tag } from 'lucide-react';

const TYPES_INIT = [
  { id: 1, nom: 'Retard', description: 'Retard dans le service' },
  { id: 2, nom: 'Fuite', description: 'Fuite d’eau' },
  { id: 3, nom: 'Panne', description: 'Panne technique' },
];

export default function ListeTypesPlainte() {
  const [types, setTypes] = useState(TYPES_INIT);
  const [search, setSearch] = useState('');

  const handleDelete = (id) => {
    setTypes(types.filter(t => t.id !== id));
  };

  const filtres = types.filter(t => t.nom.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl p-8 rounded-2xl shadow-xl bg-white border border-gray-100 animate-fade-in">
        <div className="flex items-center mb-6">
          <span className="bg-indigo-100 p-3 rounded-xl shadow text-indigo-500">
            <Tag className="w-7 h-7" />
          </span>
          <h2 className="ml-4 text-3xl font-extrabold text-gray-800 tracking-tight">Liste des types de plainte</h2>
        </div>
        <input
          type="text"
          placeholder="Rechercher un type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-6 w-full border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
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
                <tr><td colSpan={3} className="text-center py-4 text-gray-400">Aucun type trouvé.</td></tr>
              )}
              {filtres.map(t => (
                <tr key={t.id} className="hover:bg-indigo-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{t.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{t.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 font-semibold transition">Supprimer</button>
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