import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const subsectors = [
  { 
    id: 1, 
    name: 'Transport routier', 
    sector: 'Transport',
    description: 'Gestion des services de transport routier',
    complaints: 145,
    status: 'active'
  },
  { 
    id: 2, 
    name: 'Transport ferroviaire', 
    sector: 'Transport',
    description: 'Gestion des services de transport ferroviaire',
    complaints: 98,
    status: 'active'
  },
  { 
    id: 3, 
    name: 'Distribution d\'eau', 
    sector: 'Eau',
    description: 'Gestion de la distribution d\'eau potable',
    complaints: 132,
    status: 'active'
  },
  { 
    id: 4, 
    name: 'Assainissement', 
    sector: 'Eau',
    description: 'Gestion des services d\'assainissement',
    complaints: 88,
    status: 'inactive'
  },
  { 
    id: 5, 
    name: 'Électricité', 
    sector: 'Énergie',
    description: 'Gestion des services d\'électricité',
    complaints: 156,
    status: 'active'
  },
  { 
    id: 6, 
    name: 'Gaz', 
    sector: 'Énergie',
    description: 'Gestion des services de gaz',
    complaints: 92,
    status: 'active'
  },
];

export default function SubsectorsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');

  const filteredSubsectors = subsectors.filter(subsector => {
    const matchesSearch = subsector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subsector.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || subsector.status === selectedStatus;
    const matchesSector = selectedSector === 'all' || subsector.sector === selectedSector;
    return matchesSearch && matchesStatus && matchesSector;
  });

  const sectors = [...new Set(subsectors.map(s => s.sector))];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sous-secteurs</h1>
        <button
          onClick={() => navigate('/admin/sous-secteurs/nouveau')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau sous-secteur
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher un sous-secteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les secteurs</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Secteur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plaintes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubsectors.map((subsector) => (
                <tr key={subsector.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subsector.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subsector.sector}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{subsector.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subsector.complaints}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      subsector.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subsector.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/admin/sous-secteurs/${subsector.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de {filteredSubsectors.length} sur {subsectors.length} sous-secteurs
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Précédent
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 