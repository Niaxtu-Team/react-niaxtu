import { useState } from 'react';
import { Target } from 'lucide-react';

const TYPES_INIT = [
  { id: 1, nom: 'Entreprise', description: 'Entreprise ou société' },
  { id: 2, nom: 'Particulier', description: 'Personne physique' },
  { id: 3, nom: 'Administration', description: 'Service public' },
];

export default function ListeTypesCible() {
  const [types, setTypes] = useState(TYPES_INIT);
  const [search, setSearch] = useState('');
  const [filterNom, setFilterNom] = useState('');
  const [filterDescription, setFilterDescription] = useState('');

  const uniqueNoms = Array.from(new Set(types.map(t => t.nom)));

  const filtres = types.filter(t => {
    const matchSearch =
      search.trim() === '' ||
      t.nom.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchNom = filterNom === '' || t.nom === filterNom;
    const matchDescription =
      filterDescription === '' || t.description.toLowerCase().includes(filterDescription.toLowerCase());
    return matchSearch && matchNom && matchDescription;
  });

  const handleDelete = (id) => {
    setTypes(types.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl p-8 rounded-2xl shadow-xl bg-white border border-gray-100 animate-fade-in">
        <div className="flex items-center mb-6">
          <span className="bg-green-100 p-3 rounded-xl shadow text-green-500">
            <Target className="w-7 h-7" />
          </span>
          <h2 className="ml-4 text-3xl font-extrabold text-gray-800 tracking-tight">Liste des types de cible</h2>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0 mb-6">
          <input
            type="text"
            placeholder="Recherche globale (nom ou description)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
          />
          <select
            value={filterNom}
            onChange={e => setFilterNom(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
          >
            <option value="">Tous les types</option>
            {uniqueNoms.map(nom => (
              <option key={nom} value={nom}>{nom}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filtrer par description"
            value={filterDescription}
            onChange={e => setFilterDescription(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
          />
        </div>
        <div className="mb-2 text-sm text-gray-500">{filtres.length} type(s) trouvé(s)</div>
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
                <tr key={t.id} className="hover:bg-green-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{t.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{t.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button onClick={() => alert('Modifier type ' + t.nom)} className="text-blue-500 hover:text-blue-700 font-semibold transition">Modifier</button>
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
