import { Building, Plus, Edit, Trash2 } from 'lucide-react';
import { AdminPageWrapper } from '../components/layout';
import { Button } from '../components/ui';
import { DataTable } from '../components/tables';
import { useState } from 'react';

// Données d'exemple
const SECTEURS_DATA = [
  { id: 1, nom: 'Transport', description: 'Transport public et privé', nbSousSecteurs: 5, dateCreation: '2025-01-15' },
  { id: 2, nom: 'Santé', description: 'Services de santé publique', nbSousSecteurs: 8, dateCreation: '2025-01-20' },
  { id: 3, nom: 'Éducation', description: 'Système éducatif national', nbSousSecteurs: 6, dateCreation: '2025-02-01' },
  { id: 4, nom: 'Environnement', description: 'Protection de l\'environnement', nbSousSecteurs: 4, dateCreation: '2025-02-10' },
  { id: 5, nom: 'Sécurité', description: 'Sécurité publique et ordre', nbSousSecteurs: 3, dateCreation: '2025-02-15' }
];

export default function ListeSecteurs() {
  const [secteurs] = useState(SECTEURS_DATA);

  const handleEdit = (secteur) => {
    console.log('Modifier secteur:', secteur);
  };

  const handleDelete = (secteur) => {
    console.log('Supprimer secteur:', secteur);
  };

  const columns = [
    {
      key: 'nom',
      label: 'Nom du secteur',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.description}</p>
        </div>
      )
    },
    {
      key: 'nbSousSecteurs',
      label: 'Sous-secteurs',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value} sous-secteurs
        </span>
      )
    },
    {
      key: 'dateCreation',
      label: 'Date de création',
      render: (value) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString('fr-FR')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={Edit}
            onClick={() => handleEdit(row)}
          >
            Modifier
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => handleDelete(row)}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  return (
    <AdminPageWrapper title="Gestion des secteurs">
      <div className="space-y-6">
        {/* En-tête avec actions */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">
              Gérez les secteurs d'activité et leurs sous-secteurs
            </p>
          </div>
          <Button variant="primary" icon={Plus}>
            Nouveau secteur
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total secteurs</p>
                <p className="text-2xl font-bold text-gray-900">{secteurs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sous-secteurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {secteurs.reduce((total, secteur) => total + secteur.nbSousSecteurs, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(secteurs.reduce((total, secteur) => total + secteur.nbSousSecteurs, 0) / secteurs.length)}
                </p>
                <p className="text-xs text-gray-500">sous-secteurs/secteur</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des secteurs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Liste des secteurs ({secteurs.length})
            </h3>
          </div>
          
          <DataTable
            data={secteurs}
            columns={columns}
            emptyMessage="Aucun secteur trouvé"
          />
        </div>
      </div>
    </AdminPageWrapper>
  );
} 