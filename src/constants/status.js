export const COMPLAINT_STATUS = {
  PENDING: 'En attente',
  IN_PROGRESS: 'En traitement', 
  RESOLVED: 'Résolue',
  REJECTED: 'Rejetée'
};

export const STATUS_COLORS = {
  [COMPLAINT_STATUS.RESOLVED]: 'bg-green-100 text-green-700',
  [COMPLAINT_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
  [COMPLAINT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-700',
  [COMPLAINT_STATUS.REJECTED]: 'bg-red-100 text-red-700'
};

export const PRIORITY_LEVELS = {
  LOW: 'Faible',
  MEDIUM: 'Moyenne',
  HIGH: 'Élevée',
  CRITICAL: 'Critique'
};

export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.LOW]: 'bg-gray-100 text-gray-700',
  [PRIORITY_LEVELS.MEDIUM]: 'bg-yellow-100 text-yellow-700',
  [PRIORITY_LEVELS.HIGH]: 'bg-orange-100 text-orange-700',
  [PRIORITY_LEVELS.CRITICAL]: 'bg-red-100 text-red-700'
}; 