// UI Components
export * from './ui';

// Layout Components
export * from './layout';

// Dashboard Components
export * from './dashboard';

// Chart Components
export * from './charts';

// Table Components
export * from './tables';

// Form Components
export * from './forms';

// Admin Components
export * from './admin';

// Legacy Components
export { default as Icons } from './Icons';

// Composants UI de base (existants)
export { default as Button } from './ui/Button';
export { default as Input } from './ui/Input';
export { default as Card } from './ui/Card';
export { default as Modal } from './ui/Modal';
export { default as Badge } from './ui/Badge';
export { default as LoadingSpinner } from './ui/LoadingSpinner';
export { default as StatsCard } from './ui/StatsCard';

// Composants de recherche et filtres (nouveaux)
export { default as SearchBar } from './search/SearchBar';
export { default as FilterPanel } from './filters/FilterPanel';

// Composants de navigation (nouveaux)
export { default as Pagination } from './navigation/Pagination';

// Composants de statut (nouveaux)
export { default as StatusBadge, PriorityBadge, RoleBadge } from './status/StatusBadge';

// Composants d'actions (nouveaux)
export { default as ActionButtons } from './actions/ActionButtons';
export { default as BulkActions } from './actions/BulkActions';

// Composants de cartes (nouveaux)
export { default as AdminCard } from './cards/AdminCard';

// Composants de tableaux (existants)
export { default as DataTable } from './tables/DataTable';
export { default as ListLayout } from './tables/ListLayout';

// Composants de dashboard (existants)
export { default as StatCard } from './dashboard/StatCard';
export { default as Board } from './dashboard/Board';

// Composants de graphiques (existants)
export { default as ChartContainer } from './charts/ChartContainer';

// Composants de formulaires (existants)
export { default as FormField } from './forms/FormField';
export { default as FormLayout } from './forms/FormLayout';
export { default as PhoneInput } from './forms/PhoneInput';

// Composants de layout (existants)
export { default as AdminLayout } from './AdminLayout';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as LoginForm } from './LoginForm';
export { default as GetUsersButton } from './GetUsersButton';

// Forms
export { default as FormBuilder } from './forms/FormBuilder';

// History
export { default as HistoryTimeline } from './history/HistoryTimeline';

// Permissions
export { default as PermissionMatrix } from './permissions/PermissionMatrix';

// Statistics
export { StatCardGrid } from './stats/StatCard';

// Configuration Components
export { default as TypeCard } from './cards/TypeCard';
export { default as TypeFormBuilder } from './forms/TypeFormBuilder';

// Structure Components
export { default as StructureCard } from './cards/StructureCard';
export { default as StructureFormBuilder } from './forms/StructureFormBuilder';
export { default as TabNavigation } from './navigation/TabNavigation';

// Complaint Components
export { default as ComplaintCard } from './cards/ComplaintCard';
export { default as ComplaintFilters } from './filters/ComplaintFilters';
export { default as ComplaintStats } from './stats/ComplaintStats'; 
