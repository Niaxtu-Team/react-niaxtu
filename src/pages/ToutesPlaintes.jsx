import { useState } from 'react';
import { AlertTriangle, Plus, Search, Filter } from 'lucide-react';
import { AdminPageWrapper } from '../components/layout';
import { Button, Input } from '../components/ui';
import { DataTable } from '../components/tables';
import { COMPLAINT_STATUS, STATUS_COLORS } from '../constants';
import { generateComplaintId, formatDate } from '../utils';

// Données d'exemple
const PLAINTES_DATA = [
  { 
    id: 1254, 
    type: 'Retard', 
    secteur: 'Transport', 
    statut: COMPLAINT_STATUS.RESOLVED, 
    date: '2025-05-25', 
    priorite: 'Faible' 
  },
  { 
    id: 1253, 
    type: 'Fuite', 
    secteur: 'Eau', 
    statut: COMPLAINT_STATUS.IN_PROGRESS, 
    date: '2025-05-24', 
    priorite: 'Moyenne' 
  },
  { 
    id: 1252, 
    type: 'Panne', 
    secteur: 'Énergie', 
    statut: COMPLAINT_STATUS.PENDING, 
    date: '2025-05-23', 
    priorite: 'Élevée' 
  },
  { 
    id: 1251, 
    type: 'Propreté', 
    secteur: 'Environnement', 
    statut: COMPLAINT_STATUS.RESOLVED, 
    date: '2025-05-22', 
    priorite: 'Faible' 
  },
  { 
    id: 1250, 
    type: 'Accès', 
    secteur: 'Santé', 
    statut: COMPLAINT_STATUS.REJECTED, 
    date: '2025-05-21', 
    priorite: 'Moyenne' 
  },
];

export default function ToutesPlaintes() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filtrage des données
  const filteredData = PLAINTES_DATA.filter(plainte => {
    const matchesSearch = !search.trim() || 
      plainte.type.toLowerCase().includes(search.toLowerCase()) ||
      plainte.secteur.toLowerCase().includes(search.toLowerCase()) ||
      plainte.statut.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = !statusFilter || plainte.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Configuration des colonnes du tableau
  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (value) => (
        <span className="font-mono text-sm font-medium text-gray-900">
          {generateComplaintId(value)}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      className: 'font-medium text-gray-900'
    },
    {
      key: 'secteur',
      label: 'Secteur',
      className: 'text-gray-600'
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[value]}`}>
          {value}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {formatDate(value)}
        </span>
      )
    },
    {
      key: 'priorite',
      label: 'Priorité',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          value === 'Élevée' ? 'bg-red-100 text-red-800' :
          value === 'Moyenne' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const handleSearch = (name, value) => {
    setSearch(value);
  };

  return (
    <AdminPageWrapper title="Gestion des plaintes">
      <div className="space-y-6">
        {/* En-tête avec statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{PLAINTES_DATA.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">En attente</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {PLAINTES_DATA.filter(p => p.statut === COMPLAINT_STATUS.PENDING).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">En traitement</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {PLAINTES_DATA.filter(p => p.statut === COMPLAINT_STATUS.IN_PROGRESS).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Résolues</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {PLAINTES_DATA.filter(p => p.statut === COMPLAINT_STATUS.RESOLVED).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Rechercher par type, secteur ou statut..."
                value={search}
                onChange={handleSearch}
                icon={Search}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value={COMPLAINT_STATUS.PENDING}>En attente</option>
                <option value={COMPLAINT_STATUS.IN_PROGRESS}>En traitement</option>
                <option value={COMPLAINT_STATUS.RESOLVED}>Résolues</option>
                <option value={COMPLAINT_STATUS.REJECTED}>Rejetées</option>
              </select>
              
              <Button variant="outline" icon={Filter}>
                Filtres
              </Button>
              
              <Button variant="primary" icon={Plus}>
                Nouvelle plainte
              </Button>
            </div>
          </div>
        </div>

        {/* Tableau des plaintes */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Liste des plaintes ({filteredData.length})
            </h3>
          </div>
          
          <DataTable
            data={filteredData}
            columns={columns}
            emptyMessage="Aucune plainte trouvée avec ces critères"
          />
        </div>
      </div>
    </AdminPageWrapper>
  );
} 