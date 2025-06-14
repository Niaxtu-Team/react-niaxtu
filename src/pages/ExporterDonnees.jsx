import { useState } from 'react';
import { FileText, Download, Printer, Filter, FileSpreadsheet, FileDown } from 'lucide-react';

const SECTEURS = ['Tous', 'Transport', 'Eau', 'Énergie', 'Santé', 'Éducation', 'Environnement'];
const STATUTS = ['Tous', 'Résolue', 'En traitement', 'En attente', 'Rejetée'];

const DATA = [
  { id: '#1254', type: 'Retard', secteur: 'Transport', statut: 'Résolue', date: '2025-05-25' },
  { id: '#1253', type: 'Fuite', secteur: 'Eau', statut: 'En traitement', date: '2025-05-24' },
  { id: '#1252', type: 'Panne', secteur: 'Énergie', statut: 'En attente', date: '2025-05-23' },
  { id: '#1251', type: 'Propreté', secteur: 'Environnement', statut: 'Résolue', date: '2025-05-22' },
  { id: '#1250', type: 'Accès', secteur: 'Santé', statut: 'Rejetée', date: '2025-05-21' },
];

export default function ExporterDonnees() {
  const [secteur, setSecteur] = useState('Tous');
  const [statut, setStatut] = useState('Tous');
  const [search, setSearch] = useState('');

  const filtered = DATA.filter(d =>
    (secteur === 'Tous' || d.secteur === secteur) &&
    (statut === 'Tous' || d.statut === statut) &&
    (search.trim() === '' || d.type.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()))
  );

  // Fonctions fictives d'export
  const handleExport = (format) => {
    alert('Export ' + format + ' (fonctionnalité à implémenter)');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-green-50 to-white animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
          <FileText className="w-8 h-8 text-green-500" /> Générer & exporter un rapport
        </h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-bold shadow hover:bg-green-600 transition-all duration-200" onClick={() => handleExport('PDF')}><FileDown className="w-5 h-5" /> PDF</button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-bold shadow hover:bg-blue-600 transition-all duration-200" onClick={() => handleExport('Excel')}><FileSpreadsheet className="w-5 h-5" /> Excel</button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white font-bold shadow hover:bg-amber-600 transition-all duration-200" onClick={() => handleExport('CSV')}><Download className="w-5 h-5" /> CSV</button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white font-bold shadow hover:bg-gray-900 transition-all duration-200" onClick={() => handleExport('Impression')}><Printer className="w-5 h-5" /> Imprimer</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-gray-700">Filtres :</span>
          </div>
          <select value={secteur} onChange={e => setSecteur(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300">
            {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={statut} onChange={e => setStatut(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300">
            {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="text"
            placeholder="Recherche par type ou ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        <div className="mb-2 text-sm text-gray-500">{filtered.length} résultat(s) affiché(s)</div>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Secteur</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-4 text-gray-400">Aucun résultat.</td></tr>
              )}
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-green-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{d.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{d.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{d.secteur}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{d.statut}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="max-w-2xl mx-auto text-center text-gray-500 text-sm animate-fade-in">
        <p>Vous pouvez exporter les rapports dans le format de votre choix ou les imprimer directement. Les filtres vous permettent de générer des rapports personnalisés selon vos besoins.</p>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,2,.6,1) both; }
      `}</style>
    </div>
  );
} 