import { useState } from 'react';
import { 
  Filter, 
  X, 
  Calendar,
  Building,
  AlertTriangle,
  Target,
  Zap
} from 'lucide-react';
import { SearchBar } from '../index';

const ComplaintFilters = ({
  filters,
  onFiltersChange,
  onSearch,
  searchValue = '',
  complaintTypes = [],
  targetTypes = [],
  ministeres = [],
  showAdvanced = false,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(showAdvanced);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      status: '',
      complaintType: '',
      targetType: '',
      priority: '',
      ministereId: '',
      dateRange: ''
    });
    onSearch('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchValue !== '';

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'en-attente', label: 'En attente' },
    { value: 'en-traitement', label: 'En traitement' },
    { value: 'resolue', label: 'Résolues' },
    { value: 'rejetee', label: 'Rejetées' }
  ];

  const priorityOptions = [
    { value: '', label: 'Toutes les priorités' },
    { value: 'faible', label: 'Faible' },
    { value: 'moyenne', label: 'Moyenne' },
    { value: 'elevee', label: 'Élevée' },
    { value: 'urgente', label: 'Urgente' },
    { value: 'critique', label: 'Critique' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'Toutes les dates' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Barre de recherche principale */}
      <div className="mb-4">
        <SearchBar
          value={searchValue}
          onChange={onSearch}
          placeholder="Rechercher par description, type, citoyen..."
        />
      </div>

      {/* Filtres de base */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Statut
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priorité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Zap className="w-4 h-4 inline mr-1" />
            Priorité
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type de plainte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Type de plainte
          </label>
          <select
            value={filters.complaintType || ''}
            onChange={(e) => handleFilterChange('complaintType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les types</option>
            {complaintTypes.map(type => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Période */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Période
          </label>
          <select
            value={filters.dateRange || ''}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bouton pour afficher/masquer les filtres avancés */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Filter className="w-4 h-4 mr-1" />
          {isExpanded ? 'Masquer' : 'Afficher'} les filtres avancés
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-1" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Filtres avancés */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          {/* Type de cible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Type de cible
            </label>
            <select
              value={filters.targetType || ''}
              onChange={(e) => handleFilterChange('targetType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les types de cible</option>
              {targetTypes.map(type => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ministère */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Ministère
            </label>
            <select
              value={filters.ministereId || ''}
              onChange={(e) => handleFilterChange('ministereId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les ministères</option>
              {ministeres.map(ministere => (
                <option key={ministere.id} value={ministere.id}>
                  {ministere.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Indicateur de filtres actifs */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            <span>
              {Object.values(filters).filter(v => v !== '').length + (searchValue ? 1 : 0)} filtre(s) actif(s)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintFilters; 