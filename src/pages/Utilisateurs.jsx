import { useState } from 'react';

const UTILISATEURS_EXTERNES_INIT = [
  { id: 1, nom: 'Jean Dupont', email: 'jean.dupont@email.com', statut: 'Actif' },
  { id: 2, nom: 'Fatou Ndiaye', email: 'fatou.ndiaye@email.com', statut: 'Inactif' },
  { id: 3, nom: 'Ali Ben', email: 'ali.ben@email.com', statut: 'Actif' },
];

const ADMINS_INIT = [
  { id: 101, nom: 'Super Admin', email: 'admin@niaxtu.com', role: 'Super admin' },
  { id: 102, nom: 'Awa Ba', email: 'awa.ba@email.com', role: 'Admin' },
];

export default function Utilisateurs() {
  const [onglet, setOnglet] = useState('externes');
  const [utilisateurs, setUtilisateurs] = useState(UTILISATEURS_EXTERNES_INIT);
  const [admins, setAdmins] = useState(ADMINS_INIT);
  const [search, setSearch] = useState('');
  const [searchAdmin, setSearchAdmin] = useState('');

  // Filtres pour chaque tableau
  const filtresExternes = utilisateurs.filter(u =>
    u.nom.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.statut.toLowerCase().includes(search.toLowerCase())
  );
  const filtresAdmins = admins.filter(a =>
    a.nom.toLowerCase().includes(searchAdmin.toLowerCase()) ||
    a.email.toLowerCase().includes(searchAdmin.toLowerCase()) ||
    a.role.toLowerCase().includes(searchAdmin.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-4xl p-8 rounded-2xl shadow-xl bg-white border border-gray-100 animate-fade-in">
        <div className="flex space-x-2 mb-8">
          <button
            className={`px-6 py-2 rounded-t-lg font-bold transition-all duration-200 border-b-2 ${onglet === 'externes' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setOnglet('externes')}
          >
            Utilisateurs externes
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-bold transition-all duration-200 border-b-2 ${onglet === 'admins' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setOnglet('admins')}
          >
            Comptes admin
          </button>
        </div>
        {onglet === 'externes' && (
          <>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
              <input
                type="text"
                placeholder="Recherche (nom, email, statut)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              />
            </div>
            <div className="mb-2 text-sm text-gray-500">{filtresExternes.length} utilisateur(s) trouvé(s)</div>
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filtresExternes.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-4 text-gray-400">Aucun utilisateur trouvé.</td></tr>
                  )}
                  {filtresExternes.map(u => (
                    <tr key={u.id} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{u.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{u.statut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {onglet === 'admins' && (
          <>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
              <input
                type="text"
                placeholder="Recherche (nom, email, rôle)"
                value={searchAdmin}
                onChange={e => setSearchAdmin(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              />
              <button
                className="bg-blue-500 text-white px-5 py-3 rounded-lg font-bold shadow hover:bg-blue-600 transition-all duration-200"
                onClick={() => alert('Attribuer droits admin (fonctionnalité à implémenter)')}
              >
                Attribuer droits admin
              </button>
            </div>
            <div className="mb-2 text-sm text-gray-500">{filtresAdmins.length} admin(s) trouvé(s)</div>
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filtresAdmins.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-4 text-gray-400">Aucun admin trouvé.</td></tr>
                  )}
                  {filtresAdmins.map(a => (
                    <tr key={a.id} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{a.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{a.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{a.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 