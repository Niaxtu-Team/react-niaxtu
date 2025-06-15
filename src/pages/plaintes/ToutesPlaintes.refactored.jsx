import { AlertTriangle, Plus } from 'lucide-react';
import { ListLayout } from '../../components/tables';
import { Button } from '../../components/ui';
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
  // Configuration des colonnes du tableau
  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (value) => generateComplaintId(value),
      className: 'font-medium text-gray-900'
    },
    {
      key: 'type',
      label: 'Type',
      className: 'text-gray-500'
    },
    {
      key: 'secteur',
      label: 'Secteur',
      className: 'text-gray-500'
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[value]}`}>
          {value}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (value) => formatDate(value),
      className: 'text-gray-500'
    },
    {
      key: 'priorite',
      label: 'Priorité',
      className: 'text-gray-500'
    }
  ];

  // Actions de la barre d'outils
  const actions = [
    <Button
      key="new"
      variant="primary"
      icon={Plus}
      onClick={() => console.log('Nouvelle plainte')}
    >
      Nouvelle plainte
    </Button>
  ];

  return (
    <ListLayout
      title="Toutes les plaintes"
      icon={AlertTriangle}
      iconColor="text-pink-500"
      iconBg="bg-pink-100"
      data={PLAINTES_DATA}
      columns={columns}
      searchFields={['type', 'secteur', 'statut']}
      searchPlaceholder="Rechercher par type, secteur ou statut..."
      emptyMessage="Aucune plainte trouvée"
      actions={actions}
    />
  );
} 
